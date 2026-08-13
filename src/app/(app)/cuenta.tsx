import { useRouter } from 'expo-router';
import { Button, Card, Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { Aviso } from '@/components/aviso';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { GITHUB_PATH, Glyph } from '@/components/github-card';
import { CheckIcon, ChevronRightIcon, DiscordIcon, GoogleIcon, MailIcon } from '@/components/icons';
import { InkDrop } from '@/components/ink-drop';
import { UserAvatar } from '@/components/user-avatar';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useAbrir } from '@/lib/navigate';

export default function Cuenta() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const abrir = useAbrir();
  const { account, session, signIn, signOut, saveAvatar, markIntroSeen } = useAuth();

  const [cerrando, setCerrando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, foreground, muted] = useThemeColor(['accent', 'foreground', 'muted']);

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

  const salir = async () => {
    setSaliendo(false);
    await signOut();
    router.replace('/');
  };

  const cambiarFoto = async (url: string | null) => {
    setProblema(null);

    try {
      await saveAvatar(url);
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo cambiar la foto');
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
            <UserAvatar
              size={52}
              url={account?.avatarUrl}
              displayName={account?.displayName}
              email={account?.email}
            />

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

        {account && !account.introSeen && (
          <Appear delay={140} className="mt-3">
            <Card variant="secondary" className="flex-row items-start gap-4">
              <InkDrop size={38} mood="happy" />

              <View className="flex-1">
                <Text
                  className="font-display text-foreground"
                  style={{ fontSize: 18, lineHeight: 25, letterSpacing: -0.3 }}
                >
                  Esto son tus ajustes
                </Text>
                <Text
                  className="mt-1.5 font-sans text-muted"
                  style={{ fontSize: 14, lineHeight: 21 }}
                >
                  Aquí eliges tu foto, ves con qué correo entras y con qué método. Si algún día
                  dejas la sesión abierta en otro teléfono, desde aquí la cierras sin salirte de
                  este.
                </Text>

                <View className="mt-3 flex-row">
                  <Button size="sm" variant="tertiary" onPress={markIntroSeen}>
                    <Button.Label>Entendido</Button.Label>
                  </Button>
                </View>
              </View>
            </Card>
          </Appear>
        )}

        {(account?.photos.length ?? 0) > 0 && (
          <Appear delay={180} className="mt-8">
            <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
              Tu foto
            </Text>

            <Card className="gap-4">
              <Text className="font-sans text-muted" style={{ fontSize: 13, lineHeight: 20 }}>
                Usamos la de la cuenta con la que entraste. Puedes cambiarla o dejar tu inicial.
              </Text>

              <View className="flex-row items-center gap-3">
                {account?.photos.map((foto) => (
                  <Opcion
                    key={foto.url}
                    activa={account.avatarUrl === foto.url}
                    accent={accent}
                    onPress={() => cambiarFoto(foto.url)}
                    etiqueta={`Usar la foto de ${foto.provider}`}
                  >
                    <UserAvatar size={52} url={foto.url} />
                  </Opcion>
                ))}

                <Opcion
                  activa={!account?.avatarUrl}
                  accent={accent}
                  onPress={() => cambiarFoto(null)}
                  etiqueta="Usar tu inicial"
                >
                  <UserAvatar
                    size={52}
                    displayName={account?.displayName}
                    email={account?.email}
                  />
                </Opcion>
              </View>
            </Card>
          </Appear>
        )}

        <Appear delay={220} className="mt-8">
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

        <Appear delay={260} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Seguridad
          </Text>

          <View className="gap-2.5">
            <Fila
              titulo="Ajustes"
              descripcion="Tu nombre, dónde estudias, tus notas y MiniLock."
              onPress={() => abrir('/ajustes')}
              muted={muted}
            />

            <Fila
              titulo={account?.hasPassword ? 'Cambiar contraseña' : 'Poner una contraseña'}
              descripcion={
                account?.hasPassword
                  ? 'Se cierran las sesiones de los demás dispositivos.'
                  : 'Entraste con Google o Discord. Con una contraseña también podrás entrar con tu correo.'
              }
              onPress={() => abrir('/contrasena')}
              muted={muted}
            />

            <Card className="gap-3">
              <View>
                <Text className="font-medium text-foreground" style={{ fontSize: 16 }}>
                  Cerrar las demás sesiones
                </Text>
                <Text
                  className="mt-0.5 font-sans text-muted"
                  style={{ fontSize: 13, lineHeight: 19 }}
                >
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

              {aviso && <Aviso mensaje={aviso} tono="exito" />}
              {problema && <Aviso mensaje={problema} />}
            </Card>
          </View>
        </Appear>

        <Appear delay={300} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Miniout
          </Text>

          <View className="gap-2.5">
            <PressableFeedback
              onPress={() => abrir('/github')}
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

            <Button variant="tertiary" size="md" onPress={() => setSaliendo(true)}>
              <Button.Label>Cerrar sesión</Button.Label>
            </Button>
          </View>
        </Appear>
      </ScrollView>

      <ConfirmDialog
        visible={saliendo}
        titulo="Cerrar sesión"
        mensaje={
          account?.email
            ? `Vas a salir de ${account.email} en este teléfono. Tus notas siguen en tu cuenta.`
            : 'Vas a salir en este teléfono. Tus notas siguen en tu cuenta.'
        }
        confirmar="Cerrar sesión"
        onConfirm={salir}
        onCancel={() => setSaliendo(false)}
      />
    </View>
  );
}

function Opcion({
  activa,
  accent,
  onPress,
  etiqueta,
  children,
}: {
  activa: boolean;
  accent: string;
  onPress: () => void;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={etiqueta}
      style={{
        padding: 3,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: activa ? accent : 'transparent',
      }}
    >
      {children}
      {activa && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 20,
            height: 20,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: accent,
          }}
        >
          <CheckIcon color="#1d1913" size={12} />
        </View>
      )}
    </PressableFeedback>
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
