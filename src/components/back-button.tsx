import { useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';

import { ChevronLeftIcon } from './icons';

export function BackButton({ label = 'Atrás' }: { label?: string }) {
  const router = useRouter();
  const [foreground, surfaceSecondary] = useThemeColor(['foreground', 'surface-secondary']);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <PressableFeedback
      onPress={goBack}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ alignSelf: 'flex-start', borderRadius: 999 }}
    >
      <PressableFeedback.Highlight />
      <View className="flex-row items-center gap-2.5 pr-3.5">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: surfaceSecondary,
          }}
        >
          <ChevronLeftIcon color={foreground} size={20} />
        </View>
        <Text className="font-medium text-muted" style={{ fontSize: 15 }}>
          {label}
        </Text>
      </View>
    </PressableFeedback>
  );
}
