import { Chip } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { DiaDemo } from './dia-demo';
import { HintChip } from './hint-chip';
import { Mark } from './mark';
import { SignatureMark } from './signature-mark';
import { TypingDemo } from './typing-demo';

export type SlideProps = { isActive: boolean };

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
