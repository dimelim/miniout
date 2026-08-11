import { useRouter } from 'expo-router';
import { Button, FieldError, Input, Label, TextField } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { PasswordField } from '@/components/password-field';
import { TextLink } from '@/components/text-link';
import { emailError, nameError, passwordError, passwordStrength } from '@/lib/credentials';

const ENTER = 240;
const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const BAR_WIDTH = 120;

function StrengthBar({ password }: { password: string }) {
  const [border, danger, warning, success, muted] = useThemeColor([
    'border',
    'danger',
    'warning',
    'success',
    'muted',
  ]);

  const strength = passwordStrength(password);
  const ratio = password ? strength.score / 5 : 0;
  const color =
    strength.label === 'fuerte' ? success : strength.label === 'aceptable' ? warning : danger;

  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(ratio, { duration: 260, easing: EASE });
  }, [ratio, fill]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAR_WIDTH * (1 - fill.value) }],
    backgroundColor: color,
  }));

  return (
    <View className="flex-row items-center gap-2.5">
      <View
        style={{
          width: BAR_WIDTH,
          height: 3,
          borderRadius: 999,
          backgroundColor: border,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[{ position: 'absolute', inset: 0, borderRadius: 999 }, style]}
        />
      </View>
      <Text style={{ fontSize: 11, color: password ? color : muted }}>
        {password ? strength.label : 'mínimo 10 caracteres'}
      </Text>
    </View>
  );
}

export default function Registro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name: string | null;
    email: string | null;
    password: string | null;
  }>({ name: null, email: null, password: null });
  const [busy, setBusy] = useState(false);

  const submit = () => {
    const next = {
      name: nameError(name),
      email: emailError(email),
      password: passwordError(password),
    };
    setErrors(next);

    if (next.name || next.email || next.password) return;

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
          contentContainerClassName="px-7 pt-8 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(ENTER)}>
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 34, lineHeight: 38, letterSpacing: -0.7 }}
            >
              Crea tu cuenta
            </Text>
            <Text className="mt-3 font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              Solo sirve para que tus apuntes te sigan a otro teléfono.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(70)} className="mt-8 gap-5">
            <TextField isInvalid={Boolean(errors.name)}>
              <Label>Nombre</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Cómo quieres que te llame"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </TextField>

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

            <View className="gap-2.5">
              <PasswordField
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                autoComplete="new-password"
                onSubmitEditing={submit}
              />
              <StrengthBar password={password} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(ENTER).delay(140)} className="mt-8 gap-3">
            <Button size="lg" onPress={submit} isDisabled={busy}>
              <Button.Label>{busy ? 'Creando' : 'Crear cuenta'}</Button.Label>
            </Button>

            <TextLink
              label="Ya tengo cuenta, quiero entrar"
              onPress={() => router.replace('/acceder')}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
