import { Image } from 'expo-image';
import { useThemeColor } from 'heroui-native/hooks';
import { useColorScheme, View } from 'react-native';

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
  const contorno =
    useColorScheme() === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View
      style={{
        width,
        height,
        borderRadius: radio,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: contorno,
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
