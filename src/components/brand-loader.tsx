import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { LETTER, STROKE, UNDERLINE } from './mark';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const PEN = Easing.bezier(0.45, 0.05, 0.35, 1);

const LETTER_LENGTH = 44;
const UNDERLINE_LENGTH = 18;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function BrandLoader({ size = 96 }: { size?: number }) {
  const [foreground, accent] = useThemeColor(['foreground', 'accent']);

  const letra = useSharedValue(0);
  const linea = useSharedValue(0);
  const latido = useSharedValue(0);

  useEffect(() => {
    letra.value = withTiming(1, { duration: 620, easing: PEN });
    linea.value = withDelay(520, withTiming(1, { duration: 420, easing: PEN }));
    latido.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: EASE }),
          withTiming(0, { duration: 900, easing: EASE })
        ),
        -1
      )
    );
  }, [letra, linea, latido]);

  const letterProps = useAnimatedProps(() => ({
    strokeDashoffset: LETTER_LENGTH * (1 - letra.value),
  }));

  const underlineProps = useAnimatedProps(() => ({
    strokeDashoffset: UNDERLINE_LENGTH * (1 - linea.value),
  }));

  const respiro = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + latido.value * 0.03 }],
    opacity: 0.9 + latido.value * 0.1,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, respiro]}>
      <Svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
        <AnimatedPath
          d={LETTER}
          stroke={foreground}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={LETTER_LENGTH}
          animatedProps={letterProps}
        />
        <AnimatedPath
          d={UNDERLINE}
          stroke={accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={UNDERLINE_LENGTH}
          animatedProps={underlineProps}
        />
      </Svg>
    </Animated.View>
  );
}

export function BrandScreen({ size = 96 }: { size?: number }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <BrandLoader size={size} />
    </View>
  );
}
