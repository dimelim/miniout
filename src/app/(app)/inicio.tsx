import { useFocusEffect, useRouter } from 'expo-router';
import { Button, Card, Chip, PressableFeedback, Spinner } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useMemo, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { AvatarButton } from '@/components/avatar-button';
import { GithubBadge } from '@/components/github-card';
import { ChevronRightIcon, PlusIcon, SemesterIcon } from '@/components/icons';
import { InkDrop } from '@/components/ink-drop';
import { NoteRow } from '@/components/note-row';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { ApiError, api, type Note } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { formatLongDate, isSameDay } from '@/lib/dates';
import { detectHints } from '@/lib/hints';
import { EMPTY_PROFILE, periodWords, readProfile, type Profile } from '@/lib/profile';
import {
  DEFAULT_QUOTES,
  quoteOfTheDay,
  readQuoteSettings,
  type QuoteSettings,
} from '@/lib/quotes';
import { readSemesters, type Semester } from '@/lib/semesters';

const MAX_CHIPS = 4;

function greeting(now: Date) {
  const hour = now.getHours();

  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function firstName(displayName: string | null | undefined) {
  return displayName?.trim().split(/\s+/)[0] ?? '';
}

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { account, session, markIntroSeen } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [frases, setFrases] = useState<QuoteSettings>(DEFAULT_QUOTES);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  const [muted, danger, accent, background] = useThemeColor([
    'muted',
    'danger',
    'accent',
    'background',
  ]);

  const ahora = useMemo(() => new Date(), []);
  const nombre = firstName(account?.displayName);
  const pistas = useMemo(() => detectHints(texto), [texto]);
  const palabras = periodWords(perfil.stage);
  const frase = quoteOfTheDay(frases, ahora);

  const cargar = useCallback(async () => {
    const [locales, guardado, misFrases] = await Promise.all([
      readSemesters(),
      readProfile(),
      readQuoteSettings(),
    ]);

    setSemesters(locales);
    setPerfil(guardado);
    setFrases(misFrases);

    if (!session) {
      setCargando(false);
      return;
    }

    try {
      const payload = await api.notes(session.accessToken);
      setNotes(payload.notes.filter((note) => !note.deletedAt));
    } catch {
      setProblema(null);
    } finally {
      setCargando(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const deHoy = useMemo(
    () => notes.filter((note) => isSameDay(new Date(note.createdAt), new Date())),
    [notes]
  );
  const pendientes = deHoy.filter((note) => !note.done).length;

  const guardar = async () => {
    const body = texto.trim();

    if (!body || !session) return;

    setGuardando(true);
    setProblema(null);

    try {
      const note = await api.createNote(session.accessToken, { body, hints: pistas });
      setNotes((current) => [note, ...current]);
      setTexto('');
      Keyboard.dismiss();
    } catch (error) {
      setProblema(
        error instanceof ApiError ? error.message : 'No se pudo guardar. Vuelve a intentarlo.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const alternar = async (note: Note) => {
    const done = !note.done;

    setNotes((current) =>
      current.map((item) => (item.id === note.id ? { ...item, done } : item))
    );

    if (!session) return;

    try {
      await api.updateNote(session.accessToken, note.id, { done });
    } catch {
      setNotes((current) =>
        current.map((item) => (item.id === note.id ? { ...item, done: note.done } : item))
      );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(240)}>
          <View className="flex-row items-center gap-3">
            <Text
              className="flex-1 font-medium text-muted"
              style={{ fontSize: 12, letterSpacing: 0.2 }}
            >
              {formatLongDate(ahora)}
            </Text>
            <GithubBadge />
            <AvatarButton />
          </View>

          <View className="mt-3 flex-row items-center justify-between gap-4">
            <Text
              className="flex-1 font-display text-foreground"
              style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
            >
              {nombre ? `${greeting(ahora)}, ${nombre}` : greeting(ahora)}
            </Text>
            <InkDrop size={44} mood={pendientes === 0 && deHoy.length > 0 ? 'happy' : 'idle'} />
          </View>
        </Animated.View>

        {account && !account.introSeen && (
          <Appear delay={120} className="mt-6">
            <Card className="flex-row items-start gap-4">
              <InkDrop size={40} mood="happy" />

              <View className="flex-1">
                <Text
                  className="font-display text-foreground"
                  style={{ fontSize: 19, lineHeight: 26, letterSpacing: -0.3 }}
                >
                  Esto es Miniout
                </Text>
                <Text
                  className="mt-1.5 font-sans text-muted"
                  style={{ fontSize: 14, lineHeight: 21 }}
                >
                  Escribe abajo lo que sea, como en una libreta. Si nombras una materia o un
                  día, te lo propongo en un chip y lo dejo donde toca. Yo vivo aquí arriba.
                </Text>

                <View className="mt-3 flex-row">
                  <Button size="sm" variant="tertiary" onPress={markIntroSeen}>
                    <Button.Label>Entendido</Button.Label>
                  </Button>
                </View>
              </View>
            </Card>
          </Appear>
        )}

        <Animated.View entering={FadeInDown.duration(240).delay(60)} className="mt-7">
          <Card className="gap-3">
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribe algo"
              placeholderTextColor={muted}
              selectionColor={accent}
              cursorColor={accent}
              multiline
              maxLength={8000}
              accessibilityLabel="Escribe una nota"
              className="font-sans text-foreground"
              style={{
                fontSize: 16,
                lineHeight: 24,
                minHeight: 52,
                padding: 0,
                textAlignVertical: 'top',
              }}
            />

            {texto.trim().length > 0 && (
              <Animated.View
                entering={FadeIn.duration(160)}
                exiting={FadeOut.duration(120)}
                className="flex-row items-center justify-between gap-3"
              >
                <View className="flex-1 flex-row flex-wrap gap-1.5">
                  {pistas.map((pista) => (
                    <Chip key={`${pista.kind}-${pista.label}`} size="sm" variant="secondary">
                      <Chip.Label>{pista.label}</Chip.Label>
                    </Chip>
                  ))}
                </View>

                <Button size="sm" onPress={guardar} isDisabled={guardando}>
                  <Button.Label>{guardando ? 'Guardando' : 'Guardar'}</Button.Label>
                </Button>
              </Animated.View>
            )}
          </Card>

          {problema && (
            <Animated.View entering={FadeIn.duration(180)} accessibilityLiveRegion="polite">
              <Text className="mt-2" style={{ fontSize: 13, lineHeight: 19, color: danger }}>
                {problema}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        <Seccion titulo="Hoy" meta={pendientes > 0 ? `${pendientes} sin hacer` : undefined}>
          {cargando ? (
            <View className="items-center py-6">
              <Spinner size="sm" />
            </View>
          ) : deHoy.length === 0 ? (
            <Text className="font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              Lo que escribas hoy aparece aquí. Si mencionas un día, se va al que toca.
            </Text>
          ) : (
            <Animated.View layout={LinearTransition.duration(220)}>
              {deHoy.map((note, position) => (
                <View
                  key={note.id}
                  style={{
                    borderTopWidth: position === 0 ? 0 : 1,
                    borderTopColor: muted + '22',
                  }}
                >
                  <NoteRow note={note} onToggle={() => alternar(note)} />
                </View>
              ))}
            </Animated.View>
          )}
        </Seccion>

        <Seccion titulo={palabras.plural}>
          <View className="gap-2.5">
            {semesters.map((semester) => (
              <PressableFeedback
                key={semester.id}
                onPress={() => router.push(`/semestre?id=${semester.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${semester.name}`}
                className="rounded-[24px] bg-surface p-4 shadow-surface"
              >
                <PressableFeedback.Highlight />

                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: semester.color,
                    }}
                  >
                    <ProjectIcon name={semester.icon} color={background} size={21} />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="font-display text-foreground"
                      style={{ fontSize: 20, letterSpacing: -0.3 }}
                    >
                      {semester.name}
                    </Text>
                    <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
                      {semester.subjects.length === 0
                        ? 'Sin materias todavía'
                        : `${semester.subjects.length} ${semester.subjects.length === 1 ? 'materia' : 'materias'}`}
                    </Text>
                  </View>

                  <ChevronRightIcon color={muted} size={16} />
                </View>

                {semester.subjects.length > 0 && (
                  <View className="mt-3 flex-row flex-wrap gap-1.5">
                    {semester.subjects.slice(0, MAX_CHIPS).map((subject) => (
                      <Chip key={subject.id} size="sm" variant="secondary">
                        <Chip.Label>{subject.name}</Chip.Label>
                      </Chip>
                    ))}
                    {semester.subjects.length > MAX_CHIPS && (
                      <Chip size="sm" variant="tertiary">
                        <Chip.Label>{`+${semester.subjects.length - MAX_CHIPS}`}</Chip.Label>
                      </Chip>
                    )}
                  </View>
                )}
              </PressableFeedback>
            ))}

            <Button
              variant="tertiary"
              size="md"
              onPress={() => router.push('/nuevo-periodo')}
              accessibilityLabel={palabras.one}
            >
              <PlusIcon color={muted} size={15} />
              <Button.Label>{palabras.one}</Button.Label>
            </Button>
          </View>
        </Seccion>

        <Seccion titulo="Frase del día">
          <PressableFeedback
            onPress={() => router.push('/frases')}
            accessibilityRole="button"
            accessibilityLabel="Cambiar las frases"
            className="rounded-[24px] bg-surface-secondary p-5"
          >
            <PressableFeedback.Highlight />
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 21, lineHeight: 30, letterSpacing: -0.3 }}
            >
              {frase}
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
              <View style={{ height: 4, width: 42, borderRadius: 999, backgroundColor: accent }} />
              <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
                {frases.source === 'propias' && frases.own.length > 0 ? 'Tuyas' : 'De Miniout'}
              </Text>
            </View>
          </PressableFeedback>
        </Seccion>

        <Seccion titulo="Pronto">
          <Card variant="transparent" className="gap-2 border border-border p-4">
            <View className="flex-row items-center gap-2.5">
              <SemesterIcon color={muted} size={16} />
              <Text className="flex-1 font-medium text-foreground" style={{ fontSize: 15 }}>
                {palabras.importTitle}
              </Text>
            </View>
            <Text className="font-sans text-muted" style={{ fontSize: 13, lineHeight: 20 }}>
              {palabras.importHint}
            </Text>
          </Card>
        </Seccion>
      </ScrollView>
    </View>
  );
}

type SeccionProps = {
  titulo: string;
  meta?: string;
  children: React.ReactNode;
};

function Seccion({ titulo, meta, children }: SeccionProps) {
  return (
    <View className="mt-9">
      <View className="mb-3 flex-row items-baseline justify-between gap-3">
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 20, letterSpacing: -0.3 }}
        >
          {titulo}
        </Text>
        {meta && (
          <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
            {meta}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}
