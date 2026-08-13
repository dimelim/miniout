import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';

import { InkDrop } from './ink-drop';

export function Guia({ texto }: { texto: string }) {
  const [surfaceSecondary] = useThemeColor(['surface-secondary']);

  return (
    <View className="flex-row items-end gap-2.5">
      <InkDrop size={34} />
      <View
        className="flex-1 px-4 py-3"
        style={{
          backgroundColor: surfaceSecondary,
          borderRadius: 18,
          borderBottomLeftRadius: 6,
        }}
      >
        <Text className="font-sans text-foreground" style={{ fontSize: 14, lineHeight: 21 }}>
          {texto}
        </Text>
      </View>
    </View>
  );
}
