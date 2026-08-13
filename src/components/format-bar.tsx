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
  HeadingIcon,
  ItalicIcon,
  ListIcon,
  MicIcon,
  PictureIcon,
  UnderlineIcon,
} from './icons';

import type { MarcaTipo } from '@/lib/format';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

export type Seleccion = { start: number; end: number };

type FormatBarProps = {
  bottomInset: number;
  activos: MarcaTipo[];
  conAdjuntos: boolean;
  conDictado: boolean;
  dictando: boolean;
  onMarca: (tipo: MarcaTipo) => void;
  onVineta: () => void;
  onImagen: () => void;
  onCamara: () => void;
  onDictar: () => void;
};

export function FormatBar({
  bottomInset,
  activos,
  conAdjuntos,
  conDictado,
  dictando,
  onMarca,
  onVineta,
  onImagen,
  onCamara,
  onDictar,
}: FormatBarProps) {
  const [foreground, surface, separator, danger, surfaceTertiary, accentForeground, accent] =
    useThemeColor([
      'foreground',
      'surface',
      'separator',
      'danger',
      'surface-tertiary',
      'accent-foreground',
      'accent',
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

  const color = (tipo: MarcaTipo) => (activos.includes(tipo) ? accentForeground : foreground);

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
        <Boton
          etiqueta="Negrita"
          activo={activos.includes('negrita')}
          fondo={accent}
          onPress={() => onMarca('negrita')}
        >
          <BoldIcon color={color('negrita')} size={17} />
        </Boton>

        <Boton
          etiqueta="Cursiva"
          activo={activos.includes('cursiva')}
          fondo={accent}
          onPress={() => onMarca('cursiva')}
        >
          <ItalicIcon color={color('cursiva')} size={17} />
        </Boton>

        <Boton
          etiqueta="Subrayado"
          activo={activos.includes('subrayado')}
          fondo={accent}
          onPress={() => onMarca('subrayado')}
        >
          <UnderlineIcon color={color('subrayado')} size={17} />
        </Boton>

        <Boton
          etiqueta="Título"
          activo={activos.includes('titulo')}
          fondo={accent}
          onPress={() => onMarca('titulo')}
        >
          <HeadingIcon color={color('titulo')} size={17} />
        </Boton>

        <Boton etiqueta="Viñeta" activo={false} fondo={surfaceTertiary} onPress={onVineta}>
          <ListIcon color={foreground} size={17} />
        </Boton>

        {(conAdjuntos || conDictado) && <Separador color={separator} />}

        {conAdjuntos && (
          <>
            <Boton
              etiqueta="Imagen de la galería"
              activo={false}
              fondo={surfaceTertiary}
              onPress={onImagen}
            >
              <PictureIcon color={foreground} size={17} />
            </Boton>

            <Boton
              etiqueta="Tomar una foto"
              activo={false}
              fondo={surfaceTertiary}
              onPress={onCamara}
            >
              <CameraIcon color={foreground} size={17} />
            </Boton>
          </>
        )}

        {conDictado && (
          <Boton
            etiqueta={dictando ? 'Parar el dictado' : 'Dictar'}
            activo={false}
            fondo={surfaceTertiary}
            onPress={onDictar}
          >
            <MicIcon color={dictando ? danger : foreground} size={17} />
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
  activo,
  fondo,
  onPress,
  children,
}: {
  etiqueta: string;
  activo: boolean;
  fondo: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={etiqueta}
      style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' }}
    >
      <PressableFeedback.Highlight />
      <View
        style={{
          width: 34,
          height: 30,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: activo ? fondo : 'transparent',
        }}
      >
        {children}
      </View>
    </PressableFeedback>
  );
}
