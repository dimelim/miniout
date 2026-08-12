import * as WebBrowser from 'expo-web-browser';
import { Button } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GITHUB_PATH,
  Glyph,
  REPO,
  REPO_URL,
  STAR_PATH,
  useStars,
} from '@/components/github-card';

export default function Github() {
  const insets = useSafeAreaInsets();
  const estrellas = useStars();

  const [foreground, accent] = useThemeColor(['foreground', 'accent']);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3">
          <Glyph d={GITHUB_PATH} color={foreground} size={30} />
          <View className="flex-1">
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 23, letterSpacing: -0.4 }}
            >
              Miniout es código abierto
            </Text>
            <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
              {REPO}
            </Text>
          </View>
        </View>

        <Text className="mt-5 font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
          Todo lo que ves aquí está publicado con licencia Apache-2.0: el código de la app y
          el del servidor. Puedes leerlo, copiarlo y proponer cambios.
        </Text>

        {estrellas !== null && (
          <View className="mt-7 flex-row items-center gap-3">
            <Glyph d={STAR_PATH} color={accent} size={22} />
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 34, letterSpacing: -0.6 }}
            >
              {estrellas}
            </Text>
            <Text className="font-sans text-muted" style={{ fontSize: 14 }}>
              {estrellas === 1 ? 'estrella en GitHub' : 'estrellas en GitHub'}
            </Text>
          </View>
        )}

        <Button size="lg" className="mt-8" onPress={() => WebBrowser.openBrowserAsync(REPO_URL)}>
          <Button.Label>Abrir en GitHub</Button.Label>
        </Button>
      </ScrollView>
    </View>
  );
}
