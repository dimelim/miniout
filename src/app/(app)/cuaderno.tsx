import { useRouter } from 'expo-router';
import { Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatRelative } from '@/lib/dates';
import { useNotes } from '@/lib/notes-store';
import type { Note } from '@/lib/notes-store';

const SIN_MATERIA = 'sin materia';

function groupBySubject(notes: Note[]) {
  const groups = new Map<string, Note[]>();

  for (const note of notes) {
    const subject = note.hints.find((hint) => hint.kind === 'subject');
    const key = subject ? subject.label : SIN_MATERIA;
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(note);
    } else {
      groups.set(key, [note]);
    }
  }

  return [...groups.entries()].sort((a, b) => {
    if (a[0] === SIN_MATERIA) return 1;
    if (b[0] === SIN_MATERIA) return -1;
    return b[1].length - a[1].length;
  });
}

export default function Cuaderno() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes } = useNotes();
  const surface = useThemeColor('surface');

  const groups = useMemo(() => groupBySubject(notes), [notes]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 28, lineHeight: 32, letterSpacing: -0.4 }}
        >
          Cuaderno
        </Text>
        <Text className="mt-1 font-sans text-muted" style={{ fontSize: 13 }}>
          {notes.length === 1 ? '1 nota' : `${notes.length} notas`}
        </Text>
      </View>

      {groups.length === 0 ? (
        <Text className="mt-16 text-center font-sans text-muted" style={{ fontSize: 15 }}>
          Aquí no hay nada todavía
        </Text>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-10 gap-7">
          {groups.map(([subject, items]) => (
            <View key={subject} className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-foreground" style={{ fontSize: 15 }}>
                  {subject}
                </Text>
                <Chip size="sm" variant="tertiary">
                  <Chip.Label>{items.length}</Chip.Label>
                </Chip>
              </View>

              {items.map((note) => (
                <Animated.View key={note.id} entering={FadeIn.duration(180)}>
                  <PressableFeedback
                    onPress={() => router.push('/captura')}
                    accessibilityRole="button"
                    accessibilityLabel={note.body}
                    style={{
                      borderRadius: 14,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: surface,
                    }}
                  >
                    <PressableFeedback.Highlight />
                    <Text
                      numberOfLines={2}
                      className="font-sans text-foreground"
                      style={{ fontSize: 14, lineHeight: 21 }}
                    >
                      {note.body}
                    </Text>
                    <Text className="mt-1 font-sans text-muted" style={{ fontSize: 11 }}>
                      {formatRelative(new Date(note.createdAt))}
                    </Text>
                  </PressableFeedback>
                </Animated.View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
