import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { InkDrop } from './ink-drop';

import { LARGO_CLAVE, useLock } from '@/lib/lock';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'borrar'];

export function LockScreen() {
  const { bloqueada, isReady, abrir } = useLock();
  const [background] = useThemeColor(['background']);

  if (isReady && !bloqueada) return null;

  return (
    <Modal visible transparent={false} statusBarTranslucent animationType="none">
      {isReady ? (
        <Teclado onAbrir={abrir} />
      ) : (
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: background }}
        >
          <InkDrop size={56} />
        </View>
      )}
    </Modal>
  );
}

function Teclado({ onAbrir }: { onAbrir: (codigo: string) => Promise<boolean> }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(false);

  const [background, foreground, muted, accent, border, danger] = useThemeColor([
    'background',
    'foreground',
    'muted',
    'accent',
    'border',
    'danger',
  ]);

  const temblor = useSharedValue(0);

  const sacudir = useAnimatedStyle(() => ({
    transform: [{ translateX: temblor.value }],
  }));

  useEffect(() => {
    if (codigo.length !== LARGO_CLAVE) return;

    onAbrir(codigo).then((bien) => {
      if (bien) return;

      setError(true);
      setCodigo('');
      temblor.value = withSequence(
        withTiming(-9, { duration: 60, easing: EASE }),
        withTiming(9, { duration: 60, easing: EASE }),
        withSpring(0, { damping: 8, stiffness: 260 })
      );
    });
  }, [codigo, onAbrir, temblor]);

  const pulsar = (tecla: string) => {
    setError(false);

    if (tecla === 'borrar') {
      setCodigo((actual) => actual.slice(0, -1));
      return;
    }

    setCodigo((actual) => (actual.length >= LARGO_CLAVE ? actual : actual + tecla));
  };

  return (
    <View
      className="flex-1 items-center justify-center px-10"
      style={{ backgroundColor: background }}
    >
      <InkDrop size={56} mood={error ? 'idle' : 'happy'} />

      <Text
        className="mt-7 text-center font-display text-foreground"
        style={{ fontSize: 24, letterSpacing: -0.4 }}
      >
        MiniLock
      </Text>
      <Text
        className="mt-2 text-center font-sans text-muted"
        style={{ fontSize: 14, lineHeight: 21 }}
      >
        {error ? 'Ese código no es. Prueba otra vez.' : 'Escribe tu código para entrar'}
      </Text>

      <Animated.View style={[{ flexDirection: 'row', gap: 14, marginTop: 26 }, sacudir]}>
        {Array.from({ length: LARGO_CLAVE }).map((_, indice) => (
          <View
            key={indice}
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: error ? danger : indice < codigo.length ? accent : border,
              backgroundColor: indice < codigo.length ? (error ? danger : accent) : 'transparent',
            }}
          />
        ))}
      </Animated.View>

      <View className="mt-10 flex-row flex-wrap justify-center" style={{ maxWidth: 260 }}>
        {TECLAS.map((tecla, indice) => (
          <View key={`${tecla}-${indice}`} style={{ width: '33.33%', alignItems: 'center' }}>
            {tecla === '' ? (
              <View style={{ width: 72, height: 72 }} />
            ) : (
              <PressableFeedback
                onPress={() => pulsar(tecla)}
                accessibilityRole="button"
                accessibilityLabel={tecla === 'borrar' ? 'Borrar' : tecla}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PressableFeedback.Highlight />
                <Text
                  className={tecla === 'borrar' ? 'font-medium' : 'font-display'}
                  style={{ fontSize: tecla === 'borrar' ? 14 : 26, color: tecla === 'borrar' ? muted : foreground }}
                >
                  {tecla === 'borrar' ? 'Borrar' : tecla}
                </Text>
              </PressableFeedback>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
