import { Chip, Input } from 'heroui-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/mark';
import { formatDayLabel } from '@/lib/dates';
import { detectHints } from '@/lib/hints';
import { useNotes } from '@/lib/notes-store';

export default function Captura() {
  const insets = useSafeAreaInsets();
  const { notes, addNote } = useNotes();
  const [draft, setDraft] = useState('');

  const hints = detectHints(draft);

  const commit = () => {
    const body = draft.trim();
    if (!body) return;
    addNote({ body, hints });
    setDraft('');
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center gap-2 px-5 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Mark size={20} />
        <Text className="font-medium text-muted" style={{ fontSize: 13 }}>
          {formatDayLabel(new Date())}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 gap-3"
        keyboardShouldPersistTaps="handled"
      >
        {notes.length === 0 ? (
          <Text className="mt-16 text-center font-sans text-muted" style={{ fontSize: 15 }}>
            Aquí no hay nada todavía
          </Text>
        ) : (
          notes.map((note) => (
            <Animated.View
              key={note.id}
              entering={FadeIn.duration(180)}
              layout={LinearTransition.duration(220)}
              className="rounded-[20px] bg-surface p-4 shadow-surface"
            >
              <Text className="font-sans text-foreground" style={{ fontSize: 15, lineHeight: 23 }}>
                {note.body}
              </Text>
              {note.hints.length > 0 && (
                <View className="mt-3 flex-row flex-wrap gap-1.5">
                  {note.hints.map((hint) => (
                    <Chip key={hint.label} size="sm" variant="secondary">
                      <Chip.Label>{hint.label}</Chip.Label>
                    </Chip>
                  ))}
                </View>
              )}
            </Animated.View>
          ))
        )}
      </ScrollView>

      <View
        className="border-t border-separator bg-surface px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {hints.length > 0 && (
          <Animated.View entering={FadeIn.duration(140)} className="mb-2.5 flex-row flex-wrap gap-1.5">
            {hints.map((hint) => (
              <Chip key={hint.label} size="sm" variant="secondary">
                <Chip.Label>{hint.label}</Chip.Label>
              </Chip>
            ))}
          </Animated.View>
        )}

        <Input
          value={draft}
          onChangeText={setDraft}
          placeholder="Escribe algo"
          multiline
          onSubmitEditing={commit}
          returnKeyType="done"
        />

        <Pressable
          onPress={commit}
          disabled={draft.trim().length === 0}
          className="mt-2 self-end rounded-full px-4 py-2"
          style={{ opacity: draft.trim().length === 0 ? 0.4 : 1 }}
        >
          <Text className="font-semibold text-accent-deep" style={{ fontSize: 14 }}>
            Guardar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
