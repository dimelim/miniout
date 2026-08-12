import { useEffect, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const DURATION = 240;
const RISE = 12;

type AppearProps = {
  children: ReactNode;
  delay?: number;
  rise?: number;
  className?: string;
};

export function Appear({ children, delay = 0, rise = RISE, className }: AppearProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: DURATION, easing: EASE }));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * rise }],
  }));

  return (
    <Animated.View className={className} style={style}>
      {children}
    </Animated.View>
  );
}
