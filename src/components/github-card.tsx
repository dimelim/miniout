import { useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { Text, type ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const REPO = 'dimelim/miniout';
export const REPO_URL = `https://github.com/${REPO}`;

export const GITHUB_PATH =
  'M10.418 2.489c.9-1.196 2.382-1.724 3.154-1.391.852.367 1.539 2.08 1.054 3.702a4 4 0 0 1-2.616 5.559c.309.471.49 1.035.49 1.641v2.25a.75.75 0 0 1-1.5 0V12a1.5 1.5 0 0 0-3 0v2.25a.75.75 0 0 1-1.5 0v-.75h-.876a2.626 2.626 0 0 1-2.625-2.625c0-.621-.504-1.125-1.125-1.125h-.125a.75.75 0 0 1 0-1.5h.125a2.625 2.625 0 0 1 2.625 2.625c0 .621.504 1.125 1.125 1.125H6.5c0-.606.18-1.17.488-1.641A4 4 0 0 1 4.373 4.8c-.484-1.623.202-3.335 1.054-3.702.772-.333 2.254.195 3.155 1.39zm2.549.02a1.4 1.4 0 0 0-.35.098 2.5 2.5 0 0 0-1 .784l-.451.598H7.834l-.45-.598a2.5 2.5 0 0 0-1.001-.784 1.4 1.4 0 0 0-.352-.099c-.063.088-.14.231-.204.429a2.5 2.5 0 0 0-.016 1.434l.163.546-.242.517c-.13.279-.21.586-.228.913l-.004.142a2.5 2.5 0 0 0 2.5 2.5h3a2.5 2.5 0 0 0 2.267-3.555l-.242-.517.163-.547a2.5 2.5 0 0 0-.016-1.433 1.6 1.6 0 0 0-.205-.429';

export const STAR_PATH =
  'm9.194 5 .351.873.94.064 3.197.217-2.46 2.055-.722.603.23.914.782 3.108-2.714-1.704L8 10.629l-.798.5-2.714 1.705.782-3.108.23-.914-.723-.603-2.46-2.055 3.198-.217.94-.064.35-.874L8 2.025zm-7.723-.292 3.943-.268L6.886.773C7.29-.231 8.71-.231 9.114.773l1.472 3.667 3.943.268c1.08.073 1.518 1.424.688 2.118L12.185 9.36l.964 3.832c.264 1.05-.886 1.884-1.802 1.31L8 12.4l-3.347 2.101c-.916.575-2.066-.26-1.802-1.309l.964-3.832L.783 6.826c-.83-.694-.391-2.045.688-2.118';

export function Glyph({
  d,
  color,
  size,
}: {
  d: string;
  color: ColorValue;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d={d} fill={color} fillRule="evenodd" clipRule="evenodd" />
    </Svg>
  );
}

export function useStars() {
  const [estrellas, setEstrellas] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`https://api.github.com/repos/${REPO}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload && typeof payload.stargazers_count === 'number') {
          setEstrellas(payload.stargazers_count);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return estrellas;
}

export function GithubBadge() {
  const router = useRouter();
  const estrellas = useStars();

  const [foreground, muted, accent] = useThemeColor(['foreground', 'muted', 'accent']);

  return (
    <PressableFeedback
      onPress={() => router.push('/github')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Miniout en GitHub"
      className="flex-row items-center gap-1.5 rounded-full border border-border px-2.5 py-1"
    >
      <PressableFeedback.Highlight />
      <Glyph d={GITHUB_PATH} color={foreground} size={15} />
      {estrellas !== null && (
        <>
          <Glyph d={STAR_PATH} color={accent} size={11} />
          <Text className="font-semibold" style={{ fontSize: 12, color: muted }}>
            {estrellas}
          </Text>
        </>
      )}
    </PressableFeedback>
  );
}
