import * as Linking from 'expo-linking';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { CloseIcon } from './icons';
import { InkDrop } from './ink-drop';

import { buscarVersionNueva, type VersionNueva } from '@/lib/release';

export function NuevaVersion() {
  const [version, setVersion] = useState<VersionNueva | null>(null);
  const [escondida, setEscondida] = useState(false);

  const [muted] = useThemeColor(['muted']);

  useEffect(() => {
    let vivo = true;

    buscarVersionNueva().then((encontrada) => {
      if (vivo) setVersion(encontrada);
    });

    return () => {
      vivo = false;
    };
  }, []);

  if (!version || escondida) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      exiting={FadeOut.duration(160)}
      className="mt-6 rounded-[24px] bg-surface p-4 shadow-surface"
    >
      <View className="flex-row items-start gap-3">
        <InkDrop size={38} mood="happy" />

        <View className="flex-1">
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 18, lineHeight: 24, letterSpacing: -0.3 }}
          >
            {`Hay una versión nueva, la ${version.version}`}
          </Text>
          <Text className="mt-1 font-sans text-muted" style={{ fontSize: 13, lineHeight: 20 }}>
            Esta trae cosas que no llegan por aire, así que hay que instalarla a mano.
          </Text>
        </View>

        <PressableFeedback
          onPress={() => setEscondida(true)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Ahora no"
          style={{ padding: 6, borderRadius: 999 }}
        >
          <PressableFeedback.Highlight />
          <CloseIcon color={muted} size={14} />
        </PressableFeedback>
      </View>

      <Button
        size="md"
        className="mt-3"
        onPress={() => Linking.openURL(version.apk ?? version.pagina)}
      >
        <Button.Label>Descargarla</Button.Label>
      </Button>
    </Animated.View>
  );
}
