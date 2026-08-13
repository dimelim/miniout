import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

export function KeyboardSpace({ bottomInset = 0 }: { bottomInset?: number }) {
  const teclado = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const hueco = useAnimatedStyle(() => ({
    height: Math.max(0, teclado.height.value - bottomInset),
  }));

  return <Animated.View style={hueco} pointerEvents="none" />;
}
