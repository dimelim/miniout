import { useRouter } from 'expo-router';
import { Button, Input, Label, TextField } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { BackButton } from '@/components/back-button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PasswordField } from '@/components/password-field';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useAvisar } from '@/lib/avisos';

const SE_VA = [
  'Tus notas, con sus imágenes y sus firmas.',
  'Tus proyectos.',
  'Tus semestres, con las materias, el horario y las calificaciones.',
  'Tu cuenta y la forma de entrar, sea el correo, Google o Discord.',
];

export default function BorrarCuenta() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, session, signOut } = useAuth();
  const avisar = useAvisar();

  const [contrasena, setContrasena] = useState('');
  const [correo, setCorreo] = useState('');
  const [preguntando, setPreguntando] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const separator = useThemeColor('separator');

  const conContrasena = account?.hasPassword ?? false;
  const listo = conContrasena
    ? contrasena.length > 0
    : correo.trim().toLowerCase() === (account?.email ?? '').toLowerCase();

  const borrar = async () => {
    setPreguntando(false);

    if (!session) return;

    setBorrando(true);

    try {
      await api.removeAccount(session.accessToken, {
        password: conContrasena ? contrasena : undefined,
        email: conContrasena ? undefined : correo.trim(),
      });

      await signOut();
      router.replace('/');
    } catch (error) {
      avisar(error instanceof ApiError ? error.message : 'No se pudo borrar la cuenta');
      setBorrando(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24 }}>
        <BackButton />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear rise={6}>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
          >
            Borrar la cuenta
          </Text>
          <Text className="mt-2 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            Se borra todo en el momento, de este teléfono y del servidor. No hay papelera ni
            forma de recuperarlo.
          </Text>
        </Appear>

        <Appear delay={70} className="mt-6">
          <View className="rounded-[20px] bg-surface px-4 shadow-surface">
            {SE_VA.map((linea, indice) => (
              <View
                key={linea}
                style={{
                  paddingVertical: 13,
                  borderTopWidth: indice === 0 ? 0 : 1,
                  borderTopColor: separator,
                }}
              >
                <Text
                  className="font-sans text-foreground"
                  style={{ fontSize: 14, lineHeight: 21 }}
                >
                  {linea}
                </Text>
              </View>
            ))}
          </View>
        </Appear>

        <Appear delay={120} className="mt-6">
          {conContrasena ? (
            <PasswordField
              label="Tu contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              error={null}
              autoComplete="current-password"
            />
          ) : (
            <TextField>
              <Label>Escribe tu correo para confirmar</Label>
              <Input
                value={correo}
                onChangeText={setCorreo}
                placeholder={account?.email ?? ''}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="done"
              />
            </TextField>
          )}
        </Appear>

        <Button
          size="lg"
          variant="danger"
          className="mt-6"
          onPress={() => setPreguntando(true)}
          isDisabled={!listo || borrando}
        >
          <Button.Label>{borrando ? 'Borrando' : 'Borrar la cuenta'}</Button.Label>
        </Button>

        <Text
          className="mt-4 text-center font-sans text-muted"
          style={{ fontSize: 12, lineHeight: 18 }}
        >
          Si solo quieres salir de este teléfono, cierra la sesión desde Cuenta.
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={preguntando}
        titulo="Borrar la cuenta"
        mensaje={
          account?.email
            ? `Se borra ${account.email} y todo lo que tiene dentro. Esto no se puede deshacer.`
            : 'Se borra tu cuenta y todo lo que tiene dentro. Esto no se puede deshacer.'
        }
        confirmar="Borrar para siempre"
        onConfirm={borrar}
        onCancel={() => setPreguntando(false)}
      />
    </View>
  );
}
