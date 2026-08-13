import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EllipsisIcon, CheckIcon, FolderIcon } from './icons';
import { NoteImage } from './note-image';
import { ProjectIcon } from './project-icons';
import { RichText } from './rich-text';

import type { Note, Project } from '@/lib/api';
import { gradeLabel, gradeTone } from '@/lib/grades';
import { EMPTY_PROFILE, type Profile } from '@/lib/profile';
import { estadoDeEntrega } from '@/lib/schedule';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const DURATION = 220;
const UMBRAL = 84;

type NoteRowProps = {
  note: Note;
  onToggle: () => void;
  onOpen: () => void;
  onMenu: () => void;
  onMover?: () => void;
  proyecto?: Project | null;
  perfil?: Profile;
  lineas?: number;
};

export function NoteRow({
  note,
  onToggle,
  onOpen,
  onMenu,
  onMover,
  proyecto,
  perfil = EMPTY_PROFILE,
  lineas = 4,
}: NoteRowProps) {
  const [accent, accentForeground, border, muted, danger, warning, success] = useThemeColor([
    'accent',
    'accent-foreground',
    'border',
    'muted',
    'danger',
    'warning',
    'success',
  ]);

  const entrega = estadoDeEntrega(note.dueAt);
  const colorEntrega =
    entrega?.tono === 'vencido' ? danger : entrega?.tono === 'hoy' ? warning : muted;

  const tono = note.grade === null ? null : gradeTone(note.grade, perfil);
  const colorNota = tono === 'bajo' ? danger : tono === 'justo' ? warning : success;

  const done = useSharedValue(note.done ? 1 : 0);
  const deslizado = useSharedValue(0);

  useEffect(() => {
    done.value = withTiming(note.done ? 1 : 0, { duration: DURATION, easing: EASE });
  }, [note.done, done]);

  const box = useAnimatedStyle(() => ({
    backgroundColor: done.value > 0.5 ? accent : 'transparent',
    borderColor: done.value > 0.5 ? accent : border,
    transform: [{ scale: 1 + done.value * 0.06 }],
  }));

  const mark = useAnimatedStyle(() => ({
    opacity: done.value,
    transform: [{ scale: 0.5 + done.value * 0.5 }],
  }));

  const cuerpo = useAnimatedStyle(() => ({
    opacity: 1 - done.value * 0.45,
    transform: [{ translateX: deslizado.value }],
  }));

  const rastro = useAnimatedStyle(() => ({
    opacity: Math.min(1, deslizado.value / UMBRAL),
  }));

  const deslizar = Gesture.Pan()
    .enabled(Boolean(onMover))
    .activeOffsetX([-999, 24])
    .failOffsetY([-12, 12])
    .onUpdate((evento) => {
      deslizado.value = Math.max(0, Math.min(UMBRAL * 1.4, evento.translationX));
    })
    .onEnd(() => {
      if (deslizado.value >= UMBRAL && onMover) {
        runOnJS(onMover)();
      }

      deslizado.value = withTiming(0, { duration: 200, easing: EASE });
    });

  return (
    <View className="py-3">
      {onMover && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: UMBRAL,
              alignItems: 'center',
              justifyContent: 'center',
            },
            rastro,
          ]}
          pointerEvents="none"
        >
          <FolderIcon color={muted} size={20} />
        </Animated.View>
      )}

      <GestureDetector gesture={deslizar}>
        <Animated.View className="flex-row items-start gap-3" style={cuerpo}>
          <PressableFeedback
            onPress={onToggle}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: note.done }}
            accessibilityLabel={note.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
            style={{ borderRadius: 999, marginTop: 2 }}
          >
            <Animated.View
              style={[
                {
                  width: 22,
                  height: 22,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                box,
              ]}
            >
              <Animated.View style={mark}>
                <CheckIcon color={accentForeground} size={13} />
              </Animated.View>
            </Animated.View>
          </PressableFeedback>

          <PressableFeedback
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={note.title ?? note.body}
            style={{ flex: 1, borderRadius: 12 }}
          >
            <PressableFeedback.Highlight />

            <View className="flex-row items-start gap-3">
              <View className="flex-1">
                {note.title && (
                  <Text
                    numberOfLines={2}
                    className="mb-1 font-display text-foreground"
                    style={{ fontSize: 18, lineHeight: 24, letterSpacing: -0.3 }}
                  >
                    {note.title}
                  </Text>
                )}

                {note.body.trim().length > 0 && (
                  <RichText value={note.body} size={15} lineas={note.title ? 2 : lineas} />
                )}
              </View>

              {note.media.length > 0 && (
                <NoteImage imagen={note.media[0]} width={54} height={54} radio={14} />
              )}
            </View>

            {(note.hints.length > 0 || entrega || proyecto || note.grade !== null) && (
              <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
                {note.grade !== null && (
                  <View
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 9,
                      paddingVertical: 2,
                      backgroundColor: colorNota,
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{ fontSize: 11, color: accentForeground }}
                    >
                      {gradeLabel(note.grade, perfil)}
                    </Text>
                  </View>
                )}

                {proyecto && (
                  <View
                    className="flex-row items-center gap-1.5"
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: proyecto.color,
                      paddingHorizontal: 8,
                      paddingVertical: 1.5,
                    }}
                  >
                    <ProjectIcon name={proyecto.icon} color={muted} size={10} />
                    <Text className="font-medium" style={{ fontSize: 11, color: muted }}>
                      {proyecto.name}
                    </Text>
                  </View>
                )}

                {entrega && !note.done && (
                  <View
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: colorEntrega,
                      paddingHorizontal: 8,
                      paddingVertical: 1,
                    }}
                  >
                    <Text className="font-medium" style={{ fontSize: 11, color: colorEntrega }}>
                      {entrega.etiqueta}
                    </Text>
                  </View>
                )}

                {note.hints.map((hint) => (
                  <View
                    key={`${hint.kind}-${hint.label}`}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: border,
                      paddingHorizontal: 8,
                      paddingVertical: 1,
                    }}
                  >
                    <Text className="font-medium" style={{ fontSize: 11, color: muted }}>
                      {hint.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </PressableFeedback>

          <PressableFeedback
            onPress={onMenu}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Más cosas de esta nota"
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PressableFeedback.Highlight />
            <EllipsisIcon color={muted} size={15} />
          </PressableFeedback>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
