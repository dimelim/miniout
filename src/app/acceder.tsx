import { useRouter } from 'expo-router';
import { Button, FieldError, Input, Label, TextField } from 'heroui-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { PasswordField } from '@/components/password-field';
import { TextLink } from '@/components/text-link';
import { emailError, passwordError } from '@/lib/credentials';

const ENTER = 240;

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

  const submit = () => {
    const next = { email: emailError(email), password: passwordError(password) };
    setErrors(next);

    if (next.email || next.password) return;

    setBusy(true);
    router.replace('/captura');
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
          <Animated.View entering={FadeInDown.duration(ENTER)}>
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.7 }}
            >
              Entra a tu cuenta
            </Text>
            <Text className="mt-3 font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              Con el mismo correo con el que la creaste.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(70)} className="mt-8 gap-5">
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
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(140)} className="mt-8 gap-3">
            <Button size="lg" onPress={submit} isDisabled={busy}>
              <Button.Label>{busy ? 'Entrando' : 'Entrar'}</Button.Label>
            </Button>

            <TextLink
              label="No tengo cuenta, quiero crear una"
              onPress={() => router.replace('/registro')}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
