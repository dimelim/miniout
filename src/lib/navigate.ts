import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef } from 'react';

export function useAbrir() {
  const router = useRouter();
  const yendo = useRef(false);

  useFocusEffect(
    useCallback(() => {
      yendo.current = false;
    }, [])
  );

  return useCallback(
    (href: Href) => {
      if (yendo.current) return;

      yendo.current = true;
      router.push(href);
    },
    [router]
  );
}
