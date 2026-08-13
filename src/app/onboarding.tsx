import { useFocusEffect, useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CapturaSlide,
  DiaSlide,
  MarcaSlide,
  MascotaSlide,
} from '@/components/onboarding-slides';
import { RuledPaper } from '@/components/ruled-paper';
import { SlideDots } from '@/components/slide-dots';

const SLIDES = [MarcaSlide, CapturaSlide, DiaSlide, MascotaSlide];
const AUTOPLAY_MS = 5200;
const RESUME_MS = 320;

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [demos, setDemos] = useState(false);

  const [accent, border] = useThemeColor(['accent', 'border']);
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    router.prefetch('/entrar');
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => setDemos(true), RESUME_MS);

      return () => {
        clearTimeout(timer);
        setDemos(false);
      };
    }, [])
  );

  const goTo = useCallback(
    (next: number) => {
      scroller.current?.scrollTo({ x: width * next, animated: true });
      setIndex(next);
    },
    [width]
  );

  useEffect(() => {
    if (!autoplay || !demos) return;

    const timer = setTimeout(() => {
      goTo((index + 1) % SLIDES.length);
    }, AUTOPLAY_MS);

    return () => clearTimeout(timer);
  }, [autoplay, demos, index, goTo]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const advance = () => {
    setAutoplay(false);

    if (!isLast) {
      goTo(index + 1);
      return;
    }

    setDemos(false);
    requestAnimationFrame(() => router.push('/entrar'));
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.45} />

      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => setAutoplay(false)}
          onMomentumScrollEnd={onScrollEnd}
          className="flex-1"
        >
          {SLIDES.map((Slide, position) => (
            <View key={position} style={{ width }} className="px-7 pb-2 pt-6">
              <Slide isActive={demos && position === index} />
            </View>
          ))}
        </ScrollView>

        <View className="px-7" style={{ paddingBottom: insets.bottom + 24 }}>
          <View className="mb-6">
            <SlideDots
              count={SLIDES.length}
              index={index}
              isPlaying={autoplay && demos}
              autoplayMs={AUTOPLAY_MS}
              restColor={border}
              activeColor={accent}
              onSelect={(position) => {
                setAutoplay(false);
                goTo(position);
              }}
            />
          </View>

          <Button size="lg" onPress={advance}>
            <Button.Label>{isLast ? 'Empezar' : 'Siguiente'}</Button.Label>
          </Button>
        </View>
      </View>
    </View>
  );
}
