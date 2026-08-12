import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

const BREATH_MS = 2600;
const BLINK_MS = 80;
const BLINK_GAP_MS = 2400;
const LOOK_MS = 520;

const SPRING = { damping: 11, stiffness: 190, mass: 0.5 };

type InkDropProps = {
  size?: number;
  mood?: 'idle' | 'happy';
};

export function InkDrop({ size = 44, mood = 'idle' }: InkDropProps) {
  const [accent, background] = useThemeColor(['accent', 'background']);

  const breath = useSharedValue(0);
  const blink = useSharedValue(1);
  const look = useSharedValue(0);
  const press = useSharedValue(0);
  const joy = useSharedValue(mood === 'happy' ? 1 : 0);

  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: BREATH_MS, easing: EASE }), -1, true);

    blink.value = withRepeat(
      withSequence(
        withDelay(BLINK_GAP_MS, withTiming(0.05, { duration: BLINK_MS })),
        withTiming(1, { duration: BLINK_MS + 60 }),
        withDelay(220, withTiming(0.05, { duration: BLINK_MS })),
        withTiming(1, { duration: BLINK_MS + 60 })
      ),
      -1
    );

    look.value = withRepeat(
      withSequence(
        withDelay(2200, withTiming(1, { duration: LOOK_MS, easing: EASE })),
        withDelay(1800, withTiming(-1, { duration: LOOK_MS, easing: EASE })),
        withDelay(1400, withTiming(0, { duration: LOOK_MS, easing: EASE }))
      ),
      -1
    );
  }, [breath, blink, look]);

  useEffect(() => {
    joy.value = withTiming(mood === 'happy' ? 1 : 0, { duration: 240, easing: EASE });
  }, [mood, joy]);

  const saludar = () => {
    press.value = withSequence(withTiming(1, { duration: 90, easing: EASE }), withSpring(0, SPRING));
  };

  const body = useAnimatedStyle(() => ({
    transform: [
      { translateY: breath.value * -2 },
      { scaleX: 1 + press.value * 0.1 },
      { scaleY: 1 - press.value * 0.14 },
    ],
  }));

  const eyes = useAnimatedStyle(() => ({
    transform: [
      { translateX: look.value * 1.8 },
      { translateY: (press.value + joy.value) * 0.6 },
      { scaleY: blink.value * (1 - press.value * 0.6 - joy.value * 0.45) },
    ],
  }));

  const eye = {
    width: size * 0.12,
    height: size * 0.27,
    borderRadius: size,
    backgroundColor: background,
  };

  return (
    <Pressable onPress={saludar} accessible={false} hitSlop={10}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            backgroundColor: accent,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
          },
          body,
        ]}
      >
        <Animated.View style={[{ flexDirection: 'row', gap: size * 0.17 }, eyes]}>
          <View style={eye} />
          <View style={eye} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
