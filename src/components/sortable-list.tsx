import { useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };

type Posiciones = Record<string, number>;

function ordenar(posiciones: Posiciones) {
  return Object.keys(posiciones).sort((a, b) => posiciones[a] - posiciones[b]);
}

function mapaDe(ids: string[]) {
  return Object.fromEntries(ids.map((id, indice) => [id, indice]));
}

type SortableListProps<T> = {
  items: T[];
  idOf: (item: T) => string;
  alto: number;
  hueco?: number;
  onOrden: (ids: string[]) => void;
  children: (item: T, arrastrando: SharedValue<boolean>) => React.ReactNode;
};

export function SortableList<T>({
  items,
  idOf,
  alto,
  hueco = 10,
  onOrden,
  children,
}: SortableListProps<T>) {
  const paso = alto + hueco;
  const ids = items.map(idOf).join('|');
  const posiciones = useSharedValue<Posiciones>(mapaDe(ids ? ids.split('|') : []));

  useEffect(() => {
    posiciones.value = mapaDe(ids ? ids.split('|') : []);
  }, [ids, posiciones]);

  return (
    <View style={{ height: Math.max(0, items.length * paso - hueco) }}>
      {items.map((item) => (
        <Fila
          key={idOf(item)}
          id={idOf(item)}
          alto={alto}
          paso={paso}
          total={items.length}
          posiciones={posiciones}
          onOrden={onOrden}
        >
          {(arrastrando) => children(item, arrastrando)}
        </Fila>
      ))}
    </View>
  );
}

type FilaProps = {
  id: string;
  alto: number;
  paso: number;
  total: number;
  posiciones: SharedValue<Posiciones>;
  onOrden: (ids: string[]) => void;
  children: (arrastrando: SharedValue<boolean>) => React.ReactNode;
};

function Fila({ id, alto, paso, total, posiciones, onOrden, children }: FilaProps) {
  const y = useSharedValue((posiciones.value[id] ?? 0) * paso);
  const inicio = useSharedValue(0);
  const arrastrando = useSharedValue(false);

  useAnimatedReaction(
    () => posiciones.value[id],
    (posicion, anterior) => {
      if (posicion === undefined || posicion === anterior) return;
      if (arrastrando.value) return;

      y.value = withSpring(posicion * paso, SPRING);
    }
  );

  const gesto = Gesture.Pan()
    .activateAfterLongPress(180)
    .onStart(() => {
      arrastrando.value = true;
      inicio.value = y.value;
    })
    .onUpdate((evento) => {
      y.value = inicio.value + evento.translationY;

      const destino = Math.min(
        total - 1,
        Math.max(0, Math.round(y.value / paso))
      );
      const actual = posiciones.value[id];

      if (destino === actual) return;

      const siguiente: Posiciones = { ...posiciones.value };

      for (const otro of Object.keys(siguiente)) {
        if (siguiente[otro] === destino) siguiente[otro] = actual;
      }

      siguiente[id] = destino;
      posiciones.value = siguiente;
    })
    .onEnd(() => {
      arrastrando.value = false;
      y.value = withSpring(posiciones.value[id] * paso, SPRING);
      runOnJS(onOrden)(ordenar(posiciones.value));
    });

  const estilo = useAnimatedStyle(() => ({
    top: 0,
    transform: [
      { translateY: y.value },
      { scale: withTiming(arrastrando.value ? 1.03 : 1, { duration: 160 }) },
    ],
    zIndex: arrastrando.value ? 20 : 1,
  }));

  return (
    <GestureDetector gesture={gesto}>
      <Animated.View
        style={[{ position: 'absolute', left: 0, right: 0, height: alto }, estilo]}
      >
        {children(arrastrando)}
      </Animated.View>
    </GestureDetector>
  );
}
