import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import type { TintaTrazo, Trazo } from '@/lib/api';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const ESPACIO = { ancho: 1000, alto: 640 };

const MINIMO = 4;

type LienzoProps = {
  trazos: Trazo[];
  tinta: TintaTrazo;
  grosor: number;
  tintas: Record<TintaTrazo, string>;
  ancho: number;
  onTrazo: (trazo: Trazo) => void;
};

export function Lienzo({ trazos, tinta, grosor, tintas, ancho, onTrazo }: LienzoProps) {
  const alto = Math.round((ancho * ESPACIO.alto) / ESPACIO.ancho);
  const escala = ancho / ESPACIO.ancho;

  const camino = useSharedValue('');
  const ultimoX = useSharedValue(0);
  const ultimoY = useSharedValue(0);
  const dibujando = useSharedValue(false);

  const vivo = useAnimatedProps(() => ({ d: camino.value }));

  const dibujar = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .averageTouches(true)
    .shouldCancelWhenOutside(false)
    .onBegin((evento) => {
      ultimoX.value = acotar(evento.x / escala, ESPACIO.ancho);
      ultimoY.value = acotar(evento.y / escala, ESPACIO.alto);
      camino.value = `M${ultimoX.value} ${ultimoY.value}`;
      dibujando.value = true;
    })
    .onUpdate((evento) => {
      if (!dibujando.value) return;

      const x = acotar(evento.x / escala, ESPACIO.ancho);
      const y = acotar(evento.y / escala, ESPACIO.alto);

      if (Math.abs(x - ultimoX.value) + Math.abs(y - ultimoY.value) < MINIMO) return;

      const medioX = redondear((x + ultimoX.value) / 2);
      const medioY = redondear((y + ultimoY.value) / 2);

      camino.value = `${camino.value}Q${ultimoX.value} ${ultimoY.value} ${medioX} ${medioY}`;
      ultimoX.value = x;
      ultimoY.value = y;
    })
    .onFinalize(() => {
      if (!dibujando.value) return;

      const cerrado = `${camino.value}L${ultimoX.value} ${ultimoY.value}`;

      dibujando.value = false;
      camino.value = '';

      runOnJS(onTrazo)({ d: cerrado, color: tinta, width: grosor });
    });

  return (
    <GestureDetector gesture={dibujar}>
      <View style={{ width: ancho, height: alto }} collapsable={false}>
        <Svg
          width={ancho}
          height={alto}
          viewBox={`0 0 ${ESPACIO.ancho} ${ESPACIO.alto}`}
          pointerEvents="none"
        >
          {trazos.map((trazo, indice) => (
            <Path
              key={indice}
              d={trazo.d}
              stroke={tintas[trazo.color]}
              strokeWidth={trazo.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          <AnimatedPath
            animatedProps={vivo}
            stroke={tintas[tinta]}
            strokeWidth={grosor}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
    </GestureDetector>
  );
}

function redondear(valor: number) {
  'worklet';
  return Math.round(valor * 10) / 10;
}

function acotar(valor: number, tope: number) {
  'worklet';
  return redondear(Math.min(tope, Math.max(0, valor)));
}
