import * as WebBrowser from 'expo-web-browser';
import { Button } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';

import {
  GITHUB_PATH,
  Glyph,
  REPO,
  REPO_URL,
  STAR_PATH,
  useStars,
} from '@/components/github-card';
import { Hoja } from '@/components/hoja';

export default function Github() {
  const estrellas = useStars();

  const [foreground, accent] = useThemeColor(['foreground', 'accent']);

  return (
    <Hoja>
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
        Todo lo que ves aquí está publicado con licencia Apache-2.0: el código de la app y el
        del servidor. Puedes leerlo, copiarlo y proponer cambios.
      </Text>

      {estrellas !== null && (
        <View className="mt-6 flex-row items-center gap-3">
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

      <Button size="lg" className="mt-7" onPress={() => WebBrowser.openBrowserAsync(REPO_URL)}>
        <Button.Label>Abrir en GitHub</Button.Label>
      </Button>
    </Hoja>
  );
}
