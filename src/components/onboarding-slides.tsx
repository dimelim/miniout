import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Appear } from './appear';
import { DiaDemo } from './dia-demo';
import { HintChip } from './hint-chip';
import { LockIcon } from './icons';
import { InkDrop } from './ink-drop';
import { Mark } from './mark';
import { SignatureMark } from './signature-mark';
import { TypingDemo } from './typing-demo';

import { MASCOTA_COLORES } from '@/lib/mascota';

export type SlideProps = { isActive: boolean };

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

const PASOS: {
  accesorio: 'ninguno' | 'casco' | 'gafas' | 'antena';
  color: number;
  candado?: boolean;
}[] = [
  { accesorio: 'ninguno', color: 0 },
  { accesorio: 'ninguno', color: 3, candado: true },
  { accesorio: 'gafas', color: 5 },
  { accesorio: 'casco', color: 2 },
  { accesorio: 'antena', color: 1 },
];

const PROMESAS = [
  'Toda tu información está encriptada',
  'Tus notas se guardan cifradas',
  'Nada viaja en claro por internet',
  'Tu código de MiniLock no sale del teléfono',
];

export function MascotaSlide({ isActive }: SlideProps) {
  const [paso, setPaso] = useState(0);
  const [promesa, setPromesa] = useState(0);

  const [link, separator, foreground] = useThemeColor(['link', 'separator', 'foreground']);

  const flote = useSharedValue(0);
  const actual = PASOS[paso % PASOS.length];

  useEffect(() => {
    if (!isActive) return;

    flote.value = withRepeat(withTiming(1, { duration: 2200, easing: EASE }), -1, true);
  }, [isActive, flote]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => setPaso((uno) => uno + 1), 1600);

    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => setPromesa((una) => una + 1), 2800);

    return () => clearInterval(timer);
  }, [isActive]);

  const flota = useAnimatedStyle(() => ({
    transform: [{ translateY: flote.value * -10 }],
  }));

  return (
    <View className="flex-1 justify-center gap-7">
      <View className="items-center gap-6 rounded-[24px] bg-surface py-7 shadow-surface">
        <Animated.View style={flota}>
          <InkDrop
            size={104}
            mood="happy"
            color={MASCOTA_COLORES[actual.color]}
            accesorio={actual.accesorio}
            candado={actual.candado}
          />
        </Animated.View>

        <View className="flex-row items-center gap-2.5">
          {MASCOTA_COLORES.map((color, indice) => {
            const activo = indice === actual.color;

            return (
              <View
                key={color}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: activo ? foreground : 'transparent',
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    backgroundColor: color,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View className="gap-2">
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.6 }}
        >
          Y esta te acompaña
        </Text>
        <Text className="font-sans text-muted" style={{ fontSize: 16, lineHeight: 25 }}>
          Vive en tu inicio, te dice qué te falta y te cuida las notas con un código si
          quieres. Le pones nombre, color y qué lleva puesto.
        </Text>

        <View
          className="mt-2 flex-row items-center gap-2.5 rounded-[16px] px-3.5"
          style={{ borderWidth: 1, borderColor: separator, height: 52 }}
        >
          <LockIcon color={link} size={15} />

          <View className="flex-1">
            <Appear key={promesa} rise={7}>
              <Text
                className="font-medium"
                style={{ fontSize: 14, lineHeight: 19, color: link }}
              >
                {PROMESAS[promesa % PROMESAS.length]}
              </Text>
            </Appear>
          </View>
        </View>
      </View>
    </View>
  );
}

export function MarcaSlide({ isActive }: SlideProps) {
  return (
    <View className="flex-1 justify-between py-2">
      <View className="items-center gap-4 pt-6">
        <Mark size={80} />
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 42, lineHeight: 46, letterSpacing: -0.8 }}
        >
          Miniout
        </Text>
        <Text
          className="max-w-[270px] text-center font-sans text-muted"
          style={{ fontSize: 16, lineHeight: 25 }}
        >
          Apuntes y tareas de universidad, donde escribir es lo primero.
        </Text>
      </View>

      <View className="gap-3 pb-4">
        <Text className="text-center font-medium text-muted" style={{ fontSize: 12 }}>
          Escribe normal, el resto lo pone la app
        </Text>
        <TypingDemo isActive={isActive} />
      </View>
    </View>
  );
}

const HINTS = [
  {
    text: 'cálculo',
    tooltip: 'La materia que leyó del texto. Tócala otra vez para quitarla.',
  },
  {
    text: 'viernes',
    tooltip: 'La fecha que leyó del texto. Manda la nota al día que toca.',
  },
];

export function CapturaSlide(_: SlideProps) {
  const [openHint, setOpenHint] = useState<string | null>(null);
  const fieldBackground = useThemeColor('background-tertiary');
  const accent = useThemeColor('accent');

  return (
    <View className="flex-1 justify-center gap-6">
      <View className="gap-3">
        <View className="rounded-[20px] bg-surface p-4 shadow-surface">
          <Text className="font-sans text-foreground" style={{ fontSize: 15, lineHeight: 23 }}>
            Parcial de cálculo el viernes, entra hasta continuidad
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-1.5">
            {HINTS.map((hint) => (
              <HintChip
                key={hint.text}
                text={hint.text}
                tooltip={hint.tooltip}
                isOpen={openHint === hint.text}
                onToggle={() => setOpenHint((current) => (current === hint.text ? null : hint.text))}
              />
            ))}
          </View>
          <Text className="mt-2.5 font-sans text-muted" style={{ fontSize: 11 }}>
            Tócalas para ver qué son
          </Text>
        </View>

        <View
          className="flex-row items-center rounded-[14px] border border-border px-4 py-3.5"
          style={{ backgroundColor: fieldBackground }}
        >
          <Text className="font-sans text-muted" style={{ fontSize: 15 }}>
            Escribe algo
          </Text>
          <View
            className="ml-1 h-[18px] w-0.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.6 }}
        >
          El campo ya está abierto
        </Text>
        <Text className="font-sans text-muted" style={{ fontSize: 16, lineHeight: 25 }}>
          No hay botón para crear una nota. La materia y la fecha las lee del texto y te
          las propone: si no te sirven, las quitas de un toque.
        </Text>
      </View>
    </View>
  );
}

export function DiaSlide({ isActive }: SlideProps) {
  return (
    <View className="flex-1 gap-6 pt-2">
      <DiaDemo isActive={isActive} />

      <View className="gap-2">
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.6 }}
        >
          Lo que mencione un día, cae aquí
        </Text>
        <Text className="font-sans text-muted" style={{ fontSize: 16, lineHeight: 25 }}>
          Sin crear tareas aparte. Escribes la nota y, si hablaba de un día, aparece en
          el que toca.
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <SignatureMark isActive={isActive} width={220} />
      </View>
    </View>
  );
}
