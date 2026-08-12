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
      <View
        accessibilityLiveRegion="polite"
        style={{
          borderRadius: 14,
          borderLeftWidth: 3,
          borderLeftColor: color,
          backgroundColor: color + '18',
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Text style={{ fontSize: 13, lineHeight: 20, color }}>{mensaje}</Text>
      </View>
    </Appear>
  );
}
