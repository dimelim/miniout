import { Checkbox } from 'heroui-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDayLabel } from '@/lib/dates';
import { useNotes } from '@/lib/notes-store';
import type { Note } from '@/lib/notes-store';

function dueDate(note: Note) {
  const hint = note.hints.find((item) => item.kind === 'date');
  if (!hint || hint.kind !== 'date') return null;

  const created = new Date(note.createdAt);
  const due = new Date(created);
  due.setDate(due.getDate() + hint.offsetDays);
  return due;
}

function isOverdue(due: Date | null, now: Date) {
  if (!due) return false;
  return due.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export default function Dia() {
  const insets = useSafeAreaInsets();
  const { notes, toggleDone } = useNotes();
  const now = new Date();

  const scheduled = useMemo(
    () => notes.filter((note) => note.hints.some((hint) => hint.kind === 'date')),
    [notes]
  );

  const doneCount = scheduled.filter((note) => note.done).length;

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 28, lineHeight: 32, letterSpacing: -0.4 }}
        >
          {formatDayLabel(now)}
        </Text>
        <Text className="mt-1 font-sans text-muted" style={{ fontSize: 13 }}>
          {scheduled.length === 0
            ? 'Nada con fecha'
            : `${doneCount} de ${scheduled.length} hechas`}
        </Text>
      </View>

      {scheduled.length === 0 ? (
        <Text className="mt-16 px-8 text-center font-sans text-muted" style={{ fontSize: 15, lineHeight: 24 }}>
          Cuando una nota mencione un dia, aparece aqui
        </Text>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-10">
          {scheduled.map((note) => {
            const due = dueDate(note);
            const late = !note.done && isOverdue(due, now);

            return (
              <Animated.View
                key={note.id}
                entering={FadeIn.duration(180)}
                layout={LinearTransition.duration(220)}
              >
                <View className="flex-row items-start gap-3 rounded-[14px] px-2 py-3">
                  <View className="pt-0.5">
                    <Checkbox
                      isSelected={Boolean(note.done)}
                      onSelectedChange={() => toggleDone(note.id)}
                    />
                  </View>
                  <Pressable
                    onPress={() => toggleDone(note.id)}
                    className="min-w-0 flex-1"
                  >
                    <Text
                      className="font-sans text-foreground"
                      style={{
                        fontSize: 15,
                        lineHeight: 22,
                        textDecorationLine: note.done ? 'line-through' : 'none',
                        opacity: note.done ? 0.5 : 1,
                      }}
                    >
                      {note.body}
                    </Text>
                    {due && (
                      <Text
                        className="mt-1 font-sans"
                        style={{ fontSize: 11 }}
                      >
                        <Text className={late ? 'text-danger' : 'text-muted'}>
                          {late ? `vencio el ${formatDayLabel(due, now)}` : formatDayLabel(due, now)}
                        </Text>
                      </Text>
                    )}
                  </Pressable>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
