import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CheckIcon } from './icons';
import { RichText } from './rich-text';

import type { Note } from '@/lib/api';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const DURATION = 220;

type NoteRowProps = {
  note: Note;
  onToggle: () => void;
  onOpen: () => void;
  lineas?: number;
};

export function NoteRow({ note, onToggle, onOpen, lineas = 4 }: NoteRowProps) {
  const [accent, accentForeground, border, muted] = useThemeColor([
    'accent',
    'accent-foreground',
    'border',
    'muted',
  ]);

  const done = useSharedValue(note.done ? 1 : 0);

  useEffect(() => {
    done.value = withTiming(note.done ? 1 : 0, { duration: DURATION, easing: EASE });
  }, [note.done, done]);

  const box = useAnimatedStyle(() => ({
    backgroundColor: done.value > 0.5 ? accent : 'transparent',
    borderColor: done.value > 0.5 ? accent : border,
    transform: [{ scale: 1 + done.value * 0.06 }],
  }));

  const mark = useAnimatedStyle(() => ({
    opacity: done.value,
    transform: [{ scale: 0.5 + done.value * 0.5 }],
  }));

  const cuerpo = useAnimatedStyle(() => ({ opacity: 1 - done.value * 0.45 }));

  return (
    <View className="flex-row items-start gap-3 py-3">
      <PressableFeedback
        onPress={onToggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: note.done }}
        accessibilityLabel={note.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        style={{ borderRadius: 999, marginTop: 1 }}
      >
        <Animated.View
          style={[
            {
              width: 22,
              height: 22,
              borderRadius: 8,
              borderWidth: 1.5,
              alignItems: 'center',
              justifyContent: 'center',
            },
            box,
          ]}
        >
          <Animated.View style={mark}>
            <CheckIcon color={accentForeground} size={13} />
          </Animated.View>
        </Animated.View>
      </PressableFeedback>

      <PressableFeedback
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={note.body}
        style={{ flex: 1, borderRadius: 12 }}
      >
        <PressableFeedback.Highlight />
        <Animated.View style={cuerpo}>
          <RichText value={note.body} size={15} lineas={lineas} />

          {note.hints.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-1.5">
              {note.hints.map((hint) => (
                <View
                  key={`${hint.kind}-${hint.label}`}
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: border,
                    paddingHorizontal: 8,
                    paddingVertical: 1,
                  }}
                >
                  <Text className="font-medium" style={{ fontSize: 11, color: muted }}>
                    {hint.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </PressableFeedback>
    </View>
  );
}
