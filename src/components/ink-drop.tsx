import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useMascota, type Accesorio } from '@/lib/mascota';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);

const BREATH_MS = 2600;
const WORK_MS = 700;
const BLINK_MS = 80;
const BLINK_GAP_MS = 2400;
const LOOK_MS = 520;

const SPRING = { damping: 11, stiffness: 190, mass: 0.5 };

type InkDropProps = {
  size?: number;
  mood?: 'idle' | 'happy' | 'trabajando';
  hat?: boolean;
  color?: string;
  accesorio?: Accesorio;
};

export function InkDrop({ size = 44, mood = 'idle', hat, color, accesorio }: InkDropProps) {
  const [accent, background, foreground] = useThemeColor([
    'accent',
    'background',
    'foreground',
  ]);

  const { mascota } = useMascota();

  const cuerpoColor = color ?? mascota.color ?? accent;
  const adorno: Accesorio = hat ? 'casco' : (accesorio ?? mascota.accesorio);

  const breath = useSharedValue(0);
  const blink = useSharedValue(1);
  const look = useSharedValue(0);
  const press = useSharedValue(0);
  const joy = useSharedValue(mood === 'happy' ? 1 : 0);
  const work = useSharedValue(0);

  const trabajando = mood === 'trabajando';

  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: BREATH_MS, easing: EASE }), -1, true);

    blink.value = withRepeat(
      withSequence(
        withDelay(BLINK_GAP_MS, withTiming(0.05, { duration: BLINK_MS })),
        withTiming(1, { duration: BLINK_MS + 60 }),
        withDelay(220, withTiming(0.05, { duration: BLINK_MS })),
        withTiming(1, { duration: BLINK_MS + 60 })
      ),
      -1
    );

    look.value = withRepeat(
      withSequence(
        withDelay(2200, withTiming(1, { duration: LOOK_MS, easing: EASE })),
        withDelay(1800, withTiming(-1, { duration: LOOK_MS, easing: EASE })),
        withDelay(1400, withTiming(0, { duration: LOOK_MS, easing: EASE }))
      ),
      -1
    );
  }, [breath, blink, look]);

  useEffect(() => {
    joy.value = withTiming(mood === 'happy' ? 1 : 0, { duration: 240, easing: EASE });
  }, [mood, joy]);

  useEffect(() => {
    if (!trabajando) {
      work.value = withTiming(0, { duration: 240, easing: EASE });
      return;
    }

    work.value = withRepeat(withTiming(1, { duration: WORK_MS, easing: EASE }), -1, true);
  }, [trabajando, work]);

  const saludar = () => {
    press.value = withSequence(withTiming(1, { duration: 90, easing: EASE }), withSpring(0, SPRING));
  };

  const body = useAnimatedStyle(() => ({
    transform: [
      { translateY: breath.value * -2 - work.value * 5 },
      { rotate: `${(work.value - 0.5) * (trabajando ? 8 : 0)}deg` },
      { scaleX: 1 + press.value * 0.1 },
      { scaleY: 1 - press.value * 0.14 },
    ],
  }));

  const eyes = useAnimatedStyle(() => ({
    transform: [
      { translateX: look.value * 1.8 },
      { translateY: (press.value + joy.value) * 0.6 },
      { scaleY: blink.value * (1 - press.value * 0.6 - joy.value * 0.45) },
    ],
  }));

  const eye = {
    width: size * 0.12,
    height: size * 0.27,
    borderRadius: size,
    backgroundColor: background,
  };

  return (
    <Pressable onPress={saludar} accessible={false} hitSlop={10}>
      <Animated.View style={[{ width: size, height: size, alignItems: 'center' }, body]}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: cuerpoColor,
          }}
        >
          <Animated.View
            style={[
              {
                flexDirection: 'row',
                gap: size * 0.17,
                marginTop: adorno === 'casco' ? size * 0.06 : 0,
              },
              eyes,
            ]}
          >
            <View style={eye} />
            <View style={eye} />
          </Animated.View>
        </View>

        {adorno === 'casco' && <Casco size={size} tinta={foreground} />}
        {adorno === 'gafas' && <Gafas size={size} tinta={foreground} />}
        {adorno === 'antena' && <Antena size={size} tinta={foreground} bola={cuerpoColor} />}
      </Animated.View>
    </Pressable>
  );
}

function Casco({ size, tinta }: { size: number; tinta: string }) {
  return (
    <Svg
      width={size * 1.04}
      height={size * 0.46}
      viewBox="0 0 104 46"
      style={{ position: 'absolute', top: -size * 0.26, left: -size * 0.02 }}
    >
      <Path d="M21 37a31 36 0 0 1 62 0z" fill={tinta} />
      <Rect x="0" y="36" width="104" height="10" rx="5" fill={tinta} />
    </Svg>
  );
}

function Gafas({ size, tinta }: { size: number; tinta: string }) {
  return (
    <Svg
      width={size * 0.86}
      height={size * 0.34}
      viewBox="0 0 86 34"
      style={{ position: 'absolute', top: size * 0.26, left: size * 0.07 }}
      pointerEvents="none"
    >
      <Circle cx="21" cy="17" r="14" stroke={tinta} strokeWidth="5" fill="none" />
      <Circle cx="65" cy="17" r="14" stroke={tinta} strokeWidth="5" fill="none" />
      <Rect x="33" y="14" width="20" height="5" rx="2.5" fill={tinta} />
    </Svg>
  );
}

function Antena({ size, tinta, bola }: { size: number; tinta: string; bola: string }) {
  return (
    <Svg
      width={size * 0.3}
      height={size * 0.4}
      viewBox="0 0 30 40"
      style={{ position: 'absolute', top: -size * 0.3, left: size * 0.35 }}
    >
      <Rect x="12.5" y="10" width="5" height="30" rx="2.5" fill={tinta} />
      <Circle cx="15" cy="8" r="8" fill={bola} stroke={tinta} strokeWidth="4" />
    </Svg>
  );
}
