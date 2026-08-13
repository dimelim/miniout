import { Image } from 'expo-image';
import { useThemeColor } from 'heroui-native/hooks';
import { View } from 'react-native';

import { imageUrl, type NoteImage as Imagen } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';

type NoteImageProps = {
  imagen: Imagen;
  width: number;
  height: number;
  radio?: number;
};

export function NoteImage({ imagen, width, height, radio = 18 }: NoteImageProps) {
  const { session } = useAuth();
  const [surfaceSecondary] = useThemeColor(['surface-secondary']);

  return (
    <View
      style={{
        width,
        height,
        borderRadius: radio,
        overflow: 'hidden',
        backgroundColor: surfaceSecondary,
      }}
    >
      <Image
        source={{
          uri: imageUrl(imagen.name),
          headers: session ? { Authorization: `Bearer ${session.accessToken}` } : undefined,
        }}
        style={{
          width: '100%',
          height: '100%',
          transform: [
            { translateX: imagen.offsetX ?? 0 },
            { translateY: imagen.offsetY ?? 0 },
            { scale: imagen.scale ?? 1 },
            { rotate: `${imagen.rotation ?? 0}deg` },
          ],
        }}
        contentFit="cover"
        transition={180}
        cachePolicy="disk"
        accessible={false}
      />
    </View>
  );
}
