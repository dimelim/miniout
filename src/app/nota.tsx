import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aviso } from '@/components/aviso';
import { BackButton } from '@/components/back-button';
import { FormatBar, type Seleccion } from '@/components/format-bar';
import { CheckIcon } from '@/components/icons';
import { RuledPaper } from '@/components/ruled-paper';
import { ApiError } from '@/lib/api';
import { formatDayLabel, formatRelative } from '@/lib/dates';
import { detectHints } from '@/lib/hints';
import { useNotes } from '@/lib/notes-store';

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
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, accentForeground, muted, border, danger] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'border',
    'danger',
  ]);

  const pistas = useMemo(() => detectHints(cuerpo), [cuerpo]);
  const cambiado = cuerpo.trim() !== original.current.trim() && cuerpo.trim().length > 0;

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
      Keyboard.dismiss();
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo guardar el cambio');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = () => {
    Alert.alert(
      'Borrar esta nota',
      'Se va de todos tus dispositivos y no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(note.id);
              router.back();
            } catch {
              setProblema('No se pudo borrar la nota');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View
        className="flex-row items-center justify-between px-7"
        style={{ paddingTop: insets.top + 12 }}
      >
        <BackButton />

        <PressableFeedback
          onPress={() => toggle(note)}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: note.done }}
          accessibilityLabel={note.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: note.done ? accent : border,
            backgroundColor: note.done ? accent : 'transparent',
            paddingHorizontal: 12,
            paddingVertical: 7,
          }}
        >
          <PressableFeedback.Highlight />
          <CheckIcon color={note.done ? accentForeground : muted} size={13} />
          <Text
            className="font-medium"
            style={{ fontSize: 13, color: note.done ? accentForeground : muted }}
          >
            {note.done ? 'Hecha' : 'Marcar hecha'}
          </Text>
        </PressableFeedback>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
          {formatDayLabel(new Date(note.createdAt))} · {formatRelative(new Date(note.updatedAt))}
        </Text>

        <TextInput
          value={cuerpo}
          onChangeText={setCuerpo}
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
            lineHeight: 27,
            padding: 0,
            minHeight: 160,
            textAlignVertical: 'top',
          }}
        />

        {pistas.length > 0 && (
          <View className="mt-6">
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

        <View className="mt-8 gap-3">
          <Button size="lg" onPress={guardar} isDisabled={!cambiado || guardando}>
            <Button.Label>{guardando ? 'Guardando' : 'Guardar cambios'}</Button.Label>
          </Button>

          <PressableFeedback
            onPress={borrar}
            accessibilityRole="button"
            accessibilityLabel="Borrar la nota"
            style={{ alignSelf: 'center', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 }}
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
    </View>
  );
}
