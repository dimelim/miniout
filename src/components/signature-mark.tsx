import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

const LETTER =
  'M20 92C28 60 36 26 46 16C52 30 54 62 56 90C60 62 70 28 82 22C88 36 88 64 88 88C90 70 98 56 108 58C117 60 114 78 123 78C131 78 132 64 140 64C148 64 147 78 155 76C163 74 167 66 175 64';

const FLOURISH = 'M26 104C72 112 140 110 188 96';

const LETTER_LENGTH = 470;
const FLOURISH_LENGTH = 175;

const VIEW_W = 235;
const VIEW_H = 130;
const SLANT = -14;

const LETTER_MS = 1400;
const FLOURISH_MS = 620;
const DOT_MS = 240;

const PEN = Easing.bezier(0.45, 0.05, 0.35, 1);
const EASE = Easing.bezier(0.32, 0.72, 0, 1);

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function SignatureMark({ isActive, width = 230 }: { isActive: boolean; width?: number }) {
  const letter = useSharedValue(0);
  const flourish = useSharedValue(0);
  const dot = useSharedValue(0);

  const [foreground, accent] = useThemeColor(['foreground', 'accent']);

  useEffect(() => {
    if (!isActive) {
      letter.value = 0;
      flourish.value = 0;
      dot.value = 0;
      return;
    }

    letter.value = withTiming(1, { duration: LETTER_MS, easing: PEN });
    flourish.value = withDelay(
      LETTER_MS + 120,
      withTiming(1, { duration: FLOURISH_MS, easing: PEN })
    );
    dot.value = withDelay(
      LETTER_MS + FLOURISH_MS + 200,
      withTiming(1, { duration: DOT_MS, easing: EASE })
    );
  }, [isActive, letter, flourish, dot]);

  const letterProps = useAnimatedProps(() => ({
    strokeDashoffset: LETTER_LENGTH * (1 - letter.value),
  }));

  const flourishProps = useAnimatedProps(() => ({
    strokeDashoffset: FLOURISH_LENGTH * (1 - flourish.value),
  }));

  const dotProps = useAnimatedProps(() => ({
    r: 4 * dot.value,
  }));

  return (
    <View style={{ width, height: (width * VIEW_H) / VIEW_W }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} fill="none">
        <G transform={`translate(${-SLANT * 1.1} 0) skewX(${SLANT})`}>
          <AnimatedPath
            d={LETTER}
            stroke={foreground}
            strokeWidth={4.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={LETTER_LENGTH}
            animatedProps={letterProps}
          />
          <AnimatedPath
            d={FLOURISH}
            stroke={accent}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={FLOURISH_LENGTH}
            animatedProps={flourishProps}
          />
          <AnimatedCircle cx={198} cy={93} fill={accent} animatedProps={dotProps} />
        </G>
      </Svg>
    </View>
  );
}
