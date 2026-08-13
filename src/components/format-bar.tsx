import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { View } from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import {
  BoldIcon,
  CameraIcon,
  ChecklistIcon,
  HeadingIcon,
  ItalicIcon,
  ListIcon,
  MicIcon,
  PictureIcon,
} from './icons';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

export type Seleccion = { start: number; end: number };

type FormatBarProps = {
  value: string;
  selection: Seleccion;
  onChange: (value: string, selection: Seleccion) => void;
  bottomInset: number;
  conAdjuntos: boolean;
  conDictado: boolean;
  dictando: boolean;
  onImagen: () => void;
  onCamara: () => void;
  onDictar: () => void;
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

export function FormatBar({
  value,
  selection,
  onChange,
  bottomInset,
  conAdjuntos,
  conDictado,
  dictando,
  onImagen,
  onCamara,
  onDictar,
}: FormatBarProps) {
  const [foreground, surface, separator, danger] = useThemeColor([
    'foreground',
    'surface',
    'separator',
    'danger',
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
        className="flex-row items-stretch"
        style={{
          backgroundColor: surface,
          borderTopWidth: 1,
          borderTopColor: separator,
          paddingBottom: 8,
        }}
      >
        <Boton etiqueta="Negrita" onPress={() => aplicar(() => envolver(value, selection, '**'))}>
          <BoldIcon color={foreground} size={17} />
        </Boton>

        <Boton etiqueta="Cursiva" onPress={() => aplicar(() => envolver(value, selection, '_'))}>
          <ItalicIcon color={foreground} size={17} />
        </Boton>

        <Boton etiqueta="Titulo" onPress={() => aplicar(() => prefijar(value, selection, '# '))}>
          <HeadingIcon color={foreground} size={17} />
        </Boton>

        <Boton etiqueta="Lista" onPress={() => aplicar(() => prefijar(value, selection, '- '))}>
          <ListIcon color={foreground} size={17} />
        </Boton>

        <Boton
          etiqueta="Casilla"
          onPress={() => aplicar(() => prefijar(value, selection, '- [ ] '))}
        >
          <ChecklistIcon color={foreground} size={17} />
        </Boton>

        {(conAdjuntos || conDictado) && <Separador color={separator} />}

        {conAdjuntos && (
          <>
            <Boton etiqueta="Imagen de la galería" onPress={onImagen}>
              <PictureIcon color={foreground} size={17} />
            </Boton>

            <Boton etiqueta="Tomar una foto" onPress={onCamara}>
              <CameraIcon color={foreground} size={17} />
            </Boton>
          </>
        )}

        {conDictado && (
          <Boton etiqueta={dictando ? 'Parar el dictado' : 'Dictar'} onPress={onDictar}>
            <MicIcon color={dictando ? danger : foreground} size={17} />
            {dictando && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 7,
                  width: 14,
                  height: 2,
                  borderRadius: 999,
                  backgroundColor: danger,
                }}
              />
            )}
          </Boton>
        )}

      </View>
    </Animated.View>
  );
}

function Separador({ color }: { color: string }) {
  return <View style={{ width: 1, marginVertical: 12, backgroundColor: color }} />;
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
        flex: 1,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PressableFeedback.Highlight />
      {children}
    </PressableFeedback>
  );
}
