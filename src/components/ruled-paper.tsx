import { useThemeColor } from 'heroui-native/hooks';
import { View } from 'react-native';

const LINE_COUNT = 26;

export function RuledPaper({ opacity = 1 }: { opacity?: number }) {
  const separator = useThemeColor('separator');

  return (
    <View className="absolute inset-0" pointerEvents="none" style={{ opacity }}>
      {Array.from({ length: LINE_COUNT }).map((_, index) => (
        <View
          key={index}
          style={{
            height: 32,
            borderBottomWidth: 1,
            borderBottomColor: separator,
            opacity: Math.max(0, 1 - Math.abs(index - LINE_COUNT / 2) / (LINE_COUNT / 2)),
          }}
        />
      ))}
    </View>
  );
}
