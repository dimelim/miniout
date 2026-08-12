import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';

import { Appear } from './appear';

type AvisoProps = {
  mensaje: string;
  tono?: 'error' | 'exito';
  className?: string;
};

export function Aviso({ mensaje, tono = 'error', className }: AvisoProps) {
  const [danger, success] = useThemeColor(['danger', 'success']);
  const color = tono === 'error' ? danger : success;

  return (
    <Appear rise={6} className={className}>
      <View accessibilityLiveRegion="polite" className="flex-row items-start gap-2">
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            marginTop: 7,
            backgroundColor: color,
          }}
        />
        <Text className="flex-1" style={{ fontSize: 13, lineHeight: 20, color }}>
          {mensaje}
        </Text>
      </View>
    </Appear>
  );
}
