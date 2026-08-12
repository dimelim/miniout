import * as Updates from 'expo-updates';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Appear } from './appear';
import { InkDrop } from './ink-drop';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const CHECK_EVERY_MS = 15 * 60 * 1000;

type Estado = 'quieto' | 'bajando' | 'lista';

export function Updater() {
  const [estado, setEstado] = useState<Estado>('quieto');
  const ultimo = useRef(0);

  const buscar = useCallback(async () => {
    if (__DEV__ || !Updates.isEnabled) return;
    if (Date.now() - ultimo.current < CHECK_EVERY_MS) return;

    ultimo.current = Date.now();

    try {
      const { isAvailable } = await Updates.checkForUpdateAsync();
      if (!isAvailable) return;

      setEstado('bajando');
      await Updates.fetchUpdateAsync();
      setEstado('lista');
      await Updates.reloadAsync();
    } catch {
      setEstado('quieto');
    }
  }, []);

  useEffect(() => {
    buscar();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') buscar();
    });

    return () => subscription.remove();
  }, [buscar]);

  if (estado === 'quieto') return null;

  return <Pantalla lista={estado === 'lista'} />;
}

function Pantalla({ lista }: { lista: boolean }) {
  const [background, accent, border] = useThemeColor(['background', 'accent', 'border']);

  const avance = useSharedValue(0);

  useEffect(() => {
    avance.value = withRepeat(withTiming(1, { duration: 1400, easing: EASE }), -1, false);
  }, [avance]);

  const barra = useAnimatedStyle(() => ({
    transform: [{ translateX: -110 + avance.value * 220 }],
  }));

  return (
    <View
      style={{
        position: 'absolute',
        inset: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        backgroundColor: background,
      }}
    >
      <Appear rise={0}>
        <View className="items-center">
          <InkDrop size={72} mood="trabajando" hat />

          <Text
            className="mt-9 text-center font-display text-foreground"
            style={{ fontSize: 26, lineHeight: 32, letterSpacing: -0.5 }}
          >
            {lista ? 'Ya está' : 'Estamos actualizando'}
          </Text>

          <Text
            className="mt-2 max-w-[280px] text-center font-sans text-muted"
            style={{ fontSize: 15, lineHeight: 23 }}
          >
            {lista
              ? 'Abro Miniout otra vez con lo nuevo.'
              : 'Hay una versión nueva de Miniout. Tardo unos segundos.'}
          </Text>

          <View
            style={{
              marginTop: 28,
              width: 110,
              height: 4,
              borderRadius: 999,
              overflow: 'hidden',
              backgroundColor: border,
            }}
          >
            <Animated.View
              style={[
                { width: 110, height: 4, borderRadius: 999, backgroundColor: accent },
                barra,
              ]}
            />
          </View>
        </View>
      </Appear>
    </View>
  );
}
