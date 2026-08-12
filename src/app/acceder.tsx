import { useRouter } from 'expo-router';
import { Button, FieldError, Input, Label, TextField } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { PasswordField } from '@/components/password-field';
import { TextLink } from '@/components/text-link';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { rememberMethod } from '@/lib/last-provider';
import { emailError, normalizeEmail, passwordError } from '@/lib/credentials';

export default function Acceder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email: string | null; password: string | null }>({
    email: null,
    password: null,
  });
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const { signIn, isConfigured } = useAuth();
  const danger = useThemeColor('danger');

  const submit = async () => {
    const next = { email: emailError(email), password: passwordError(password) };
    setErrors(next);
    setProblem(null);

    if (next.email || next.password) return;

    if (!isConfigured) {
      setProblem('La app todavía no tiene servidor. Vuelve a intentarlo en un momento.');
      return;
    }

    setBusy(true);

    try {
      const session = await api.login({ email: normalizeEmail(email), password });
      await rememberMethod('correo');
      await signIn(session);
      router.replace(session.isNew ? '/bienvenida' : '/inicio');
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'No se pudo entrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 bg-background">
        <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
          <BackButton />
        </View>

        <ScrollView
          contentContainerClassName="px-7 pt-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.7 }}
            >
              Entra a tu cuenta
            </Text>
            <Text className="mt-3 font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              Con el mismo correo con el que la creaste.
            </Text>
          </View>

          <View className="mt-8 gap-5">
            <TextField isInvalid={Boolean(errors.email)}>
              <Label>Correo</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="tu@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </TextField>

            <PasswordField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              autoComplete="current-password"
              onSubmitEditing={submit}
            />
          </View>

          <View className="mt-8 gap-3">
            {problem && (
              <Text style={{ fontSize: 13, lineHeight: 19, color: danger }}>{problem}</Text>
            )}

            <Button size="lg" onPress={submit} isDisabled={busy}>
              <Button.Label>{busy ? 'Entrando' : 'Entrar'}</Button.Label>
            </Button>

            <TextLink
              label="No tengo cuenta, quiero crear una"
              onPress={() => router.replace('/registro')}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
