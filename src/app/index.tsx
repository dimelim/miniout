import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { BrandLoader } from '@/components/brand-loader';
import { useAuth } from '@/lib/auth-store';

export default function Arranque() {
  const { isReady, session } = useAuth();

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <BrandLoader size={120} />
      </View>
    );
  }

  return <Redirect href={session ? '/inicio' : '/onboarding'} />;
}
