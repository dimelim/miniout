import { useThemeColor } from 'heroui-native/hooks';
import Svg, { Path } from 'react-native-svg';

import type { NoteDrawing } from '@/lib/api';

export function Firma({ trazo, ancho }: { trazo: NoteDrawing; ancho: number }) {
  const [foreground, link] = useThemeColor(['foreground', 'link']);

  const escala = ancho / trazo.width;
  const alto = Math.round(trazo.height * escala);

  return (
    <Svg width={ancho} height={alto} viewBox={`0 0 ${trazo.width} ${trazo.height}`}>
      {trazo.strokes.map((linea, indice) => (
        <Path
          key={indice}
          d={linea.d}
          stroke={linea.color === 'ambar' ? link : foreground}
          strokeWidth={linea.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}
