import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { DiscordIcon, GoogleIcon, MailIcon } from '@/components/icons';
import { Mark } from '@/components/mark';
import { useAuth } from '@/lib/auth-store';
import { isProviderConfigured, signInWithProvider, type Provider } from '@/lib/oauth';

const ENTER = 240;

export default function Entrar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, isConfigured } = useAuth();

  const [busy, setBusy] = useState<Provider | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const [foreground, danger] = useThemeColor(['foreground', 'danger']);

  const withProvider = async (provider: Provider) => {
    setProblem(null);

    if (!isConfigured) {
      setProblem('La app todavía no tiene servidor. Entra con correo o vuelve luego.');
      return;
    }
    if (!isProviderConfigured(provider)) {
      setProblem(`Todavía no está configurado el acceso con ${provider}.`);
      return;
    }

    setBusy(provider);

    try {
      await signIn(await signInWithProvider(provider));
      router.replace('/captura');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo entrar';
      if (message !== 'cancelado') setProblem(message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
        <BackButton />
      </View>

      <View
        className="flex-1 justify-between px-7 pt-8"
        style={{ paddingBottom: insets.bottom + 24 }}
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
            Así los tienes en cualquier teléfono y no dependes de este. Se escribe en el
            dispositivo primero, la cuenta solo sincroniza.
          </Text>
        </View>

        <View className="gap-2.5">
          {problem && (
            <Animated.View entering={FadeIn.duration(180)} className="pb-1">
              <Text style={{ fontSize: 13, lineHeight: 19, color: danger }}>{problem}</Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.duration(ENTER)}>
            <Button
              size="lg"
              variant="tertiary"
              isDisabled={busy !== null}
              onPress={() => withProvider('google')}
            >
              <GoogleIcon size={18} />
              <Button.Label>
                {busy === 'google' ? 'Abriendo Google' : 'Continuar con Google'}
              </Button.Label>
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(60)}>
            <Button
              size="lg"
              variant="tertiary"
              isDisabled={busy !== null}
              onPress={() => withProvider('discord')}
            >
              <DiscordIcon size={18} />
              <Button.Label>
                {busy === 'discord' ? 'Abriendo Discord' : 'Continuar con Discord'}
              </Button.Label>
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(120)}>
            <Button
              size="lg"
              variant="tertiary"
              isDisabled={busy !== null}
              onPress={() => router.push('/acceder')}
            >
              <MailIcon color={foreground} size={18} />
              <Button.Label>Continuar con correo</Button.Label>
            </Button>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
