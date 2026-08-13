import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { InkDrop } from './ink-drop';

import type { Frase } from '@/lib/quotes';

const LADO = 24;
const ALTO = 168;
const GOTA = 168;

type Slide = {
  id: string;
  titulo: string;
  detalle: string;
  mood: 'idle' | 'happy' | 'trabajando';
};

type MascotaHeroProps = {
  saludo: string;
  nombre: string;
  pendientes: number;
  clasesHoy: number;
  frase: Frase;
};

export function MascotaHero({ saludo, nombre, pendientes, clasesHoy, frase }: MascotaHeroProps) {
  const { width } = useWindowDimensions();
  const [activo, setActivo] = useState(0);
  const flotar = useSharedValue(0);

  const [accent, surfaceTertiary] = useThemeColor(['accent', 'surface-tertiary']);

  useEffect(() => {
    flotar.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [flotar]);

  const vuelo = useAnimatedStyle(() => ({
    transform: [{ translateY: flotar.value * -7 }, { rotate: `${flotar.value * 3 - 1.5}deg` }],
  }));

  const ancho = width - LADO * 2;

  const slides: Slide[] = [
    {
      id: 'saludo',
      titulo: nombre ? `${saludo}, ${nombre}` : saludo,
      detalle:
        pendientes === 0
          ? 'No te queda nada por hacer hoy.'
          : pendientes === 1
            ? 'Te queda 1 cosa por hacer hoy.'
            : `Te quedan ${pendientes} cosas por hacer hoy.`,
      mood: pendientes === 0 ? 'happy' : 'idle',
    },
    {
      id: 'clases',
      titulo:
        clasesHoy === 0
          ? 'Hoy no tienes clases'
          : clasesHoy === 1
            ? 'Hoy tienes 1 clase'
            : `Hoy tienes ${clasesHoy} clases`,
      detalle:
        clasesHoy === 0
          ? 'El horario se pone dentro de cada materia.'
          : 'Las tienes abajo, en tu semana.',
      mood: clasesHoy > 0 ? 'trabajando' : 'idle',
    },
    {
      id: 'frase',
      titulo: frase.texto,
      detalle: frase.autor ?? 'De Miniout',
      mood: 'happy',
    },
  ];

  return (
    <View
      className="mt-6 rounded-[28px] bg-surface shadow-surface"
      style={{ height: ALTO, overflow: 'hidden' }}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          { position: 'absolute', right: -GOTA * 0.24, bottom: -GOTA * 0.3, zIndex: 1 },
          vuelo,
        ]}
      >
        <InkDrop size={GOTA} mood={slides[activo]?.mood ?? 'idle'} />
      </Animated.View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(evento) => {
          setActivo(Math.round(evento.nativeEvent.contentOffset.x / ancho));
        }}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={{
              width: ancho,
              height: ALTO,
              paddingLeft: 22,
              paddingRight: GOTA * 0.62,
              justifyContent: 'center',
            }}
          >
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 21, lineHeight: 27, letterSpacing: -0.4 }}
              numberOfLines={3}
            >
              {slide.titulo}
            </Text>
            <Text
              className="mt-1.5 font-sans text-muted"
              style={{ fontSize: 13, lineHeight: 19 }}
              numberOfLines={2}
            >
              {slide.detalle}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        className="flex-row items-center gap-1.5"
        style={{ position: 'absolute', left: 22, bottom: 16 }}
      >
        {slides.map((slide, indice) => (
          <View
            key={slide.id}
            style={{
              height: 3,
              width: indice === activo ? 18 : 8,
              borderRadius: 999,
              backgroundColor: indice === activo ? accent : surfaceTertiary,
            }}
          />
        ))}
      </View>
    </View>
  );
}
