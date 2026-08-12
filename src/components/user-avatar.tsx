import { Image } from 'expo-image';
import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';

export function initial(displayName: string | null | undefined, email: string | undefined) {
  const source = displayName?.trim() || email?.trim() || '';
  return source.charAt(0).toUpperCase() || 'M';
}

type UserAvatarProps = {
  size: number;
  url?: string | null;
  displayName?: string | null;
  email?: string;
};

export function UserAvatar({ size, url, displayName, email }: UserAvatarProps) {
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: 999 }}
        contentFit="cover"
        transition={220}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: accent,
      }}
    >
      <Text className="font-semibold" style={{ fontSize: size * 0.44, color: accentForeground }}>
        {initial(displayName, email)}
      </Text>
    </View>
  );
}
