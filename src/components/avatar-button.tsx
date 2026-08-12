import { useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';

import { useAuth } from '@/lib/auth-store';

export function initial(displayName: string | null | undefined, email: string | undefined) {
  const source = displayName?.trim() || email?.trim() || '';
  return source.charAt(0).toUpperCase() || 'M';
}

export function AvatarButton({ size = 30 }: { size?: number }) {
  const router = useRouter();
  const { account } = useAuth();

  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);

  return (
    <PressableFeedback
      onPress={() => router.navigate('/cuenta')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Tu cuenta"
      style={{ borderRadius: 999 }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accent,
        }}
      >
        <Text
          className="font-semibold"
          style={{ fontSize: size * 0.44, color: accentForeground }}
        >
          {initial(account?.displayName, account?.email)}
        </Text>
      </View>
    </PressableFeedback>
  );
}
