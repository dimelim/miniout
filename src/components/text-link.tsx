import { PressableFeedback } from 'heroui-native';
import { Text } from 'react-native';

type TextLinkProps = {
  label: string;
  onPress: () => void;
};

export function TextLink({ label, onPress }: TextLinkProps) {
  return (
    <PressableFeedback
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ alignSelf: 'center', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }}
    >
      <PressableFeedback.Highlight />
      <Text className="font-medium text-muted" style={{ fontSize: 14 }}>
        {label}
      </Text>
    </PressableFeedback>
  );
}
