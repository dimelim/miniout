import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { BrandScreen } from '@/components/brand-loader';
import { useAuth } from '@/lib/auth-store';

const MINIMO_MS = 900;

export default function Arranque() {
  const router = useRouter();
  const { isReady, session } = useAuth();
  const desde = useRef(Date.now());

  useEffect(() => {
    if (!isReady) return;

    const falta = Math.max(0, MINIMO_MS - (Date.now() - desde.current));
    const timer = setTimeout(() => {
      router.replace(session ? '/inicio' : '/onboarding');
    }, falta);

    return () => clearTimeout(timer);
  }, [isReady, session, router]);

  return <BrandScreen />;
}
