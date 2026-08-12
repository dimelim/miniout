import { useRouter } from 'expo-router';
import { Spinner } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { BackButton } from '@/components/back-button';
import { NoteRow } from '@/components/note-row';
import { RuledPaper } from '@/components/ruled-paper';
import type { Note } from '@/lib/api';
import { formatDayLabel } from '@/lib/dates';
import { useNotes } from '@/lib/notes-store';

function agrupar(notes: Note[]) {
  const grupos = new Map<string, Note[]>();

  for (const note of notes) {
    const etiqueta = formatDayLabel(new Date(note.createdAt));
    grupos.set(etiqueta, [...(grupos.get(etiqueta) ?? []), note]);
  }

  return [...grupos.entries()];
}

export default function Notas() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes, isLoading, toggle } = useNotes();

  const [busqueda, setBusqueda] = useState('');

  const [muted, accent] = useThemeColor(['muted', 'accent']);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const ordenadas = [...notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (!texto) return ordenadas;

    return ordenadas.filter(
      (note) =>
        note.body.toLowerCase().includes(texto) ||
        note.hints.some((hint) => hint.label.toLowerCase().includes(texto))
    );
  }, [notes, busqueda]);

  const grupos = useMemo(() => agrupar(filtradas), [filtradas]);

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
        <BackButton label="Inicio" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 32, lineHeight: 38, letterSpacing: -0.6 }}
          >
            Todas las notas
          </Text>
          <Text className="mt-1 font-sans text-muted" style={{ fontSize: 14 }}>
            {notes.length === 1 ? '1 nota' : `${notes.length} notas`}
          </Text>
        </Appear>

        <Appear delay={70} className="mt-5">
          <View
            className="rounded-[16px] px-4 py-1"
            style={{ borderWidth: 1.5, borderColor: busqueda ? accent : 'transparent', backgroundColor: 'rgba(127,127,127,0.08)' }}
          >
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar en tus notas"
              placeholderTextColor={muted}
              selectionColor={accent}
              cursorColor={accent}
              accessibilityLabel="Buscar en tus notas"
              className="font-sans text-foreground"
              style={{ fontSize: 15, paddingVertical: 10, paddingHorizontal: 0 }}
            />
          </View>
        </Appear>

        {isLoading ? (
          <View className="items-center py-10">
            <Spinner size="sm" />
          </View>
        ) : filtradas.length === 0 ? (
          <Appear delay={120} className="mt-10">
            <Text className="font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              {busqueda
                ? `No hay nada con "${busqueda.trim()}".`
                : 'Todavía no has escrito nada. Empieza desde Inicio.'}
            </Text>
          </Appear>
        ) : (
          <Animated.View layout={LinearTransition.duration(220)} className="mt-6">
            {grupos.map(([etiqueta, delGrupo], indice) => (
              <View key={etiqueta} className={indice === 0 ? undefined : 'mt-7'}>
                <Text className="mb-1 font-medium text-muted" style={{ fontSize: 12 }}>
                  {etiqueta}
                </Text>

                {delGrupo.map((note, posicion) => (
                  <View
                    key={note.id}
                    style={{
                      borderTopWidth: posicion === 0 ? 0 : 1,
                      borderTopColor: muted + '22',
                    }}
                  >
                    <NoteRow
                      note={note}
                      onToggle={() => toggle(note)}
                      onOpen={() => router.push(`/nota?id=${note.id}`)}
                    />
                  </View>
                ))}
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
