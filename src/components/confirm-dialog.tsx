import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const DURACION = 220;

type ConfirmDialogProps = {
  visible: boolean;
  titulo: string;
  mensaje: string;
  confirmar: string;
  cancelar?: string;
  tono?: 'peligro' | 'normal';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  titulo,
  mensaje,
  confirmar,
  cancelar = 'Cancelar',
  tono = 'peligro',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Contenido
        titulo={titulo}
        mensaje={mensaje}
        confirmar={confirmar}
        cancelar={cancelar}
        tono={tono}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </Modal>
  );
}

function Contenido({
  titulo,
  mensaje,
  confirmar,
  cancelar,
  tono,
  onConfirm,
  onCancel,
}: Omit<ConfirmDialogProps, 'visible'>) {
  const [backdrop, surface, foreground, danger, accent] = useThemeColor([
    'backdrop',
    'surface',
    'foreground',
    'danger',
    'accent',
  ]);

  const entrada = useSharedValue(0);

  useEffect(() => {
    entrada.value = withTiming(1, { duration: DURACION, easing: EASE });
  }, [entrada]);

  const fondo = useAnimatedStyle(() => ({ opacity: entrada.value }));

  const tarjeta = useAnimatedStyle(() => ({
    opacity: entrada.value,
    transform: [
      { scale: 0.94 + entrada.value * 0.06 },
      { translateY: (1 - entrada.value) * 14 },
    ],
  }));

  const color = tono === 'peligro' ? danger : accent;

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: backdrop }, fondo]}>
        <Pressable
          style={{ flex: 1 }}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            width: '100%',
            maxWidth: 380,
            borderRadius: 28,
            padding: 24,
            backgroundColor: surface,
          },
          tarjeta,
        ]}
      >
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 22, lineHeight: 28, letterSpacing: -0.4 }}
        >
          {titulo}
        </Text>
        <Text className="mt-2 font-sans text-muted" style={{ fontSize: 15, lineHeight: 22 }}>
          {mensaje}
        </Text>

        <View className="mt-7 gap-2">
          <PressableFeedback
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={confirmar}
            style={{
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: 'center',
              backgroundColor: color,
            }}
          >
            <PressableFeedback.Highlight />
            <Text className="font-semibold" style={{ fontSize: 15, color: '#fbfaf7' }}>
              {confirmar}
            </Text>
          </PressableFeedback>

          <PressableFeedback
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelar}
            style={{ borderRadius: 999, paddingVertical: 14, alignItems: 'center' }}
          >
            <PressableFeedback.Highlight />
            <Text className="font-medium" style={{ fontSize: 15, color: foreground }}>
              {cancelar}
            </Text>
          </PressableFeedback>
        </View>
      </Animated.View>
    </View>
  );
}
