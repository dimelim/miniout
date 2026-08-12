import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function LastUsedBadge() {
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -9,
        right: 14,
        zIndex: 10,
      }}
    >
      <View
        style={{
          borderRadius: 999,
          paddingHorizontal: 9,
          paddingVertical: 3,
          backgroundColor: accent,
        }}
      >
        <Text
          className="font-semibold"
          style={{ fontSize: 10, lineHeight: 13, color: accentForeground }}
        >
          Último usado
        </Text>
      </View>
    </Animated.View>
  );
}
