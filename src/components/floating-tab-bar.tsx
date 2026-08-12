import { Tabs } from 'expo-router';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const DURATION = 220;

type ItemProps = {
  label: string;
  isFocused: boolean;
  restColor: string;
  activeColor: string;
  pillColor: string;
  onPress: () => void;
  renderIcon: (color: string) => React.ReactNode;
};

function Item({
  label,
  isFocused,
  restColor,
  activeColor,
  pillColor,
  onPress,
  renderIcon,
}: ItemProps) {
  const progress = useSharedValue(isFocused ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: DURATION, easing: EASE });
  }, [isFocused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.9 + progress.value * 0.1 - pressed.value * 0.04 }],
    backgroundColor: pillColor,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.05 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
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
      style={{ flex: 1, alignItems: 'center' }}
    >
      <View style={{ paddingHorizontal: 18, paddingVertical: 8 }}>
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', inset: 0, borderRadius: 999 }, pillStyle]}
        />
        <Animated.View style={[{ alignItems: 'center', gap: 2 }, contentStyle]}>
          {renderIcon(isFocused ? activeColor : restColor)}
          <Animated.Text
            className="font-medium"
            style={[{ fontSize: 11, lineHeight: 14 }, labelStyle]}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const [surface, border, muted, accent, accentSoft] = useThemeColor([
    'surface',
    'border',
    'muted',
    'accent',
    'accent-soft',
  ]);

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + 12,
        alignItems: 'center',
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 999,
          borderWidth: 1,
          borderColor: border,
          backgroundColor: surface,
          paddingHorizontal: 6,
          paddingVertical: 6,
          minWidth: 160,
          shadowColor: '#000',
          shadowOpacity: 0.22,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label =
            typeof options.title === 'string' ? options.title : route.name;

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
              pillColor={accentSoft}
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
