import { FieldError, Input, Label, TextField } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { EyeIcon, EyeSlashIcon } from './icons';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error: string | null;
  autoComplete: 'current-password' | 'new-password';
  onSubmitEditing?: () => void;
};

export function PasswordField({
  label,
  value,
  onChangeText,
  error,
  autoComplete,
  onSubmitEditing,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const muted = useThemeColor('muted');

  return (
    <TextField isInvalid={Boolean(error)}>
      <Label>{label}</Label>
      <View style={{ justifyContent: 'center' }}>
        <Input
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={autoComplete === 'new-password' ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={onSubmitEditing}
          style={{ paddingRight: 48 }}
        />
        <Pressable
          onPress={() => setVisible((current) => !current)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={{ position: 'absolute', right: 14 }}
        >
          {visible ? (
            <EyeSlashIcon color={muted} size={18} />
          ) : (
            <EyeIcon color={muted} size={18} />
          )}
        </Pressable>
      </View>
      {error && <FieldError>{error}</FieldError>}
    </TextField>
  );
}
