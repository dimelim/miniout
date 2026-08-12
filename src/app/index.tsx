import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth-store';

export default function Arranque() {
  const router = useRouter();
  const { isReady, session } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    router.replace(session ? '/inicio' : '/onboarding');

    const timer = setTimeout(() => SplashScreen.hideAsync(), 60);
    return () => clearTimeout(timer);
  }, [isReady, session, router]);

  return <View className="flex-1 bg-background" />;
}
