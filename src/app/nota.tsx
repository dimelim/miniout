import { useLocalSearchParams, useRouter } from 'expo-router';
import { Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { Aviso } from '@/components/aviso';
import { BackButton } from '@/components/back-button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FormatBar, type Seleccion } from '@/components/format-bar';
import { CheckIcon } from '@/components/icons';
import { RuledPaper } from '@/components/ruled-paper';
import { ApiError } from '@/lib/api';
import { formatDayLabel, formatRelative } from '@/lib/dates';
import { detectHints } from '@/lib/hints';
import { useNotes } from '@/lib/notes-store';
import { estadoDeEntrega } from '@/lib/schedule';

const LISTA = /^(\s*)(- \[[ x]\] |- )(.*)$/;

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
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { find, edit, toggle, remove } = useNotes();

  const note = find(id);
  const original = useRef(note?.body ?? '');

  const [cuerpo, setCuerpo] = useState(note?.body ?? '');
  const [seleccion, setSeleccion] = useState<Seleccion>({ start: 0, end: 0 });
  const [forzada, setForzada] = useState<Seleccion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, accentForeground, muted, border, danger, warning, background] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'border',
    'danger',
    'warning',
    'background',
  ]);

  const pistas = useMemo(() => detectHints(cuerpo), [cuerpo]);
  const cambiado = cuerpo.trim() !== original.current.trim() && cuerpo.trim().length > 0;
  const entrega = estadoDeEntrega(note?.dueAt ?? null);

  useEffect(() => {
    if (!note) return;
    original.current = note.body;
  }, [note]);

  if (!note) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
          <BackButton />
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
            Esta nota ya no existe.
          </Text>
        </View>
      </View>
    );
  }

  const guardar = async () => {
    if (!cambiado) return;

    setGuardando(true);
    setProblema(null);

    try {
      await edit(note.id, cuerpo.trim());
      original.current = cuerpo.trim();
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo guardar el cambio');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    setPreguntando(false);

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

  const colorEntrega =
    entrega?.tono === 'vencido' ? danger : entrega?.tono === 'hoy' ? warning : muted;

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View
        className="flex-row items-center justify-between gap-3 px-6"
        style={{ paddingTop: insets.top + 10 }}
      >
        <PressableFeedback
          onPress={salir}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Guardar y volver"
          style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <PressableFeedback.Highlight />
          <Text className="font-medium text-muted" style={{ fontSize: 15 }}>
            {cambiado || guardando ? 'Guardar' : 'Listo'}
          </Text>
        </PressableFeedback>

        <View className="flex-row items-center gap-2">
          <PressableFeedback
            onPress={() => router.push(`/programar?id=${note.id}`)}
            accessibilityRole="button"
            accessibilityLabel={entrega ? `Programada ${entrega.etiqueta}` : 'Programar la nota'}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: entrega ? colorEntrega : border,
              paddingHorizontal: 12,
              paddingVertical: 7,
            }}
          >
            <PressableFeedback.Highlight />
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: entrega ? colorEntrega : muted,
              }}
            />
            <Text className="font-medium" style={{ fontSize: 13, color: entrega ? colorEntrega : muted }}>
              {entrega ? entrega.etiqueta : 'Sin fecha'}
            </Text>
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
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 26,
          paddingTop: 18,
          paddingBottom: insets.bottom + 120,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear rise={6}>
          <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
            {formatDayLabel(new Date(note.createdAt))} · editada {formatRelative(new Date(note.updatedAt))}
          </Text>
        </Appear>

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
          maxLength={8000}
          placeholder="Escribe algo"
          placeholderTextColor={muted}
          selectionColor={accent}
          cursorColor={accent}
          accessibilityLabel="Cuerpo de la nota"
          className="font-sans text-foreground"
          style={{
            marginTop: 14,
            fontSize: 17,
            lineHeight: 28,
            padding: 0,
            minHeight: 200,
            textAlignVertical: 'top',
            textDecorationLine: note.done ? 'line-through' : 'none',
          }}
        />

        {pistas.length > 0 && (
          <View className="mt-7">
            <Text className="mb-2 font-medium text-muted" style={{ fontSize: 12 }}>
              Lo que leo aquí
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {pistas.map((pista) => (
                <Chip key={`${pista.kind}-${pista.label}`} size="sm" variant="secondary">
                  <Chip.Label>{pista.label}</Chip.Label>
                </Chip>
              ))}
            </View>
          </View>
        )}

        {problema && <Aviso mensaje={problema} className="mt-5" />}

        <View className="mt-10 items-center">
          <PressableFeedback
            onPress={() => setPreguntando(true)}
            accessibilityRole="button"
            accessibilityLabel="Borrar la nota"
            style={{ borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 }}
          >
            <PressableFeedback.Highlight />
            <Text className="font-medium" style={{ fontSize: 14, color: danger }}>
              Borrar nota
            </Text>
          </PressableFeedback>
        </View>
      </ScrollView>

      <FormatBar
        value={cuerpo}
        selection={seleccion}
        bottomInset={insets.bottom}
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
