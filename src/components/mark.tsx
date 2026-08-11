import { useThemeColor } from 'heroui-native/hooks';
import type { ColorValue } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';

const LETTER = 'M7 20V8L16 16.5L25 8V20';
const UNDERLINE = 'M7 25.5H25';
const STROKE = 3.4;

type MarkProps = {
  size?: number;
  inkColor?: ColorValue;
  accentColor?: ColorValue;
};

export function Mark({ size = 32, inkColor, accentColor }: MarkProps) {
  const [foreground, accent] = useThemeColor(['foreground', 'accent']);

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d={LETTER}
        stroke={inkColor ?? foreground}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={UNDERLINE}
        stroke={accentColor ?? accent}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AppIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect width={32} height={32} rx={7.2} fill="#1d1913" />
      <G>
        <Path
          d={LETTER}
          stroke="#fbfaf7"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d={UNDERLINE} stroke="#e0891c" strokeWidth={STROKE} strokeLinecap="round" />
      </G>
    </Svg>
  );
}
