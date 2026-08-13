import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const SPRING = { damping: 16, stiffness: 220, mass: 0.6 };

const ALTO = 56;
const PASTILLA = { ancho: 54, alto: 30 };

type ItemProps = {
  label: string;
  isFocused: boolean;
  restColor: string;
  activeColor: string;
  pastilla: string;
  onPress: () => void;
  renderIcon: (color: string) => React.ReactNode;
};

function Item({
  label,
  isFocused,
  restColor,
  activeColor,
  pastilla,
  onPress,
  renderIcon,
}: ItemProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, SPRING);
  }, [isFocused, progress]);

  const contenido = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.06 }],
  }));

  const fondo = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.7 + progress.value * 0.3 }],
  }));

  const etiqueta = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [restColor, activeColor]),
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
      <Animated.View style={[{ alignItems: 'center', gap: 4 }, contenido]}>
        <View
          style={{
            width: PASTILLA.ancho,
            height: PASTILLA.alto,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: PASTILLA.ancho,
                height: PASTILLA.alto,
                borderRadius: 999,
                backgroundColor: pastilla,
              },
              fondo,
            ]}
          />
          {renderIcon(isFocused ? activeColor : restColor)}
        </View>

        <Animated.Text
          className="font-medium"
          style={[{ fontSize: 11, lineHeight: 13 }, etiqueta]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const [surface, separator, muted, foreground, surfaceTertiary] = useThemeColor([
    'surface',
    'separator',
    'muted',
    'foreground',
    'surface-tertiary',
  ]);

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: insets.bottom,
        backgroundColor: surface,
        borderTopWidth: 1,
        borderTopColor: separator,
      }}
    >
      <View className="flex-row items-center px-1">
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
              activeColor={foreground}
              pastilla={surfaceTertiary}
              onPress={onPress}
              renderIcon={(color) =>
                options.tabBarIcon?.({ focused: isFocused, color, size: 21 }) ?? null
              }
            />
          );
        })}
      </View>
    </View>
  );
}
