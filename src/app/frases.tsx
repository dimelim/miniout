import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, PlusIcon } from '@/components/icons';
import {
  DEFAULT_QUOTES,
  MAX_QUOTE_LENGTH,
  quoteError,
  readQuoteSettings,
  saveQuoteSettings,
  type QuoteSettings,
  type QuoteSource,
} from '@/lib/quotes';

export default function Frases() {
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<QuoteSettings>(DEFAULT_QUOTES);
  const [nueva, setNueva] = useState('');
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, accentForeground, muted, foreground, danger] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'foreground',
    'danger',
  ]);

  useEffect(() => {
    readQuoteSettings().then(setSettings);
  }, []);

  const cambiar = (siguiente: QuoteSettings) => {
    setSettings(siguiente);
    saveQuoteSettings(siguiente);
  };

  const agregar = () => {
    const problem = quoteError(nueva);
    setProblema(problem);

    if (problem) return;

    cambiar({ source: 'propias', own: [...settings.own, nueva.trim()] });
    setNueva('');
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
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 25, letterSpacing: -0.4 }}
        >
          Frase del día
        </Text>
        <Text className="mt-2 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
          Usa las de Miniout o escribe las tuyas. Cada día sale una.
        </Text>

        <View className="mt-6 gap-2">
          <Fuente
            titulo="Las de Miniout"
            descripcion="24 frases sobre estudiar y no rendirse."
            activa={settings.source === 'miniout'}
            accent={accent}
            accentForeground={accentForeground}
            onPress={() => cambiar({ ...settings, source: 'miniout' })}
          />
          <Fuente
            titulo="Las mías"
            descripcion={
              settings.own.length === 0
                ? 'Todavía no has escrito ninguna.'
                : `${settings.own.length} ${settings.own.length === 1 ? 'frase tuya' : 'frases tuyas'}.`
            }
            activa={settings.source === 'propias'}
            accent={accent}
            accentForeground={accentForeground}
            onPress={() => cambiar({ ...settings, source: 'propias' })}
          />
        </View>

        {settings.own.length > 0 && (
          <View className="mt-5 gap-1.5">
            {settings.own.map((frase) => (
              <View
                key={frase}
                className="flex-row items-center gap-3 rounded-[16px] bg-surface px-4 py-3 shadow-surface"
              >
                <Text
                  className="flex-1 font-display text-foreground"
                  style={{ fontSize: 16, lineHeight: 23 }}
                >
                  {frase}
                </Text>
                <PressableFeedback
                  onPress={() =>
                    cambiar({ ...settings, own: settings.own.filter((item) => item !== frase) })
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${frase}`}
                  style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}
                >
                  <PressableFeedback.Highlight />
                  <Text className="font-medium" style={{ fontSize: 13, color: muted }}>
                    Quitar
                  </Text>
                </PressableFeedback>
              </View>
            ))}
          </View>
        )}

        <View className="mt-6 flex-row items-end gap-3">
          <TextInput
            value={nueva}
            onChangeText={setNueva}
            placeholder="Escribe tu frase"
            placeholderTextColor={muted}
            selectionColor={accent}
            cursorColor={accent}
            maxLength={MAX_QUOTE_LENGTH}
            returnKeyType="done"
            onSubmitEditing={agregar}
            accessibilityLabel="Nueva frase"
            className="font-sans"
            style={{
              flex: 1,
              fontSize: 15,
              color: foreground,
              borderBottomWidth: 1.5,
              borderBottomColor: accent,
              paddingBottom: 8,
              paddingHorizontal: 0,
            }}
          />

          <Button size="sm" variant="tertiary" onPress={agregar}>
            <PlusIcon color={muted} size={14} />
            <Button.Label>Añadir</Button.Label>
          </Button>
        </View>

        {problema && (
          <Text
            accessibilityLiveRegion="polite"
            className="mt-2"
            style={{ fontSize: 13, color: danger }}
          >
            {problema}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function Fuente({
  titulo,
  descripcion,
  activa,
  accent,
  accentForeground,
  onPress,
}: {
  titulo: string;
  descripcion: string;
  activa: boolean;
  accent: string;
  accentForeground: string;
  onPress: () => void;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={`${titulo}. ${descripcion}`}
      className="rounded-[18px] bg-surface p-4 shadow-surface"
      style={{ borderWidth: 1.5, borderColor: activa ? accent : 'transparent' }}
    >
      <PressableFeedback.Highlight />
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="font-medium text-foreground" style={{ fontSize: 16 }}>
            {titulo}
          </Text>
          <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
            {descripcion}
          </Text>
        </View>

        {activa && (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: accent,
            }}
          >
            <CheckIcon color={accentForeground} size={13} />
          </View>
        )}
      </View>
    </PressableFeedback>
  );
}
