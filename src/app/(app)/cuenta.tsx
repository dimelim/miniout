import { useRouter } from 'expo-router';
import { Button, Card, Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { initial } from '@/components/avatar-button';
import { GITHUB_PATH, Glyph } from '@/components/github-card';
import { ChevronRightIcon, DiscordIcon, GoogleIcon, MailIcon } from '@/components/icons';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';

export default function Cuenta() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { account, session, signIn, signOut } = useAuth();

  const [cerrando, setCerrando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, accentForeground, foreground, muted, danger, success] = useThemeColor([
    'accent',
    'accent-foreground',
    'foreground',
    'muted',
    'danger',
    'success',
  ]);

  const cerrarOtras = async () => {
    if (!session) return;

    setCerrando(true);
    setAviso(null);
    setProblema(null);

    try {
      await signIn(await api.logoutOthers(session.accessToken));
      setAviso('Listo, las demás sesiones se cerraron.');
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo cerrar las sesiones');
    } finally {
      setCerrando(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
          >
            Cuenta
          </Text>
        </Appear>

        <Appear delay={70} className="mt-6">
          <Card className="flex-row items-center gap-4">
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accent,
              }}
            >
              <Text
                className="font-semibold"
                style={{ fontSize: 22, color: accentForeground }}
              >
                {initial(account?.displayName, account?.email)}
              </Text>
            </View>

            <View className="flex-1">
              <Text
                className="font-display text-foreground"
                style={{ fontSize: 21, letterSpacing: -0.3 }}
              >
                {account?.displayName ?? 'Sin nombre'}
              </Text>
              <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
                {account?.email ?? ''}
              </Text>
            </View>
          </Card>
        </Appear>

        <Appear delay={140} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Cómo entras
          </Text>

          <Card className="gap-3">
            <View className="flex-row items-center gap-3">
              <MailIcon color={muted} size={17} />
              <Text className="flex-1 font-sans text-foreground" style={{ fontSize: 15 }}>
                {account?.email ?? ''}
              </Text>
              {account?.hasPassword && (
                <Chip size="sm" variant="secondary">
                  <Chip.Label>Con contraseña</Chip.Label>
                </Chip>
              )}
            </View>

            {(account?.providers.length ?? 0) > 0 && (
              <View className="flex-row items-center gap-2">
                {account?.providers.includes('google') && (
                  <View className="flex-row items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <GoogleIcon size={14} />
                    <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
                      Google
                    </Text>
                  </View>
                )}
                {account?.providers.includes('discord') && (
                  <View className="flex-row items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <DiscordIcon size={14} />
                    <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
                      Discord
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        </Appear>

        <Appear delay={210} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Seguridad
          </Text>

          <View className="gap-2.5">
            <Fila
              titulo={account?.hasPassword ? 'Cambiar contraseña' : 'Poner una contraseña'}
              descripcion={
                account?.hasPassword
                  ? 'Se cierran las sesiones de los demás dispositivos.'
                  : 'Entraste con Google o Discord. Con una contraseña también podrás entrar con tu correo.'
              }
              onPress={() => router.push('/contrasena')}
              muted={muted}
            />

            <Card className="gap-3">
              <View>
                <Text className="font-medium text-foreground" style={{ fontSize: 16 }}>
                  Cerrar las demás sesiones
                </Text>
                <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13, lineHeight: 19 }}>
                  Este teléfono sigue dentro. Cualquier otro que tenga tu cuenta abierta se sale.
                </Text>
              </View>

              <Button
                variant="tertiary"
                size="md"
                onPress={cerrarOtras}
                isDisabled={cerrando || !session}
              >
                <Button.Label>{cerrando ? 'Cerrando' : 'Cerrar las demás'}</Button.Label>
              </Button>

              {aviso && (
                <Text accessibilityLiveRegion="polite" style={{ fontSize: 13, color: success }}>
                  {aviso}
                </Text>
              )}
              {problema && (
                <Text accessibilityLiveRegion="polite" style={{ fontSize: 13, color: danger }}>
                  {problema}
                </Text>
              )}
            </Card>
          </View>
        </Appear>

        <Appear delay={280} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Miniout
          </Text>

          <View className="gap-2.5">
            <PressableFeedback
              onPress={() => router.push('/github')}
              accessibilityRole="button"
              accessibilityLabel="Miniout en GitHub"
              className="flex-row items-center gap-3 rounded-[20px] bg-surface p-4 shadow-surface"
            >
              <PressableFeedback.Highlight />
              <Glyph d={GITHUB_PATH} color={foreground} size={18} />
              <Text className="flex-1 font-medium text-foreground" style={{ fontSize: 16 }}>
                Código abierto
              </Text>
              <ChevronRightIcon color={muted} size={16} />
            </PressableFeedback>

            <Button variant="tertiary" size="md" onPress={signOut}>
              <Button.Label>Cerrar sesión</Button.Label>
            </Button>
          </View>
        </Appear>
      </ScrollView>
    </View>
  );
}

function Fila({
  titulo,
  descripcion,
  onPress,
  muted,
}: {
  titulo: string;
  descripcion: string;
  onPress: () => void;
  muted: string;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      className="rounded-[20px] bg-surface p-4 shadow-surface"
    >
      <PressableFeedback.Highlight />
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="font-medium text-foreground" style={{ fontSize: 16 }}>
            {titulo}
          </Text>
          <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13, lineHeight: 19 }}>
            {descripcion}
          </Text>
        </View>
        <ChevronRightIcon color={muted} size={16} />
      </View>
    </PressableFeedback>
  );
}
