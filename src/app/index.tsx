import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mark } from '@/components/mark';
import { RuledPaper } from '@/components/ruled-paper';

const ENTER = 240;

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.5} />

      <View
        className="flex-1 justify-between px-7"
        style={{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + 28 }}
      >
        <View>
          <Animated.View entering={FadeIn.duration(ENTER)}>
            <Mark size={44} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(80)}>
            <Text
              className="mt-9 font-display text-foreground"
              style={{ fontSize: 40, lineHeight: 44, letterSpacing: -0.8 }}
            >
              Saca lo que tienes en la cabeza
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(160)}>
            <Text
              className="mt-5 max-w-[300px] font-sans text-muted"
              style={{ fontSize: 17, lineHeight: 27 }}
            >
              Abres Miniout y ya estas escribiendo. La materia y la fecha las propone
              solo, y decides tu si se quedan.
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.duration(ENTER).delay(240)} className="gap-2">
          <Button size="lg" onPress={() => router.replace('/captura')}>
            <Button.Label>Escribir algo</Button.Label>
          </Button>
          <Button size="lg" variant="ghost" onPress={() => router.push('/que-hace')}>
            <Button.Label>Ver que hace</Button.Label>
          </Button>
        </Animated.View>
      </View>
    </View>
  );
}
