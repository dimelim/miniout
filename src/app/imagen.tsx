import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { CloseIcon, RotateIcon, TrashIcon } from '@/components/icons';
import { api, imageUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useNotes } from '@/lib/notes-store';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const MIN_ESCALA = 0.4;
const MAX_ESCALA = 5;

function acotar(valor: number, minimo: number, maximo: number) {
  'worklet';
  return Math.min(maximo, Math.max(minimo, valor));
}

export default function VisorImagen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const { session } = useAuth();
  const { find, edit } = useNotes();

  const [borrando, setBorrando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [foreground, muted, surface, danger, accent, accentForeground] = useThemeColor([
    'foreground',
    'muted',
    'surface',
    'danger',
    'accent',
    'accent-foreground',
  ]);

  const note = find(id);
  const imagen = useMemo(
    () => note?.media.find((media) => media.name === name) ?? null,
    [note, name]
  );

  const offsetX = useSharedValue(imagen?.offsetX ?? 0);
  const offsetY = useSharedValue(imagen?.offsetY ?? 0);
  const escala = useSharedValue(imagen?.scale ?? 1);
  const giro = useSharedValue(imagen?.rotation ?? 0);

  const inicioX = useSharedValue(0);
  const inicioY = useSharedValue(0);
  const inicioEscala = useSharedValue(1);
  const inicioGiro = useSharedValue(0);

  const arrastrar = Gesture.Pan()
    .onStart(() => {
      inicioX.value = offsetX.value;
      inicioY.value = offsetY.value;
    })
    .onUpdate((evento) => {
      offsetX.value = inicioX.value + evento.translationX;
      offsetY.value = inicioY.value + evento.translationY;
    });

  const pellizcar = Gesture.Pinch()
    .onStart(() => {
      inicioEscala.value = escala.value;
    })
    .onUpdate((evento) => {
      escala.value = acotar(inicioEscala.value * evento.scale, MIN_ESCALA, MAX_ESCALA);
    });

  const rotar = Gesture.Rotation()
    .onStart(() => {
      inicioGiro.value = giro.value;
    })
    .onUpdate((evento) => {
      giro.value = inicioGiro.value + (evento.rotation * 180) / Math.PI;
    });

  const encuadre = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: escala.value },
      { rotate: `${giro.value}deg` },
    ],
  }));

  if (!note || !imagen) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-10">
        <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
          Esa imagen ya no está en la nota.
        </Text>
      </View>
    );
  }

  const marco = width - 40;

  const guardar = async () => {
    setGuardando(true);

    try {
      await edit(note.id, {
        media: note.media.map((media) =>
          media.name === imagen.name
            ? {
                ...media,
                offsetX: Math.round(offsetX.value),
                offsetY: Math.round(offsetY.value),
                scale: Number(escala.value.toFixed(3)),
                rotation: Math.round(giro.value),
              }
            : media
        ),
      });
      router.back();
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    setBorrando(false);

    await edit(note.id, {
      media: note.media.filter((media) => media.name !== imagen.name),
    });

    if (session) {
      api.removeImage(session.accessToken, imagen.name).catch(() => {});
    }

    router.back();
  };

  const colocar = async (arriba: boolean) => {
    if (Boolean(imagen.arriba) === arriba) return;

    await edit(note.id, {
      media: note.media.map((media) =>
        media.name === imagen.name ? { ...media, arriba } : media
      ),
    });
  };

  const enderezar = () => {
    offsetX.value = withTiming(0, { duration: 220, easing: EASE });
    offsetY.value = withTiming(0, { duration: 220, easing: EASE });
    escala.value = withTiming(1, { duration: 220, easing: EASE });
    giro.value = withTiming(0, { duration: 220, easing: EASE });
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 10 }}
      >
        <PressableFeedback
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sin guardar"
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: surface,
          }}
        >
          <PressableFeedback.Highlight />
          <CloseIcon color={foreground} size={17} />
        </PressableFeedback>

        <View className="flex-row items-center gap-2">
          <PressableFeedback
            onPress={() => setBorrando(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Quitar la imagen"
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: surface,
            }}
          >
            <PressableFeedback.Highlight />
            <TrashIcon color={danger} size={17} />
          </PressableFeedback>

          <PressableFeedback
            onPress={guardar}
            accessibilityRole="button"
            accessibilityLabel="Guardar el encuadre"
            style={{ borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 }}
          >
            <PressableFeedback.Highlight />
            <Text className="font-medium" style={{ fontSize: 15, color: foreground }}>
              {guardando ? 'Guardando' : 'Listo'}
            </Text>
          </PressableFeedback>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-5">
        <GestureDetector gesture={Gesture.Simultaneous(arrastrar, pellizcar, rotar)}>
          <View
            style={{
              width: marco,
              height: marco,
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: surface,
            }}
          >
            <Animated.View style={[{ width: '100%', height: '100%' }, encuadre]}>
              <Image
                source={{
                  uri: imageUrl(imagen.name),
                  headers: session
                    ? { Authorization: `Bearer ${session.accessToken}` }
                    : undefined,
                }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="disk"
                accessibilityLabel="La imagen de la nota"
              />
            </Animated.View>
          </View>
        </GestureDetector>

        <Text
          className="mt-5 max-w-[300px] text-center font-sans text-muted"
          style={{ fontSize: 13, lineHeight: 20 }}
        >
          Arrastra para moverla, pellizca para acercarla y gira con dos dedos.
        </Text>
      </View>

      <View className="px-5">
        <View
          className="flex-row gap-1.5 rounded-[16px] p-1"
          style={{ backgroundColor: surface }}
        >
          {[
            { arriba: true, etiqueta: 'Encima del texto' },
            { arriba: false, etiqueta: 'Debajo del texto' },
          ].map((opcion) => {
            const activa = Boolean(imagen.arriba) === opcion.arriba;

            return (
              <PressableFeedback
                key={opcion.etiqueta}
                onPress={() => colocar(opcion.arriba)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activa }}
                accessibilityLabel={opcion.etiqueta}
                style={{
                  flex: 1,
                  paddingVertical: 11,
                  borderRadius: 13,
                  alignItems: 'center',
                  backgroundColor: activa ? accent : 'transparent',
                }}
              >
                <PressableFeedback.Highlight />
                <Text
                  className="font-medium"
                  style={{ fontSize: 13, color: activa ? accentForeground : muted }}
                >
                  {opcion.etiqueta}
                </Text>
              </PressableFeedback>
            );
          })}
        </View>
      </View>

      <View
        className="flex-row items-center justify-center gap-2 px-5"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <PressableFeedback
          onPress={() => {
            giro.value = withTiming(giro.value + 90, { duration: 240, easing: EASE });
          }}
          accessibilityRole="button"
          accessibilityLabel="Girar un cuarto"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderRadius: 999,
            paddingHorizontal: 18,
            paddingVertical: 12,
            backgroundColor: surface,
          }}
        >
          <PressableFeedback.Highlight />
          <RotateIcon color={foreground} size={16} />
          <Text className="font-medium" style={{ fontSize: 14, color: foreground }}>
            Girar
          </Text>
        </PressableFeedback>

        <PressableFeedback
          onPress={enderezar}
          accessibilityRole="button"
          accessibilityLabel="Dejarla como estaba"
          style={{
            borderRadius: 999,
            paddingHorizontal: 18,
            paddingVertical: 12,
            backgroundColor: surface,
          }}
        >
          <PressableFeedback.Highlight />
          <Text className="font-medium" style={{ fontSize: 14, color: muted }}>
            Enderezar
          </Text>
        </PressableFeedback>
      </View>

      <ConfirmDialog
        visible={borrando}
        titulo="Quitar la imagen"
        mensaje="Se va de la nota y del servidor. No se puede deshacer."
        confirmar="Quitar la imagen"
        onConfirm={borrar}
        onCancel={() => setBorrando(false)}
      />
    </View>
  );
}
