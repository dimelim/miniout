import { PressableFeedback } from 'heroui-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PlusIcon } from './icons';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const SPRING = { damping: 12, stiffness: 260, mass: 0.5 };

type SendButtonProps = {
  activo: boolean;
  color: string;
  fondo: string;
  contraste: string;
  muted: string;
  etiqueta: string;
  onPress: () => void;
  size?: number;
};

export function SendButton({
  activo,
  color,
  fondo,
  contraste,
  muted,
  etiqueta,
  onPress,
  size = 36,
}: SendButtonProps) {
  const escala = useSharedValue(1);
  const giro = useSharedValue(0);

  const estilo = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }, { rotate: `${giro.value}deg` }],
  }));

  const pulsar = () => {
    if (activo) {
      escala.value = withSequence(withTiming(0.82, { duration: 90, easing: EASE }), withSpring(1, SPRING));
      giro.value = withSequence(
        withTiming(90, { duration: 220, easing: EASE }),
        withTiming(0, { duration: 0 })
      );
    }

    onPress();
  };

  return (
    <PressableFeedback
      onPress={pulsar}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{ borderRadius: 999 }}
    >
      <PressableFeedback.Highlight />
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activo ? color : fondo,
          },
          estilo,
        ]}
      >
        <PlusIcon color={activo ? contraste : muted} size={size * 0.42} />
      </Animated.View>
    </PressableFeedback>
  );
}
