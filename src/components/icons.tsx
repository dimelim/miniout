import type { ColorValue } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <Path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <Path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <Path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </Svg>
  );
}

export function DiscordIcon({ size = 18, color = '#5865F2' }: { size?: number; color?: ColorValue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M19.27 5.33A16.5 16.5 0 0 0 15.2 4.1a.06.06 0 0 0-.07.03c-.17.31-.37.72-.51 1.04a15.3 15.3 0 0 0-4.24 0 9.6 9.6 0 0 0-.52-1.04.06.06 0 0 0-.07-.03c-1.4.24-2.76.66-4.06 1.23a.06.06 0 0 0-.03.02C2.98 9.2 2.25 12.95 2.61 16.66c0 .02.02.04.04.05a16.6 16.6 0 0 0 4.99 2.5.07.07 0 0 0 .07-.02c.38-.52.72-1.07 1.02-1.65a.06.06 0 0 0-.04-.09c-.54-.2-1.06-.45-1.55-.73a.06.06 0 0 1 0-.11l.31-.24a.06.06 0 0 1 .06 0 11.9 11.9 0 0 0 10.02 0 .06.06 0 0 1 .07 0l.3.24a.06.06 0 0 1 0 .11c-.5.29-1.01.53-1.55.73a.06.06 0 0 0-.04.09c.3.58.65 1.13 1.02 1.65a.06.06 0 0 0 .07.02 16.5 16.5 0 0 0 5-2.5.06.06 0 0 0 .03-.04c.43-4.29-.72-8.01-3.05-11.32a.05.05 0 0 0-.03-.02zM8.68 14.4c-1 0-1.82-.9-1.82-2.02s.8-2.03 1.82-2.03c1.03 0 1.85.92 1.83 2.03 0 1.11-.8 2.02-1.83 2.02zm6.65 0c-1 0-1.82-.9-1.82-2.02s.8-2.03 1.82-2.03c1.03 0 1.85.92 1.83 2.03 0 1.11-.8 2.02-1.83 2.02z"
      />
    </Svg>
  );
}

export function MailIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 6.5h17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="m3 7 9 6 9-6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DotIcon({ color, size = 8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 8 8">
      <Circle cx={4} cy={4} r={4} fill={color} />
    </Svg>
  );
}

type IconProps = {
  color: ColorValue;
  size?: number;
};

export function CapturaIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 18.5 6.2 18l9.4-9.4a1.8 1.8 0 0 0 0-2.5l-.7-.7a1.8 1.8 0 0 0-2.5 0L3 14.8l-.5 2.2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(2.5 1.5)"
      />
      <Path
        d="M14 20h6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CuadernoIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3.5h11.5a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 3.5v17M4.5 6.5h2.5M4.5 12h2.5M4.5 17.5h2.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DiaIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 6.5h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1ZM8 3.5v4M16 3.5v4M3.5 11h17"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m8.5 15 2 2 4-4"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
