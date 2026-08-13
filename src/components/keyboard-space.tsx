import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

export function KeyboardSpace({
  bottomInset = 0,
  extra = 0,
}: {
  bottomInset?: number;
  extra?: number;
}) {
  const teclado = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const hueco = useAnimatedStyle(() => {
    const alto = Math.max(0, teclado.height.value - bottomInset);

    return { height: alto > 0 ? alto + extra : 0 };
  });

  return <Animated.View style={hueco} pointerEvents="none" />;
}
