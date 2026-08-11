import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DOT_SIZE = 6;
const ACTIVE_WIDTH = 26;
const DURATION = 220;
const EASE = Easing.bezier(0.32, 0.72, 0, 1);

type DotProps = {
  isActive: boolean;
  isPlaying: boolean;
  autoplayMs: number;
  restColor: string;
  activeColor: string;
};

function Dot({ isActive, isPlaying, autoplayMs, restColor, activeColor }: DotProps) {
  const progress = useSharedValue(isActive ? 1 : 0);
  const fill = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: DURATION, easing: EASE });
  }, [isActive, progress]);

  useEffect(() => {
    if (!isActive) {
      fill.value = 0;
      return;
    }
    if (!isPlaying) {
      fill.value = withTiming(1, { duration: DURATION, easing: EASE });
      return;
    }
    fill.value = 0;
    fill.value = withTiming(1, { duration: autoplayMs, easing: Easing.linear });
  }, [isActive, isPlaying, autoplayMs, fill]);

  const trackStyle = useAnimatedStyle(() => ({
    width: DOT_SIZE + progress.value * (ACTIVE_WIDTH - DOT_SIZE),
    backgroundColor: interpolateColor(progress.value, [0, 1], [restColor, restColor]),
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: -ACTIVE_WIDTH * (1 - fill.value) }],
  }));

  return (
    <Animated.View
      style={[{ height: DOT_SIZE, borderRadius: DOT_SIZE / 2, overflow: 'hidden' }, trackStyle]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: ACTIVE_WIDTH,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: activeColor,
          },
          fillStyle,
        ]}
      />
    </Animated.View>
  );
}

type SlideDotsProps = {
  count: number;
  index: number;
  isPlaying: boolean;
  autoplayMs: number;
  restColor: string;
  activeColor: string;
  onSelect: (index: number) => void;
};

export function SlideDots({
  count,
  index,
  isPlaying,
  autoplayMs,
  restColor,
  activeColor,
  onSelect,
}: SlideDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-1">
      {Array.from({ length: count }).map((_, position) => (
        <Pressable
          key={position}
          onPress={() => onSelect(position)}
          hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel={`Ir a la pantalla ${position + 1} de ${count}`}
          accessibilityState={{ selected: position === index }}
        >
          <Dot
            isActive={position === index}
            isPlaying={isPlaying}
            autoplayMs={autoplayMs}
            restColor={restColor}
            activeColor={activeColor}
          />
        </Pressable>
      ))}
    </View>
  );
}
