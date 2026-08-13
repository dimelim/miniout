import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Hoja({ children }: { children: React.ReactNode }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background">
      <ScrollView
        style={{ maxHeight: height * 0.86 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
