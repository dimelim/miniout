import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useRef, useState } from 'react';
import { Text, View, type LayoutRectangle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PHRASE = 'Parcial de cálculo el viernes';
const SUGGESTIONS = ['cálculo', 'viernes'];

const TYPE_MS = 52;
const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const MOVE_MS = 320;
const PRESS_MS = 130;
const BLINK_MS = 620;

export function TypingDemo({ isActive }: { isActive: boolean }) {
  const [typed, setTyped] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [accepted, setAccepted] = useState<boolean[]>([false, false]);

  const layouts = useRef<(LayoutRectangle | null)[]>([null, null]);

  const caret = useSharedValue(1);
  const tapX = useSharedValue(0);
  const tapY = useSharedValue(0);
  const tapScale = useSharedValue(0);
  const tapOpacity = useSharedValue(0);

  const [fieldBackground, accent, accentForeground, muted, border] = useThemeColor([
    'background-tertiary',
    'accent',
    'accent-foreground',
    'muted',
    'border',
  ]);

  useEffect(() => {
    caret.value = withRepeat(withTiming(0, { duration: BLINK_MS, easing: EASE }), -1, true);
  }, [caret]);

  useEffect(() => {
    if (!isActive) {
      setTyped('');
      setShowSuggestions(false);
      setAccepted([false, false]);
      tapOpacity.value = 0;
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const tapChip = async (position: number) => {
      const layout = layouts.current[position];
      if (!layout) return;

      tapX.value = withTiming(layout.x + layout.width / 2, { duration: MOVE_MS, easing: EASE });
      tapY.value = withTiming(layout.y + layout.height / 2, { duration: MOVE_MS, easing: EASE });
      tapOpacity.value = withTiming(1, { duration: 160 });
      tapScale.value = withTiming(1, { duration: MOVE_MS, easing: EASE });
      await wait(MOVE_MS);
      if (cancelled) return;

      tapScale.value = withSequence(
        withTiming(0.68, { duration: PRESS_MS, easing: EASE }),
        withTiming(1, { duration: PRESS_MS, easing: EASE })
      );
      await wait(PRESS_MS);
      if (cancelled) return;

      setAccepted((current) => current.map((value, i) => (i === position ? true : value)));
      await wait(PRESS_MS + 180);
    };

    const play = async () => {
      for (let length = 1; length <= PHRASE.length; length++) {
        if (cancelled) return;
        setTyped(PHRASE.slice(0, length));
        await wait(TYPE_MS);
      }

      if (cancelled) return;
      await wait(360);
      setShowSuggestions(true);
      await wait(560);

      for (let position = 0; position < SUGGESTIONS.length; position++) {
        if (cancelled) return;
        await tapChip(position);
      }

      if (cancelled) return;
      tapOpacity.value = withTiming(0, { duration: 200 });
      tapScale.value = withTiming(0.6, { duration: 200 });
    };

    play();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isActive, tapOpacity, tapScale, tapX, tapY]);

  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  const tapStyle = useAnimatedStyle(() => ({
    opacity: tapOpacity.value,
    transform: [
      { translateX: tapX.value - 17 },
      { translateY: tapY.value - 17 },
      { scale: tapScale.value },
    ],
  }));

  return (
    <View className="gap-2.5">
      <View
        className="min-h-[56px] justify-center rounded-[14px] border border-border px-4 py-3.5"
        style={{ backgroundColor: fieldBackground }}
      >
        <View className="flex-row flex-wrap items-center">
          <Text className="font-sans text-foreground" style={{ fontSize: 15, lineHeight: 22 }}>
            {typed || <Text className="text-muted">Escribe algo</Text>}
          </Text>
          <Animated.View
            className="ml-1 h-[18px] w-0.5 rounded-full"
            style={[{ backgroundColor: accent }, caretStyle]}
          />
        </View>
      </View>

      <View className="h-9 justify-center">
        <View className="flex-row items-center gap-1.5">
          {showSuggestions &&
            SUGGESTIONS.map((label, position) => (
              <Animated.View
                key={label}
                entering={FadeIn.duration(200).delay(position * 110)}
                onLayout={(event) => {
                  layouts.current[position] = event.nativeEvent.layout;
                }}
                className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                style={{
                  borderWidth: 1,
                  borderStyle: accepted[position] ? 'solid' : 'dashed',
                  borderColor: accepted[position] ? accent : border,
                  backgroundColor: accepted[position] ? accent : 'transparent',
                }}
              >
                {!accepted[position] && (
                  <Text style={{ fontSize: 12, lineHeight: 15, color: muted }}>+</Text>
                )}
                <Text
                  className="font-semibold"
                  style={{
                    fontSize: 12,
                    lineHeight: 15,
                    color: accepted[position] ? accentForeground : muted,
                  }}
                >
                  {label}
                </Text>
              </Animated.View>
            ))}
        </View>

        <Animated.View
          pointerEvents="none"
          className="absolute size-[34px] items-center justify-center rounded-full"
          style={[{ borderWidth: 1.5, borderColor: accent }, tapStyle]}
        >
          <View
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: accent, opacity: 0.22 }}
          />
        </Animated.View>
      </View>
    </View>
  );
}
