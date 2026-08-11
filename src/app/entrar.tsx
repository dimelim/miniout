import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscordIcon, GoogleIcon, MailIcon } from '@/components/icons';
import { Mark } from '@/components/mark';

const ENTER = 240;

export default function Entrar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const foreground = useThemeColor('foreground');

  const pending = () => router.replace('/captura');

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-1 justify-between px-7"
        style={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }}
      >
        <View>
          <Mark size={40} />
          <Text
            className="mt-8 font-display text-foreground"
            style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.7 }}
          >
            Guarda tus apuntes en tu cuenta
          </Text>
          <Text
            className="mt-4 max-w-[300px] font-sans text-muted"
            style={{ fontSize: 16, lineHeight: 25 }}
          >
            Asi los tienes en cualquier telefono y no dependes de este. Se escribe en el
            dispositivo primero, la cuenta solo sincroniza.
          </Text>
        </View>

        <View className="gap-2.5">
          <Animated.View entering={FadeInDown.duration(ENTER)}>
            <Button size="lg" variant="secondary" onPress={pending}>
              <GoogleIcon size={18} />
              <Button.Label>Continuar con Google</Button.Label>
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(60)}>
            <Button size="lg" variant="secondary" onPress={pending}>
              <DiscordIcon size={18} />
              <Button.Label>Continuar con Discord</Button.Label>
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(120)}>
            <Button size="lg" variant="tertiary" onPress={pending}>
              <MailIcon color={foreground} size={18} />
              <Button.Label>Continuar con correo</Button.Label>
            </Button>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
