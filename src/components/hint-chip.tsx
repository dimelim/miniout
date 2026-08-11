import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const DURATION = 220;

type HintChipProps = {
  text: string;
  tooltip: string;
  isOpen: boolean;
  onToggle: () => void;
};

export function HintChip({ text, tooltip, isOpen, onToggle }: HintChipProps) {
  const progress = useSharedValue(0);

  const [overlay, border, surfaceSecondary, accent, foreground] = useThemeColor([
    'overlay',
    'border',
    'surface-secondary',
    'accent',
    'foreground',
  ]);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: DURATION, easing: EASE });
  }, [isOpen, progress]);

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 8 },
      { scale: 0.92 + progress.value * 0.08 },
    ],
  }));

  const chipStyle = useAnimatedStyle(() => ({
    borderColor: isOpen ? accent : 'transparent',
    transform: [{ scale: 1 + progress.value * 0.04 }],
  }));

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 8,
            width: 200,
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: overlay,
            transformOrigin: 'bottom left',
            zIndex: 50,
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.24,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
          },
          tooltipStyle,
        ]}
      >
        <Text style={{ fontSize: 12, lineHeight: 17, color: foreground }}>{tooltip}</Text>
      </Animated.View>

      <Pressable
        onPressIn={onToggle}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={tooltip}
        accessibilityState={{ expanded: isOpen }}
      >
        <Animated.View
          style={[
            {
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: surfaceSecondary,
              borderWidth: 1,
            },
            chipStyle,
          ]}
        >
          <Text className="font-medium" style={{ fontSize: 12, lineHeight: 16, color: accent }}>
            {text}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}
