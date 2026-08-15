import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PasswordField } from '@/components/password-field';
import { StrengthBar } from '@/components/strength-bar';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useAvisar } from '@/lib/avisos';
import { passwordError } from '@/lib/credentials';

export default function Contrasena() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, session, signIn } = useAuth();
  const avisar = useAvisar();

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const tieneContrasena = account?.hasPassword ?? false;

  const guardar = async () => {
    const next = passwordError(nueva);
    setError(next);

    if (next || !session) return;

    if (tieneContrasena && !actual) {
      avisar('Escribe tu contraseña actual');
      return;
    }

    setGuardando(true);

    try {
      const renovada = await api.changePassword(session.accessToken, {
        currentPassword: tieneContrasena ? actual : undefined,
        newPassword: nueva,
      });

      await signIn(renovada);
      router.back();
    } catch (problem) {
      avisar(problem instanceof ApiError ? problem.message : 'No se pudo cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
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
          {tieneContrasena ? 'Cambiar contraseña' : 'Poner una contraseña'}
        </Text>
        <Text className="mt-2 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
          {tieneContrasena
            ? 'Al cambiarla se cierran las sesiones de los demás dispositivos. Este sigue dentro.'
            : `Entraste con otro método. Si pones una contraseña también podrás entrar con ${account?.email ?? 'tu correo'}.`}
        </Text>

        <View className="mt-7 gap-5">
          {tieneContrasena && (
            <PasswordField
              label="Contraseña actual"
              value={actual}
              onChangeText={setActual}
              error={null}
              autoComplete="current-password"
            />
          )}

          <View className="gap-2.5">
            <PasswordField
              label="Contraseña nueva"
              value={nueva}
              onChangeText={setNueva}
              error={error}
              autoComplete="new-password"
              onSubmitEditing={guardar}
            />
            <StrengthBar password={nueva} />
          </View>
        </View>

        <Button size="lg" className="mt-7" onPress={guardar} isDisabled={guardando}>
          <Button.Label>{guardando ? 'Guardando' : 'Guardar'}</Button.Label>
        </Button>
      </ScrollView>
    </View>
  );
}
