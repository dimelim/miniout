import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { CheckIcon, CloseIcon } from '@/components/icons';
import { KeyboardSpace } from '@/components/keyboard-space';
import { SendButton } from '@/components/send-button';
import { useAvisar } from '@/lib/avisos';
import {
  DEFAULT_QUOTES,
  FUENTES,
  MAX_QUOTE_LENGTH,
  RITMOS,
  listaDeFrases,
  quoteError,
  quoteOfTheDay,
  readQuoteSettings,
  saveQuoteSettings,
  type QuoteSettings,
} from '@/lib/quotes';

export default function Frases() {
  const insets = useSafeAreaInsets();
  const avisar = useAvisar();

  const [settings, setSettings] = useState<QuoteSettings>(DEFAULT_QUOTES);
  const [nueva, setNueva] = useState('');

  const [accent, accentForeground, muted, foreground, surfaceTertiary, background] =
    useThemeColor([
      'accent',
      'accent-foreground',
      'muted',
      'foreground',
      'surface-tertiary',
      'background',
    ]);

  useEffect(() => {
    readQuoteSettings().then(setSettings);
  }, []);

  const cambiar = (patch: Partial<QuoteSettings>) => {
    const siguiente = { ...settings, ...patch };
    setSettings(siguiente);
    saveQuoteSettings(siguiente);
  };

  const lista = useMemo(() => listaDeFrases(settings), [settings]);
  const deHoy = useMemo(() => quoteOfTheDay(settings), [settings]);

  const agregar = () => {
    const problem = quoteError(nueva);

    if (problem) {
      avisar(problem);
      return;
    }

    cambiar({ own: [...settings.own, nueva.trim()] });
    setNueva('');
    Keyboard.dismiss();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 25, letterSpacing: -0.4 }}
          >
            Frases
          </Text>
        </Appear>

        <Appear delay={60} className="mt-5">
          <View className="rounded-[22px] bg-surface p-5 shadow-surface">
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 20, lineHeight: 28, letterSpacing: -0.3 }}
            >
              {deHoy.texto}
            </Text>
            {deHoy.autor && (
              <Text className="mt-2 font-medium text-muted" style={{ fontSize: 13 }}>
                {deHoy.autor}
              </Text>
            )}
          </View>
        </Appear>

        <Appear delay={110} className="mt-7">
          <Text className="mb-3 font-medium text-muted" style={{ fontSize: 12 }}>
            De dónde salen
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {FUENTES.map((fuente) => (
              <Pastilla
                key={fuente.id}
                activa={settings.source === fuente.id}
                etiqueta={fuente.label}
                onPress={() => cambiar({ source: fuente.id })}
                accent={accent}
                accentForeground={accentForeground}
                fondo={surfaceTertiary}
                texto={foreground}
              />
            ))}
          </View>
        </Appear>

        <Appear delay={150} className="mt-7">
          <Text className="mb-3 font-medium text-muted" style={{ fontSize: 12 }}>
            Cada cuánto cambia
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {RITMOS.map((ritmo) => (
              <Pastilla
                key={ritmo.id}
                activa={settings.rate === ritmo.id}
                etiqueta={ritmo.label}
                onPress={() => cambiar({ rate: ritmo.id })}
                accent={accent}
                accentForeground={accentForeground}
                fondo={surfaceTertiary}
                texto={foreground}
              />
            ))}
          </View>
        </Appear>

        <Appear delay={190} className="mt-7">
          <Text className="mb-3 font-medium text-muted" style={{ fontSize: 12 }}>
            {settings.own.length === 1 ? 'Tu frase' : `Tus frases (${settings.own.length})`}
          </Text>

          <Animated.View layout={LinearTransition.duration(200)} className="gap-2">
            {settings.own.map((frase) => (
              <View
                key={frase}
                className="flex-row items-start gap-3 rounded-[18px] bg-surface p-4 shadow-surface"
              >
                <Text
                  className="flex-1 font-sans text-foreground"
                  style={{ fontSize: 15, lineHeight: 22 }}
                >
                  {frase}
                </Text>

                <PressableFeedback
                  onPress={() =>
                    cambiar({ own: settings.own.filter((otra) => otra !== frase) })
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Quitar la frase"
                  style={{ padding: 6, borderRadius: 999 }}
                >
                  <PressableFeedback.Highlight />
                  <CloseIcon color={muted} size={14} />
                </PressableFeedback>
              </View>
            ))}
          </Animated.View>

          <View
            className="mt-2 flex-row items-center gap-3 rounded-[18px] px-4 py-2"
            style={{ borderWidth: 1.5, borderColor: surfaceTertiary }}
          >
            <TextInput
              value={nueva}
              onChangeText={setNueva}
              placeholder="Escribe una tuya"
              placeholderTextColor={muted}
              selectionColor={accent}
              cursorColor={accent}
              maxLength={MAX_QUOTE_LENGTH}
              returnKeyType="done"
              onSubmitEditing={agregar}
              accessibilityLabel="Tu frase"
              className="flex-1 font-sans text-foreground"
              style={{ fontSize: 15, paddingVertical: 10, paddingHorizontal: 0 }}
            />

            <SendButton
              activo={Boolean(nueva.trim())}
              color={accent}
              fondo={surfaceTertiary}
              contraste={background}
              muted={muted}
              etiqueta="Añadir la frase"
              onPress={agregar}
            />
          </View>
        </Appear>

        <Appear delay={230} className="mt-7">
          <Text className="mb-3 font-medium text-muted" style={{ fontSize: 12 }}>
            {`Las que pueden salir (${lista.length})`}
          </Text>

          <View className="gap-2">
            {lista.map((frase, indice) => (
              <View
                key={`${frase.texto}-${indice}`}
                className="rounded-[16px] px-4 py-3"
                style={{ backgroundColor: surfaceTertiary }}
              >
                <Text
                  className="font-sans text-foreground"
                  style={{ fontSize: 14, lineHeight: 21 }}
                >
                  {frase.texto}
                </Text>
                {frase.autor && (
                  <Text className="mt-1 font-medium text-muted" style={{ fontSize: 12 }}>
                    {frase.autor}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </Appear>

        <KeyboardSpace bottomInset={insets.bottom} />
      </ScrollView>
    </View>
  );
}

function Pastilla({
  activa,
  etiqueta,
  onPress,
  accent,
  accentForeground,
  fondo,
  texto,
}: {
  activa: boolean;
  etiqueta: string;
  onPress: () => void;
  accent: string;
  accentForeground: string;
  fondo: string;
  texto: string;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={etiqueta}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: activa ? accent : fondo,
      }}
    >
      <PressableFeedback.Highlight />
      {activa && <CheckIcon color={accentForeground} size={12} />}
      <Text
        className="font-medium"
        style={{ fontSize: 14, color: activa ? accentForeground : texto }}
      >
        {etiqueta}
      </Text>
    </PressableFeedback>
  );
}
