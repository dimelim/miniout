import { useThemeColor } from 'heroui-native/hooks';
import type { RefObject } from 'react';
import { TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MAX_NAME_LENGTH } from '@/lib/credentials';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const FOCUS_MS = 240;
const LINE = 2.5;

type NameFieldProps = {
  ref?: RefObject<TextInput | null>;
  value: string;
  onChangeText: (value: string) => void;
  onSubmitEditing: () => void;
  label: string;
};

export function NameField({ ref, value, onChangeText, onSubmitEditing, label }: NameFieldProps) {
  const [accent, border, muted] = useThemeColor(['accent', 'border', 'muted']);
  const focus = useSharedValue(0);

  const focusLine = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scaleX: focus.value }],
  }));

  return (
    <View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => {
          focus.value = withTiming(1, { duration: FOCUS_MS, easing: EASE });
        }}
        onBlur={() => {
          focus.value = withTiming(0, { duration: FOCUS_MS, easing: EASE });
        }}
        placeholder="Tu nombre"
        placeholderTextColor={muted}
        selectionColor={accent}
        cursorColor={accent}
        maxLength={MAX_NAME_LENGTH}
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel={label}
        className="font-display text-foreground"
        style={{ fontSize: 30, lineHeight: 38, paddingBottom: 10, paddingHorizontal: 0 }}
      />

      <View style={{ height: LINE, borderRadius: 999, backgroundColor: border }} />

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: LINE,
            borderRadius: 999,
            backgroundColor: accent,
            transformOrigin: 'left',
          },
          focusLine,
        ]}
      />
    </View>
  );
}
