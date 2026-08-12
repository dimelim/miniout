import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { Mark } from '@/components/mark';
import { useAuth } from '@/lib/auth-store';

export default function Arranque() {
  const { isReady, session } = useAuth();

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Mark size={120} />
      </View>
    );
  }

  return <Redirect href={session ? '/inicio' : '/onboarding'} />;
}
