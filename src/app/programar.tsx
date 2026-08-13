import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { daysBetween } from '@/lib/dates';
import { useNotes } from '@/lib/notes-store';
import { ATAJOS, conDias, diasDelMes, mismoDia, nombreDelMes } from '@/lib/schedule';

const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function Programar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { find, edit } = useNotes();

  const note = find(id);
  const hoy = new Date();

  const [mes, setMes] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [elegida, setElegida] = useState<Date | null>(
    note?.dueAt ? new Date(note.dueAt) : null
  );

  const [accent, accentForeground, muted, surfaceSecondary, foreground] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'surface-secondary',
    'foreground',
  ]);

  const guardar = async (fecha: Date | null) => {
    if (!note) return;

    await edit(note.id, { dueAt: fecha ? fecha.toISOString() : null });
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 25, letterSpacing: -0.4 }}
          >
            ¿Para cuándo?
          </Text>
          <Text className="mt-2 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            La nota aparece en Hoy el día que le pongas, y se marca vencida sola si se pasa.
          </Text>
        </Appear>

        <Appear delay={70} className="mt-6 flex-row flex-wrap gap-2">
          {ATAJOS.map((atajo) => {
            const fecha = conDias(atajo.dias, hoy);
            const activo = elegida ? mismoDia(fecha, elegida) : false;

            return (
              <PressableFeedback
                key={atajo.id}
                onPress={() => setElegida(fecha)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activo }}
                accessibilityLabel={atajo.etiqueta}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: activo ? accent : surfaceSecondary,
                }}
              >
                <PressableFeedback.Highlight />
                <Text
                  className="font-medium"
                  style={{ fontSize: 14, color: activo ? accentForeground : foreground }}
                >
                  {atajo.etiqueta}
                </Text>
              </PressableFeedback>
            );
          })}
        </Appear>

        <Appear delay={130} className="mt-8">
          <View className="mb-3 flex-row items-center justify-between">
            <PressableFeedback
              onPress={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              style={{ padding: 8, borderRadius: 999 }}
            >
              <PressableFeedback.Highlight />
              <ChevronLeftIcon color={muted} size={18} />
            </PressableFeedback>

            <Text className="font-display text-foreground" style={{ fontSize: 18 }}>
              {nombreDelMes(mes)}
            </Text>

            <PressableFeedback
              onPress={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              style={{ padding: 8, borderRadius: 999 }}
            >
              <PressableFeedback.Highlight />
              <ChevronRightIcon color={muted} size={18} />
            </PressableFeedback>
          </View>

          <View className="flex-row">
            {SEMANA.map((letra, indice) => (
              <View key={`${letra}-${indice}`} className="flex-1 items-center pb-2">
                <Text className="font-medium" style={{ fontSize: 11, color: muted }}>
                  {letra}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {diasDelMes(mes).map((dia, indice) => {
              if (!dia) {
                return <View key={`hueco-${indice}`} style={{ width: `${100 / 7}%`, height: 44 }} />;
              }

              const activo = elegida ? mismoDia(dia, elegida) : false;
              const esHoy = daysBetween(dia, hoy) === 0;
              const pasado = daysBetween(dia, hoy) < 0;

              return (
                <View key={dia.toISOString()} style={{ width: `${100 / 7}%`, height: 44 }}>
                  <PressableFeedback
                    onPress={() => setElegida(dia)}
                    accessibilityRole="button"
                    accessibilityLabel={`Día ${dia.getDate()}`}
                    style={{
                      flex: 1,
                      margin: 3,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: activo ? accent : 'transparent',
                      borderWidth: esHoy && !activo ? 1.5 : 0,
                      borderColor: accent,
                    }}
                  >
                    <PressableFeedback.Highlight />
                    <Text
                      className={activo ? 'font-semibold' : 'font-medium'}
                      style={{
                        fontSize: 15,
                        color: activo ? accentForeground : pasado ? muted : foreground,
                      }}
                    >
                      {dia.getDate()}
                    </Text>
                  </PressableFeedback>
                </View>
              );
            })}
          </View>
        </Appear>

        <Appear delay={200} className="mt-8 gap-3">
          <Button size="lg" onPress={() => guardar(elegida)} isDisabled={!elegida}>
            <Button.Label>Programar</Button.Label>
          </Button>

          {note?.dueAt && (
            <PressableFeedback
              onPress={() => guardar(null)}
              accessibilityRole="button"
              accessibilityLabel="Quitar la fecha"
              style={{
                alignSelf: 'center',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <PressableFeedback.Highlight />
              <Text className="font-medium" style={{ fontSize: 14, color: muted }}>
                Quitar la fecha
              </Text>
            </PressableFeedback>
          )}
        </Appear>
      </ScrollView>
    </View>
  );
}
