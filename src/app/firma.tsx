import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { Aviso } from '@/components/aviso';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CloseIcon, EraserIcon, TrashIcon, UndoIcon } from '@/components/icons';
import { ESPACIO, Lienzo } from '@/components/lienzo';
import type { TintaTrazo, Trazo } from '@/lib/api';
import { useNotes } from '@/lib/notes-store';
import { crearId } from '@/lib/periods';

const GROSORES = [6, 10, 17];
const MAX_TRAZOS = 200;

export default function Firma() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id, trazo: trazoId, at } = useLocalSearchParams<{
    id?: string;
    trazo?: string;
    at?: string;
  }>();

  const { find, edit } = useNotes();
  const note = find(id);
  const dibujo = note?.drawings.find((uno) => uno.id === trazoId) ?? null;

  const [trazos, setTrazos] = useState<Trazo[]>(dibujo?.strokes ?? []);
  const [tinta, setTinta] = useState<TintaTrazo>('tinta');
  const [grosor, setGrosor] = useState(GROSORES[1]);
  const [guardando, setGuardando] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  const [foreground, muted, surface, separator, link, danger, border] = useThemeColor([
    'foreground',
    'muted',
    'surface',
    'separator',
    'link',
    'danger',
    'border',
  ]);

  const tintas: Record<TintaTrazo, string> = { tinta: foreground, ambar: link };

  if (!note) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-10">
        <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
          Esa nota ya no existe.
        </Text>
      </View>
    );
  }

  const lienzo = width - 40 - 2;

  const anadir = (nuevo: Trazo) => {
    setTrazos((actuales) => {
      if (actuales.length >= MAX_TRAZOS) {
        setProblema('Esta firma ya no admite más trazos. Guárdala y empieza otra.');
        return actuales;
      }

      return [...actuales, nuevo];
    });
  };

  const guardar = async () => {
    setGuardando(true);
    setProblema(null);

    try {
      if (trazos.length === 0) {
        if (dibujo) {
          await edit(note.id, {
            drawings: note.drawings.filter((uno) => uno.id !== dibujo.id),
          });
        }

        router.back();
        return;
      }

      const guardado = {
        id: dibujo?.id ?? crearId(),
        at: dibujo?.at ?? Number(at ?? note.body.length),
        width: ESPACIO.ancho,
        height: ESPACIO.alto,
        strokes: trazos,
      };

      await edit(note.id, {
        drawings: dibujo
          ? note.drawings.map((uno) => (uno.id === guardado.id ? guardado : uno))
          : [...note.drawings, guardado],
      });

      router.back();
    } catch {
      setProblema('No se pudo guardar la firma');
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    setPreguntando(false);

    if (dibujo) {
      await edit(note.id, { drawings: note.drawings.filter((uno) => uno.id !== dibujo.id) });
    }

    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Cuadrado
          etiqueta="Salir sin guardar"
          fondo={surface}
          onPress={() => router.back()}
        >
          <CloseIcon color={foreground} size={17} />
        </Cuadrado>

        <View className="flex-row items-center gap-2">
          {dibujo && (
            <Cuadrado
              etiqueta="Quitar la firma de la nota"
              fondo={surface}
              onPress={() => setPreguntando(true)}
            >
              <TrashIcon color={danger} size={17} />
            </Cuadrado>
          )}

          <PressableFeedback
            onPress={guardar}
            accessibilityRole="button"
            accessibilityLabel="Guardar la firma"
            style={{ borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 }}
          >
            <PressableFeedback.Highlight />
            <Text className="font-medium" style={{ fontSize: 15, color: foreground }}>
              {guardando ? 'Guardando' : 'Listo'}
            </Text>
          </PressableFeedback>
        </View>
      </View>

      <View className="flex-1 px-5" style={{ paddingTop: 18 }}>
        <Appear rise={6}>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 27, lineHeight: 34, letterSpacing: -0.5 }}
          >
            Tu puño y letra
          </Text>
          <Text
            className="mt-1 font-sans text-muted"
            style={{ fontSize: 14, lineHeight: 21 }}
          >
            Firma o dibuja con el dedo. Se guarda dentro de la nota, donde tenías el cursor.
          </Text>
        </Appear>

        <View className="flex-1 justify-center" style={{ paddingBottom: insets.bottom + 12 }}>
          <Appear delay={70}>
            <View
              accessible
              accessibilityRole="image"
              accessibilityLabel="Zona para firmar con el dedo"
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: separator,
                backgroundColor: surface,
                overflow: 'hidden',
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 26,
                  right: 26,
                  bottom: 62,
                  height: 1,
                  backgroundColor: separator,
                }}
              />

              <Lienzo
                trazos={trazos}
                tinta={tinta}
                grosor={grosor}
                tintas={tintas}
                ancho={lienzo}
                onTrazo={anadir}
              />
            </View>
          </Appear>

          <Appear delay={120} className="mt-3">
            <View
              style={{
                borderRadius: 20,
                backgroundColor: surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                gap: 12,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  {(['tinta', 'ambar'] as TintaTrazo[]).map((una) => (
                    <PressableFeedback
                      key={una}
                      onPress={() => setTinta(una)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: tinta === una }}
                      accessibilityLabel={una === 'tinta' ? 'Tinta' : 'Ámbar'}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: tinta === una ? tintas[una] : 'transparent',
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          backgroundColor: tintas[una],
                        }}
                      />
                    </PressableFeedback>
                  ))}
                </View>

                <View className="flex-row items-center gap-1">
                  {GROSORES.map((uno, indice) => (
                    <PressableFeedback
                      key={uno}
                      onPress={() => setGrosor(uno)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: grosor === uno }}
                      accessibilityLabel={['Fino', 'Medio', 'Grueso'][indice]}
                      style={{
                        width: 44,
                        height: 40,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: grosor === uno ? border : 'transparent',
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 2 + indice * 3,
                          borderRadius: 999,
                          backgroundColor: grosor === uno ? foreground : muted,
                        }}
                      />
                    </PressableFeedback>
                  ))}
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: separator }} />

              <View className="flex-row gap-2">
                <Accion
                  etiqueta="Deshacer el último trazo"
                  texto="Deshacer"
                  color={trazos.length > 0 ? foreground : muted}
                  borde={separator}
                  onPress={() => setTrazos((actuales) => actuales.slice(0, -1))}
                >
                  <UndoIcon color={trazos.length > 0 ? foreground : muted} size={15} />
                </Accion>

                <Accion
                  etiqueta="Empezar de cero"
                  texto="Limpiar"
                  color={trazos.length > 0 ? foreground : muted}
                  borde={separator}
                  onPress={() => setTrazos([])}
                >
                  <EraserIcon color={trazos.length > 0 ? foreground : muted} size={15} />
                </Accion>
              </View>
            </View>
          </Appear>

          {problema && <Aviso mensaje={problema} className="mt-3" />}
        </View>
      </View>

      <ConfirmDialog
        visible={preguntando}
        titulo="Quitar la firma"
        mensaje="Se va de la nota y no se puede deshacer."
        confirmar="Quitar la firma"
        onConfirm={borrar}
        onCancel={() => setPreguntando(false)}
      />
    </View>
  );
}

function Cuadrado({
  etiqueta,
  fondo,
  onPress,
  children,
}: {
  etiqueta: string;
  fondo: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fondo,
      }}
    >
      <PressableFeedback.Highlight />
      {children}
    </PressableFeedback>
  );
}

function Accion({
  etiqueta,
  texto,
  color,
  borde,
  onPress,
  children,
}: {
  etiqueta: string;
  texto: string;
  color: string;
  borde: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 42,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: borde,
      }}
    >
      <PressableFeedback.Highlight />
      {children}
      <Text className="font-medium" style={{ fontSize: 14, color }}>
        {texto}
      </Text>
    </PressableFeedback>
  );
}
