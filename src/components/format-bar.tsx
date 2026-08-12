import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { CheckIcon } from './icons';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

export type Seleccion = { start: number; end: number };

type FormatBarProps = {
  value: string;
  selection: Seleccion;
  onChange: (value: string, selection: Seleccion) => void;
  bottomInset: number;
};

function envolver(value: string, selection: Seleccion, marca: string) {
  const antes = value.slice(0, selection.start);
  const dentro = value.slice(selection.start, selection.end);
  const despues = value.slice(selection.end);

  if (!dentro) {
    const texto = `${antes}${marca}${marca}${despues}`;
    const cursor = selection.start + marca.length;
    return { texto, seleccion: { start: cursor, end: cursor } };
  }

  return {
    texto: `${antes}${marca}${dentro}${marca}${despues}`,
    seleccion: {
      start: selection.start + marca.length,
      end: selection.end + marca.length,
    },
  };
}

function prefijar(value: string, selection: Seleccion, prefijo: string) {
  const inicioLinea = value.lastIndexOf('\n', Math.max(0, selection.start - 1)) + 1;
  const yaEsta = value.slice(inicioLinea).startsWith(prefijo);

  if (yaEsta) {
    const texto = value.slice(0, inicioLinea) + value.slice(inicioLinea + prefijo.length);
    const cursor = Math.max(inicioLinea, selection.start - prefijo.length);
    return { texto, seleccion: { start: cursor, end: cursor } };
  }

  const texto = value.slice(0, inicioLinea) + prefijo + value.slice(inicioLinea);
  const cursor = selection.start + prefijo.length;
  return { texto, seleccion: { start: cursor, end: cursor } };
}

export function FormatBar({ value, selection, onChange, bottomInset }: FormatBarProps) {
  const [foreground, muted, surface, border] = useThemeColor([
    'foreground',
    'muted',
    'surface',
    'border',
  ]);

  const teclado = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const barra = useAnimatedStyle(() => {
    const alto = Math.max(0, teclado.height.value - bottomInset);

    return {
      transform: [{ translateY: -alto }],
      opacity: withTiming(alto > 0 ? 1 : 0, { duration: 160, easing: EASE }),
    };
  });

  const aplicar = (accion: () => { texto: string; seleccion: Seleccion }) => {
    const { texto, seleccion } = accion();
    onChange(texto, seleccion);
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[{ position: 'absolute', left: 0, right: 0, bottom: bottomInset }, barra]}
    >
      <View
        className="flex-row items-center justify-around px-2 py-2"
        style={{
          backgroundColor: surface,
          borderTopWidth: 1,
          borderTopColor: border,
          paddingBottom: 10,
        }}
      >
        <Boton
          etiqueta="Negrita"
          onPress={() => aplicar(() => envolver(value, selection, '**'))}
        >
          <Text className="font-display-strong" style={{ fontSize: 16, color: foreground }}>
            B
          </Text>
        </Boton>

        <Boton
          etiqueta="Cursiva"
          onPress={() => aplicar(() => envolver(value, selection, '_'))}
        >
          <Text
            className="font-display"
            style={{ fontSize: 16, fontStyle: 'italic', color: foreground }}
          >
            i
          </Text>
        </Boton>

        <Separador color={border} />

        <Boton
          etiqueta="Lista"
          onPress={() => aplicar(() => prefijar(value, selection, '- '))}
        >
          <View className="flex-row items-center gap-1">
            <View
              style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: foreground }}
            />
            <View
              style={{ width: 11, height: 2, borderRadius: 999, backgroundColor: muted }}
            />
          </View>
        </Boton>

        <Boton
          etiqueta="Casilla"
          onPress={() => aplicar(() => prefijar(value, selection, '- [ ] '))}
        >
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: foreground,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon color={muted} size={9} />
          </View>
        </Boton>

        <Separador color={border} />

        <Boton
          etiqueta="Titulo"
          onPress={() => aplicar(() => prefijar(value, selection, '# '))}
        >
          <Text className="font-display" style={{ fontSize: 15, color: foreground }}>
            H
          </Text>
        </Boton>
      </View>
    </Animated.View>
  );
}

function Separador({ color }: { color: string }) {
  return <View style={{ width: 1, height: 20, backgroundColor: color, opacity: 0.7 }} />;
}

function Boton({
  etiqueta,
  onPress,
  children,
}: {
  etiqueta: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PressableFeedback.Highlight />
      {children}
    </PressableFeedback>
  );
}
