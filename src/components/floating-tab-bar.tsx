import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, type ComponentProps } from 'react';
import { Platform, Pressable, Text, useColorScheme, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const SPRING = { damping: 15, stiffness: 240, mass: 0.6 };

const ALTO = 58;

type ItemProps = {
  label: string;
  isFocused: boolean;
  restColor: string;
  activeColor: string;
  onPress: () => void;
  renderIcon: (color: string) => React.ReactNode;
};

function Item({ label, isFocused, restColor, activeColor, onPress, renderIcon }: ItemProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);
  const pressed = useSharedValue(0);
  const salto = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, SPRING);

    if (isFocused) {
      salto.value = withSequence(
        withTiming(1, { duration: 120, easing: EASE }),
        withSpring(0, SPRING)
      );
    }
  }, [isFocused, progress, salto]);

  const contenido = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.07 }],
  }));

  const icono = useAnimatedStyle(() => ({
    transform: [
      { translateY: -salto.value * 3 - progress.value * 2 },
      { scale: 1 + salto.value * 0.1 },
    ],
  }));

  const etiqueta = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [restColor, activeColor]),
    opacity: 0.55 + progress.value * 0.45,
    transform: [{ translateY: -progress.value * 1 }],
  }));

  const punto = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.4 + progress.value * 0.6 }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 110, easing: EASE });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 160, easing: EASE });
      }}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={{ flex: 1, height: ALTO, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={[{ alignItems: 'center', gap: 3 }, contenido]}>
        <Animated.View style={icono}>{renderIcon(isFocused ? activeColor : restColor)}</Animated.View>

        <Animated.Text
          className="font-medium"
          style={[{ fontSize: 11, lineHeight: 13 }, etiqueta]}
        >
          {label}
        </Animated.Text>

        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: -8,
              width: 4,
              height: 4,
              borderRadius: 999,
              backgroundColor: activeColor,
            },
            punto,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();

  const [separator, muted, accent] = useThemeColor(['separator', 'muted', 'accent']);

  const velo =
    scheme === 'dark' ? 'rgba(23,21,17,0.72)' : 'rgba(251,250,247,0.72)';

  return (
    <BlurView
      intensity={scheme === 'dark' ? 40 : 55}
      tint={scheme === 'dark' ? 'dark' : 'light'}
      experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: insets.bottom,
        backgroundColor: velo,
        borderTopWidth: 1,
        borderTopColor: separator,
      }}
    >
      <View className="flex-row items-center px-2">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = typeof options.title === 'string' ? options.title : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Item
              key={route.key}
              label={label}
              isFocused={isFocused}
              restColor={muted}
              activeColor={accent}
              onPress={onPress}
              renderIcon={(color) =>
                options.tabBarIcon?.({ focused: isFocused, color, size: 22 }) ?? null
              }
            />
          );
        })}
      </View>
    </BlurView>
  );
}
