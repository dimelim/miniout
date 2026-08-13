import { useLocalSearchParams, useRouter } from 'expo-router';
import { Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { Aviso } from '@/components/aviso';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FormatBar, type Seleccion } from '@/components/format-bar';
import {
  CheckIcon,
  ChevronLeftIcon,
  GradeIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/icons';
import { NoteImage } from '@/components/note-image';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { ApiError, type Note, type NoteImage as Imagen } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { formatDayLabel, formatRelative } from '@/lib/dates';
import { useDictado } from '@/lib/dictation';
import { gradeLabel, gradeTone } from '@/lib/grades';
import { detectHints } from '@/lib/hints';
import { elegirImagen, subirImagen, type Origen } from '@/lib/images';
import { useAbrir } from '@/lib/navigate';
import { puedeUsarImagenes } from '@/lib/native';
import { useNotes } from '@/lib/notes-store';
import { EMPTY_PROFILE, readProfile, type Profile } from '@/lib/profile';
import { useProjects } from '@/lib/projects-store';
import { estadoDeEntrega } from '@/lib/schedule';

const LISTA = /^(\s*)(- \[[ x]\] |- )(.*)$/;
const MINIATURA = 132;

function continuarLista(anterior: string, siguiente: string) {
  if (siguiente.length <= anterior.length || !siguiente.startsWith(anterior)) return null;
  if (!siguiente.slice(anterior.length).startsWith('\n')) return null;

  const lineas = anterior.split('\n');
  const ultima = lineas[lineas.length - 1];
  const marca = ultima.match(LISTA);

  if (!marca) return null;

  if (!marca[3].trim()) {
    return `${lineas.slice(0, -1).join('\n')}${lineas.length > 1 ? '\n' : ''}`;
  }

  return `${siguiente}${marca[1]}${marca[2].replace('[x]', '[ ]')}`;
}

export default function Nota() {
  const router = useRouter();
  const abrir = useAbrir();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();
  const { find, create, edit, toggle, remove } = useNotes();
  const { find: buscarProyecto } = useProjects();

  const [creada, setCreada] = useState<Note | null>(null);
  const note = find(id) ?? creada;

  const original = useRef({ title: note?.title ?? '', body: note?.body ?? '' });

  const [titulo, setTitulo] = useState(note?.title ?? '');
  const [cuerpo, setCuerpo] = useState(note?.body ?? '');
  const [seleccion, setSeleccion] = useState<Seleccion>({ start: 0, end: 0 });
  const [forzada, setForzada] = useState<Seleccion | null>(null);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, accentForeground, muted, border, danger, warning, success, foreground] =
    useThemeColor([
      'accent',
      'accent-foreground',
      'muted',
      'border',
      'danger',
      'warning',
      'success',
      'foreground',
    ]);

  const dictar = useCallback((texto: string) => {
    setCuerpo((actual) => (actual.trim() ? `${actual.trimEnd()} ${texto}` : texto));
  }, []);

  const dictado = useDictado(dictar);
  const conAdjuntos = useMemo(() => puedeUsarImagenes(), []);

  const pistas = useMemo(() => detectHints(cuerpo), [cuerpo]);
  const cambiado =
    cuerpo.trim() !== original.current.body.trim() ||
    titulo.trim() !== original.current.title.trim();
  const entrega = estadoDeEntrega(note?.dueAt ?? null);
  const proyecto = buscarProyecto(note?.projectId);

  useEffect(() => {
    readProfile().then(setPerfil);
  }, []);

  useEffect(() => {
    if (!note) return;
    original.current = { title: note.title ?? '', body: note.body };
  }, [note]);

  const guardar = useCallback(async () => {
    const limpioCuerpo = cuerpo.trim();
    const limpioTitulo = titulo.trim();

    if (!limpioCuerpo && !limpioTitulo) return null;
    if (
      limpioCuerpo === original.current.body.trim() &&
      limpioTitulo === original.current.title.trim()
    ) {
      return note;
    }

    setGuardando(true);
    setProblema(null);

    try {
      const patch = { title: limpioTitulo || null, body: limpioCuerpo };
      const guardada = note ? await edit(note.id, patch) : await create(patch);

      if (!note) {
        setCreada(guardada);
        router.setParams({ id: guardada.id });
      }

      original.current = { title: limpioTitulo, body: limpioCuerpo };

      return guardada;
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo guardar el cambio');
      return null;
    } finally {
      setGuardando(false);
    }
  }, [create, cuerpo, edit, note, titulo]);

  const borrar = async () => {
    setPreguntando(false);

    if (!note) {
      router.back();
      return;
    }

    try {
      await remove(note.id);
      router.back();
    } catch {
      setProblema('No se pudo borrar la nota');
    }
  };

  const salir = async () => {
    await guardar();
    Keyboard.dismiss();
    router.back();
  };

  const adjuntar = async (origen: Origen) => {
    if (!session) return;

    const asset = await elegirImagen(origen);
    if (!asset) return;

    setSubiendo(true);
    setProblema(null);

    try {
      const destino = note ?? (await guardar());

      if (!destino) {
        setProblema('Escribe algo antes de meter una imagen');
        return;
      }

      const imagen = await subirImagen(asset, session.accessToken);
      setCreada(await edit(destino.id, { media: [...destino.media, imagen] }));
    } catch (error) {
      setProblema(error instanceof Error ? error.message : 'No se pudo subir la imagen');
    } finally {
      setSubiendo(false);
    }
  };

  if (!note && id) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-6" style={{ paddingTop: insets.top + 12 }}>
          <Volver onPress={() => router.back()} color={foreground} />
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
            Esta nota ya no existe.
          </Text>
        </View>
      </View>
    );
  }

  const colorEntrega =
    entrega?.tono === 'vencido' ? danger : entrega?.tono === 'hoy' ? warning : muted;

  const tono = note?.grade !== null && note?.grade !== undefined ? gradeTone(note.grade, perfil) : null;
  const colorNota = tono === 'bajo' ? danger : tono === 'justo' ? warning : success;

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View
        className="flex-row items-center justify-between gap-3"
        style={{ paddingTop: insets.top + 10, paddingHorizontal: 22 }}
      >
        <PressableFeedback
          onPress={salir}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Guardar y volver"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            borderRadius: 999,
            paddingLeft: 6,
            paddingRight: 14,
            paddingVertical: 8,
          }}
        >
          <PressableFeedback.Highlight />
          <ChevronLeftIcon color={muted} size={18} />
          <Text className="font-medium text-muted" style={{ fontSize: 15 }}>
            {cambiado || guardando ? 'Guardar' : 'Listo'}
          </Text>
        </PressableFeedback>

        {note && (
          <View className="flex-row items-center gap-2">
            <PressableFeedback
              onPress={() => setPreguntando(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Borrar la nota"
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <PressableFeedback.Highlight />
              <TrashIcon color={danger} size={16} />
            </PressableFeedback>

            <PressableFeedback
              onPress={() => toggle(note)}
              hitSlop={8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: note.done }}
              accessibilityLabel={note.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: note.done ? accent : border,
                backgroundColor: note.done ? accent : 'transparent',
              }}
            >
              <PressableFeedback.Highlight />
              <CheckIcon color={note.done ? accentForeground : muted} size={15} />
            </PressableFeedback>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 14,
          paddingBottom: insets.bottom + 150,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear rise={6}>
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            onBlur={guardar}
            placeholder="Título"
            placeholderTextColor={muted}
            selectionColor={accent}
            cursorColor={accent}
            maxLength={120}
            accessibilityLabel="Título de la nota"
            className="font-display text-foreground"
            style={{ fontSize: 27, lineHeight: 34, letterSpacing: -0.5, padding: 0 }}
          />

          <Text className="mt-1 font-medium text-muted" style={{ fontSize: 12 }}>
            {note
              ? `${formatDayLabel(new Date(note.createdAt))} · editada ${formatRelative(new Date(note.updatedAt))}`
              : 'Nota nueva'}
          </Text>
        </Appear>

        {note && (
          <View className="mt-4 flex-row flex-wrap items-center gap-2">
            <Etiqueta
              onPress={() => abrir(`/mover?id=${note.id}`)}
              etiqueta={proyecto ? proyecto.name : 'Sin proyecto'}
              color={proyecto ? proyecto.color : border}
              texto={proyecto ? foreground : muted}
              icono={
                proyecto ? (
                  <ProjectIcon name={proyecto.icon} color={proyecto.color} size={13} />
                ) : (
                  <PlusIcon color={muted} size={12} />
                )
              }
            />

            <Etiqueta
              onPress={() => abrir(`/programar?id=${note.id}`)}
              etiqueta={entrega ? entrega.etiqueta : 'Sin fecha'}
              color={entrega ? colorEntrega : border}
              texto={entrega ? colorEntrega : muted}
            />

            <Etiqueta
              onPress={() => abrir(`/calificar?id=${note.id}`)}
              etiqueta={note.grade === null ? 'Calificar' : gradeLabel(note.grade, perfil)}
              color={note.grade === null ? border : colorNota}
              texto={note.grade === null ? muted : foreground}
              icono={<GradeIcon color={note.grade === null ? muted : colorNota} size={13} />}
            />
          </View>
        )}

        <View className="mt-4 rounded-[24px] bg-surface px-5 py-4 shadow-surface">
          <TextInput
            value={cuerpo}
            onChangeText={(texto) => {
              const continuado = continuarLista(cuerpo, texto);
              setCuerpo(continuado ?? texto);
            }}
            onBlur={guardar}
            selection={forzada ?? undefined}
            onSelectionChange={(event) => {
              setSeleccion(event.nativeEvent.selection);
              if (forzada) setForzada(null);
            }}
            multiline
            autoFocus={!note}
            maxLength={8000}
            placeholder="Escribe algo"
            placeholderTextColor={muted}
            selectionColor={accent}
            cursorColor={accent}
            accessibilityLabel="Cuerpo de la nota"
            className="font-sans text-foreground"
            style={{
              fontSize: 17,
              lineHeight: 28,
              padding: 0,
              minHeight: 200,
              textAlignVertical: 'top',
              textDecorationLine: note?.done ? 'line-through' : 'none',
            }}
          />

          {(note?.media.length ?? 0) > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-1 mt-4"
              contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
            >
              {note?.media.map((imagen: Imagen) => (
                <PressableFeedback
                  key={imagen.name}
                  onPress={() => abrir(`/imagen?id=${note.id}&name=${imagen.name}`)}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir la imagen"
                  style={{ borderRadius: 18 }}
                >
                  <NoteImage imagen={imagen} width={MINIATURA} height={MINIATURA} />
                </PressableFeedback>
              ))}
            </ScrollView>
          )}

          {subiendo && (
            <Text className="mt-3 font-medium text-muted" style={{ fontSize: 13 }}>
              Subiendo la imagen
            </Text>
          )}

          {pistas.length > 0 && (
            <View className="mt-4 flex-row flex-wrap gap-1.5 border-t border-border pt-3">
              {pistas.map((pista) => (
                <Chip key={`${pista.kind}-${pista.label}`} size="sm" variant="secondary">
                  <Chip.Label>{pista.label}</Chip.Label>
                </Chip>
              ))}
            </View>
          )}
        </View>

        {dictado.escuchando && (
          <Text className="mt-4 text-center font-medium" style={{ fontSize: 13, color: danger }}>
            Te escucho. Habla y toca el micrófono para parar.
          </Text>
        )}

        {dictado.problema && <Aviso mensaje={dictado.problema} className="mt-4" />}
        {problema && <Aviso mensaje={problema} className="mt-4" />}
      </ScrollView>

      <FormatBar
        value={cuerpo}
        selection={seleccion}
        bottomInset={insets.bottom}
        conAdjuntos={conAdjuntos}
        conDictado={dictado.disponible}
        dictando={dictado.escuchando}
        onImagen={() => adjuntar('galeria')}
        onCamara={() => adjuntar('camara')}
        onDictar={() => (dictado.escuchando ? dictado.parar() : dictado.arrancar())}
        onChange={(texto, sel) => {
          setCuerpo(texto);
          setForzada(sel);
        }}
      />

      <ConfirmDialog
        visible={preguntando}
        titulo="Borrar esta nota"
        mensaje="Se va de todos tus dispositivos y no se puede deshacer."
        confirmar="Borrar la nota"
        onConfirm={borrar}
        onCancel={() => setPreguntando(false)}
      />
    </View>
  );
}

function Volver({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <PressableFeedback
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      style={{ alignSelf: 'flex-start', borderRadius: 999, padding: 8 }}
    >
      <PressableFeedback.Highlight />
      <ChevronLeftIcon color={color} size={20} />
    </PressableFeedback>
  );
}

function Etiqueta({
  onPress,
  etiqueta,
  color,
  texto,
  icono,
}: {
  onPress: () => void;
  etiqueta: string;
  color: string;
  texto: string;
  icono?: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: color,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
    >
      <PressableFeedback.Highlight />
      {icono}
      <Text className="font-medium" style={{ fontSize: 13, color: texto }}>
        {etiqueta}
      </Text>
    </PressableFeedback>
  );
}
