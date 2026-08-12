import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/lib/auth-store';

const TOPE_MS = 2500;

export default function Arranque() {
  const router = useRouter();
  const { isReady, session } = useAuth();
  const salio = useRef(false);

  useEffect(() => {
    const rendirse = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, TOPE_MS);

    return () => clearTimeout(rendirse);
  }, []);

  useEffect(() => {
    if (!isReady || salio.current) return;

    salio.current = true;
    router.replace(session ? '/inicio' : '/onboarding');

    const timer = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 60);
    return () => clearTimeout(timer);
  }, [isReady, session, router]);

  return <View className="flex-1 bg-background" />;
}
