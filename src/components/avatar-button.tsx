import { useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';

import { UserAvatar } from './user-avatar';

import { useAuth } from '@/lib/auth-store';

export function AvatarButton({ size = 30 }: { size?: number }) {
  const router = useRouter();
  const { account } = useAuth();

  return (
    <PressableFeedback
      onPress={() => router.navigate('/cuenta')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Tu cuenta"
      style={{ borderRadius: 999 }}
    >
      <UserAvatar
        size={size}
        url={account?.avatarUrl}
        displayName={account?.displayName}
        email={account?.email}
      />
    </PressableFeedback>
  );
}
