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

import type { Note } from '@/lib/api';

import { CheckIcon } from './icons';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const DURATION = 220;

type NoteRowProps = {
  note: Note;
  onToggle: () => void;
};

export function NoteRow({ note, onToggle }: NoteRowProps) {
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

  const label = useAnimatedStyle(() => ({ opacity: 1 - done.value * 0.5 }));

  return (
    <PressableFeedback
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: note.done }}
      accessibilityLabel={note.body}
      style={{ borderRadius: 14 }}
    >
      <PressableFeedback.Highlight />
      <View className="flex-row items-start gap-3 py-3 pr-1">
        <Animated.View
          style={[
            {
              width: 22,
              height: 22,
              borderRadius: 8,
              borderWidth: 1.5,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
            },
            box,
          ]}
        >
          <Animated.View style={mark}>
            <CheckIcon color={accentForeground} size={13} />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[{ flex: 1 }, label]}>
          <Text
            className="font-sans text-foreground"
            style={{
              fontSize: 15,
              lineHeight: 22,
              textDecorationLine: note.done ? 'line-through' : 'none',
            }}
          >
            {note.body}
          </Text>

          {note.hints.length > 0 && (
            <View className="mt-1.5 flex-row flex-wrap gap-1.5">
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
      </View>
    </PressableFeedback>
  );
}
