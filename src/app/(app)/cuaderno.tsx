import { useRouter } from 'expo-router';
import { Chip } from 'heroui-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
          Aqui no hay nada todavia
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
                  <Pressable
                    onPress={() => router.push('/captura')}
                    className="rounded-[14px] bg-surface px-4 py-3"
                  >
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
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
