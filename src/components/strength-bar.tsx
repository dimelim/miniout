import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { passwordStrength } from '@/lib/credentials';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const BAR_WIDTH = 120;

export function StrengthBar({ password }: { password: string }) {
  const [border, danger, warning, success, muted] = useThemeColor([
    'border',
    'danger',
    'warning',
    'success',
    'muted',
  ]);

  const strength = passwordStrength(password);
  const ratio = password ? strength.score / 5 : 0;
  const color =
    strength.label === 'fuerte' ? success : strength.label === 'aceptable' ? warning : danger;

  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(ratio, { duration: 260, easing: EASE });
  }, [ratio, fill]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAR_WIDTH * (1 - fill.value) }],
    backgroundColor: color,
  }));

  return (
    <View className="flex-row items-center gap-2.5">
      <View
        style={{
          width: BAR_WIDTH,
          height: 3,
          borderRadius: 999,
          backgroundColor: border,
          overflow: 'hidden',
        }}
      >
        <Animated.View style={[{ position: 'absolute', inset: 0, borderRadius: 999 }, style]} />
      </View>
      <Text style={{ fontSize: 11, color: password ? color : muted }}>
        {password ? strength.label : 'mínimo 10 caracteres'}
      </Text>
    </View>
  );
}
