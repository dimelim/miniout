import { useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { InkDrop } from '@/components/ink-drop';
import { LARGO_CLAVE, useLock } from '@/lib/lock';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'borrar'];

export default function MiniLock() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { poner } = useLock();

  const [primero, setPrimero] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(false);

  const [foreground, muted, accent, border, danger] = useThemeColor([
    'foreground',
    'muted',
    'accent',
    'border',
    'danger',
  ]);

  const temblor = useSharedValue(0);
  const sacudir = useAnimatedStyle(() => ({ transform: [{ translateX: temblor.value }] }));

  useEffect(() => {
    if (codigo.length !== LARGO_CLAVE) return;

    if (!primero) {
      setPrimero(codigo);
      setCodigo('');
      return;
    }

    if (codigo !== primero) {
      setError(true);
      setPrimero('');
      setCodigo('');
      temblor.value = withSequence(
        withTiming(-9, { duration: 60, easing: EASE }),
        withTiming(9, { duration: 60, easing: EASE }),
        withSpring(0, { damping: 8, stiffness: 260 })
      );
      return;
    }

    poner(codigo).then(() => router.back());
  }, [codigo, primero, poner, router, temblor]);

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
      className="flex-1 items-center bg-background px-10"
      style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}
    >
      <Appear rise={0}>
        <View className="items-center">
          <InkDrop size={52} mood={error ? 'idle' : 'happy'} />

          <Text
            className="mt-6 text-center font-display text-foreground"
            style={{ fontSize: 24, letterSpacing: -0.4 }}
          >
            {primero ? 'Otra vez, para confirmar' : 'Elige tu código'}
          </Text>
          <Text
            className="mt-2 max-w-[280px] text-center font-sans text-muted"
            style={{ fontSize: 14, lineHeight: 21 }}
          >
            {error
              ? 'No coincidieron. Empieza de nuevo.'
              : 'Cuatro dígitos. Te los pediré al abrir Miniout.'}
          </Text>
        </View>
      </Appear>

      <Animated.View style={[{ flexDirection: 'row', gap: 14, marginTop: 24 }, sacudir]}>
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

      <View className="mt-8 flex-row flex-wrap justify-center" style={{ maxWidth: 260 }}>
        {TECLAS.map((tecla, indice) => (
          <View key={`${tecla}-${indice}`} style={{ width: '33.33%', alignItems: 'center' }}>
            {tecla === '' ? (
              <View style={{ width: 70, height: 70 }} />
            ) : (
              <PressableFeedback
                onPress={() => pulsar(tecla)}
                accessibilityRole="button"
                accessibilityLabel={tecla === 'borrar' ? 'Borrar' : tecla}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PressableFeedback.Highlight />
                <Text
                  className={tecla === 'borrar' ? 'font-medium' : 'font-display'}
                  style={{
                    fontSize: tecla === 'borrar' ? 14 : 26,
                    color: tecla === 'borrar' ? muted : foreground,
                  }}
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
