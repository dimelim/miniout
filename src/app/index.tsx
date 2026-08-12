import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth-store';

const TOPE_MS = 2500;

export default function Arranque() {
  const { isReady, session } = useAuth();

  useEffect(() => {
    const rendirse = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, TOPE_MS);

    return () => clearTimeout(rendirse);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 60);
    return () => clearTimeout(timer);
  }, [isReady]);

  if (!isReady) {
    return <View className="flex-1 bg-background" />;
  }

  return <Redirect href={session ? '/inicio' : '/onboarding'} />;
}
