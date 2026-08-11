import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const TASKS = [
  { label: 'Leer capítulo 3', when: null, late: false },
  { label: 'Taller de física', when: null, late: false },
  { label: 'Ejercicios 1 a 12', when: 'viernes', late: false },
  { label: 'Enviar el informe', when: null, late: true },
];

const CHECKS = [0, 1];
const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const STEP_MS = 950;
const HOLD_MS = 2400;

type Colors = {
  accent: string;
  accentForeground: string;
  border: string;
  muted: string;
  danger: string;
};

function Row({
  task,
  done,
  index,
  isActive,
  colors,
}: {
  task: (typeof TASKS)[number];
  done: boolean;
  index: number;
  isActive: boolean;
  colors: Colors;
}) {
  const enter = useSharedValue(0);
  const check = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    enter.value = isActive
      ? withDelay(120 + index * 90, withTiming(1, { duration: 300, easing: EASE }))
      : 0;
  }, [isActive, index, enter]);

  useEffect(() => {
    check.value = withTiming(done ? 1 : 0, { duration: 240, easing: EASE });
  }, [done, check]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 10 }],
  }));

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: check.value > 0.5 ? colors.accent : 'transparent',
    borderColor: check.value > 0.5 ? colors.accent : colors.border,
    transform: [{ scale: 1 + check.value * 0.08 }],
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ scale: 0.5 + check.value * 0.5 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({ opacity: 1 - check.value * 0.55 }));

  return (
    <Animated.View
      style={[
        rowStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 11,
          borderTopWidth: index === 0 ? 0 : 1,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Animated.View
        style={[
          {
            width: 20,
            height: 20,
            borderRadius: 7,
            borderWidth: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
          },
          boxStyle,
        ]}
      >
        <Animated.View style={markStyle}>
          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 6 9 17l-5-5"
              stroke={colors.accentForeground}
              strokeWidth={3.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[labelStyle, { flex: 1 }]}>
        <Text
          className="font-sans text-foreground"
          style={{
            fontSize: 15,
            lineHeight: 21,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {task.label}
        </Text>
      </Animated.View>

      {!done && task.when && (
        <Text className="font-medium" style={{ fontSize: 11, color: colors.muted }}>
          {task.when}
        </Text>
      )}

      {!done && task.late && (
        <View
          style={{
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderWidth: 1,
            borderColor: colors.danger,
          }}
        >
          <Text className="font-semibold" style={{ fontSize: 10, color: colors.danger }}>
            venció ayer
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

export function DiaDemo({ isActive }: { isActive: boolean }) {
  const [doneCount, setDoneCount] = useState(0);

  const [accent, accentForeground, border, muted, danger] = useThemeColor([
    'accent',
    'accent-foreground',
    'border',
    'muted',
    'danger',
  ]);

  const bar = useSharedValue(0);

  useEffect(() => {
    bar.value = withTiming(doneCount / TASKS.length, { duration: 320, easing: EASE });
  }, [doneCount, bar]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -120 * (1 - bar.value) }],
  }));

  useEffect(() => {
    if (!isActive) {
      setDoneCount(0);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const play = async () => {
      await wait(STEP_MS);
      for (let step = 1; step <= CHECKS.length; step++) {
        if (cancelled) return;
        setDoneCount(step);
        await wait(STEP_MS);
      }
    };

    play();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isActive]);

  const colors = { accent, accentForeground, border, muted, danger };

  return (
    <View className="rounded-[20px] bg-surface px-5 py-4 shadow-surface">
      <View className="flex-row items-end justify-between">
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 24, letterSpacing: -0.3 }}
        >
          Martes
        </Text>
        <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
          {doneCount} de {TASKS.length} hechas
        </Text>
      </View>

      <View
        style={{
          marginTop: 10,
          height: 3,
          width: 120,
          borderRadius: 999,
          backgroundColor: border,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            { position: 'absolute', inset: 0, borderRadius: 999, backgroundColor: accent },
            barStyle,
          ]}
        />
      </View>

      <View className="mt-1.5">
        {TASKS.map((task, position) => (
          <Row
            key={task.label}
            task={task}
            index={position}
            isActive={isActive}
            done={CHECKS.indexOf(position) > -1 && CHECKS.indexOf(position) < doneCount}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}
