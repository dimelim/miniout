import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Appear } from '@/components/appear';
import { InkDrop } from '@/components/ink-drop';
import { RuledPaper } from '@/components/ruled-paper';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

export default function AuthCallback() {
  const [accent, border] = useThemeColor(['accent', 'border']);
  const avance = useSharedValue(0);

  useEffect(() => {
    avance.value = withRepeat(withTiming(1, { duration: 1200, easing: EASE }), -1, false);
  }, [avance]);

  const barra = useAnimatedStyle(() => ({
    transform: [{ translateX: -96 + avance.value * 192 }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-background px-10">
      <RuledPaper opacity={0.4} />

      <Appear rise={0}>
        <View className="items-center">
          <InkDrop size={64} mood="trabajando" />

          <Text
            className="mt-8 text-center font-display text-foreground"
            style={{ fontSize: 24, lineHeight: 30, letterSpacing: -0.5 }}
          >
            Entrando a tu cuenta
          </Text>
          <Text
            className="mt-2 max-w-[260px] text-center font-sans text-muted"
            style={{ fontSize: 15, lineHeight: 22 }}
          >
            Estoy comprobando quién eres. Es un segundo.
          </Text>

          <View
            style={{
              marginTop: 24,
              width: 96,
              height: 4,
              borderRadius: 999,
              overflow: 'hidden',
              backgroundColor: border,
            }}
          >
            <Animated.View
              style={[
                { width: 96, height: 4, borderRadius: 999, backgroundColor: accent },
                barra,
              ]}
            />
          </View>
        </View>
      </Appear>
    </View>
  );
}
