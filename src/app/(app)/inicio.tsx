import { useFocusEffect } from 'expo-router';
import { Button, Card, Chip, PressableFeedback, Spinner } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarButton } from '@/components/avatar-button';
import { GithubBadge } from '@/components/github-card';
import { ChevronRightIcon, PlusIcon, SemesterIcon } from '@/components/icons';
import { MascotaHero } from '@/components/mascota-hero';
import { NoteRow } from '@/components/note-row';
import { NuevaVersion } from '@/components/nueva-version';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { Semana } from '@/components/semana';
import { useAuth } from '@/lib/auth-store';
import { useAbrir } from '@/lib/navigate';
import { useNotes } from '@/lib/notes-store';
import { usePeriods } from '@/lib/periods-store';
import { useProjects } from '@/lib/projects-store';
import { formatLongDate, isSameDay } from '@/lib/dates';
import { clasesDelDia } from '@/lib/periods';
import { EMPTY_PROFILE, periodWords, readProfile, type Profile } from '@/lib/profile';
import {
  DEFAULT_QUOTES,
  quoteOfTheDay,
  readQuoteSettings,
  type QuoteSettings,
} from '@/lib/quotes';

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
  const abrir = useAbrir();
  const { account } = useAuth();

  const { notes, isLoading, refresh, toggle } = useNotes();
  const { find: buscarProyecto, refresh: refrescarProyectos } = useProjects();
  const { periods, refresh: refrescarPeriodos } = usePeriods();
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [frases, setFrases] = useState<QuoteSettings>(DEFAULT_QUOTES);

  const [muted, accent, background] = useThemeColor(['muted', 'accent', 'background']);

  const ahora = useMemo(() => new Date(), []);
  const nombre = firstName(account?.displayName);
  const palabras = periodWords(perfil.stage);
  const frase = quoteOfTheDay(frases, ahora);
  const clasesHoy = useMemo(
    () =>
      periods.reduce(
        (total, periodo) =>
          total + clasesDelDia(periodo.subjects, (ahora.getDay() + 6) % 7).length,
        0
      ),
    [periods, ahora]
  );

  const cargar = useCallback(async () => {
    const [guardado, misFrases] = await Promise.all([readProfile(), readQuoteSettings()]);

    setPerfil(guardado);
    setFrases(misFrases);

    await refresh().catch(() => {});
    await refrescarProyectos().catch(() => {});
    await refrescarPeriodos().catch(() => {});
  }, [refresh, refrescarPeriodos, refrescarProyectos]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const deHoy = useMemo(() => {
    const ahora = new Date();

    return notes.filter((note) => {
      if (note.dueAt) {
        return new Date(note.dueAt).getTime() <= ahora.getTime() || isSameDay(new Date(note.dueAt), ahora);
      }

      return isSameDay(new Date(note.createdAt), ahora);
    });
  }, [notes]);
  const pendientes = deHoy.filter((note) => !note.done).length;

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

          <MascotaHero
            saludo={greeting(ahora)}
            nombre={nombre}
            pendientes={pendientes}
            clasesHoy={clasesHoy}
            frase={frase}
          />
        </Animated.View>

        <NuevaVersion />

        <Animated.View entering={FadeInDown.duration(240).delay(60)} className="mt-7">
          <PressableFeedback
            onPress={() => abrir('/nota')}
            accessibilityRole="button"
            accessibilityLabel="Escribir una nota"
            className="rounded-[24px] bg-surface p-5 shadow-surface"
          >
            <PressableFeedback.Highlight />
            <View className="flex-row items-center gap-3">
              <Text className="flex-1 font-sans text-muted" style={{ fontSize: 16 }}>
                Escribe algo
              </Text>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: accent,
                }}
              >
                <PlusIcon color={background} size={16} />
              </View>
            </View>
          </PressableFeedback>
        </Animated.View>

        <Seccion
          titulo="Hoy"
          meta={pendientes > 0 ? `${pendientes} sin hacer` : undefined}
        >
          {isLoading ? (
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
                  <NoteRow
                    note={note}
                    proyecto={buscarProyecto(note.projectId)}
                    onToggle={() => toggle(note)}
                    onOpen={() => abrir(`/nota?id=${note.id}`)}
                    onMenu={() => abrir(`/acciones?id=${note.id}`)}
                    onMover={() => abrir(`/mover?id=${note.id}`)}
                  />
                </View>
              ))}
            </Animated.View>
          )}
        </Seccion>

        <Seccion titulo={palabras.plural}>
          <View className="gap-2.5">
            {periods.map((periodo) => {
              const hoy = clasesDelDia(periodo.subjects, (new Date().getDay() + 6) % 7);

              return (
                <PressableFeedback
                  key={periodo.id}
                  onPress={() => abrir(`/semestre?id=${periodo.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${periodo.name}`}
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
                        backgroundColor: periodo.color,
                      }}
                    >
                      <ProjectIcon name={periodo.icon} color={background} size={21} />
                    </View>

                    <View className="flex-1">
                      <Text
                        className="font-display text-foreground"
                        style={{ fontSize: 20, letterSpacing: -0.3 }}
                      >
                        {periodo.name}
                      </Text>
                      <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
                        {periodo.subjects.length === 0
                          ? 'Sin materias todavía'
                          : hoy.length > 0
                            ? hoy.length === 1
                              ? '1 clase hoy'
                              : `${hoy.length} clases hoy`
                            : `${periodo.subjects.length} ${periodo.subjects.length === 1 ? 'materia' : 'materias'}`}
                      </Text>
                    </View>

                    <ChevronRightIcon color={muted} size={16} />
                  </View>

                  {hoy.length > 0 ? (
                    <View className="mt-3 flex-row flex-wrap gap-1.5">
                      {hoy.slice(0, MAX_CHIPS).map(({ subject, clase }) => (
                        <Chip key={clase.id} size="sm" variant="secondary">
                          <Chip.Label>{`${clase.inicio} ${subject.name}`}</Chip.Label>
                        </Chip>
                      ))}
                    </View>
                  ) : (
                    periodo.subjects.length > 0 && (
                      <View className="mt-3 flex-row flex-wrap gap-1.5">
                        {periodo.subjects.slice(0, MAX_CHIPS).map((subject) => (
                          <Chip key={subject.id} size="sm" variant="secondary">
                            <Chip.Label>{subject.name}</Chip.Label>
                          </Chip>
                        ))}
                        {periodo.subjects.length > MAX_CHIPS && (
                          <Chip size="sm" variant="tertiary">
                            <Chip.Label>{`+${periodo.subjects.length - MAX_CHIPS}`}</Chip.Label>
                          </Chip>
                        )}
                      </View>
                    )
                  )}
                </PressableFeedback>
              );
            })}

            <Button
              variant="tertiary"
              size="md"
              onPress={() => abrir('/nuevo-periodo')}
              accessibilityLabel={palabras.one}
            >
              <PlusIcon color={muted} size={15} />
              <Button.Label>{palabras.one}</Button.Label>
            </Button>
          </View>
        </Seccion>

        <Seccion titulo="Tu semana">
          <Semana
            periods={periods}
            notes={notes}
            onAbrirNota={(nota) => abrir(`/nota?id=${nota}`)}
            onAbrirPeriodo={(periodo) => abrir(`/semestre?id=${periodo}`)}
          />
        </Seccion>

        <Seccion titulo="Frase del día">
          <PressableFeedback
            onPress={() => abrir('/frases')}
            accessibilityRole="button"
            accessibilityLabel="Cambiar las frases"
            className="rounded-[24px] bg-surface-secondary p-5"
          >
            <PressableFeedback.Highlight />
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 21, lineHeight: 30, letterSpacing: -0.3 }}
            >
              {frase.texto}
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
              <View style={{ height: 4, width: 42, borderRadius: 999, backgroundColor: accent }} />
              <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
                {frase.autor ?? 'De Miniout'}
              </Text>
            </View>
          </PressableFeedback>
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
