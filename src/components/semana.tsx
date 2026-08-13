import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { ClockIcon } from './icons';

import type { Note, Period } from '@/lib/api';
import { isSameDay } from '@/lib/dates';
import { clasesDelDia, DIAS_CORTOS } from '@/lib/periods';

const DIAS = 7;

function lunesDeEstaSemana(hoy: Date) {
  const dia = (hoy.getDay() + 6) % 7;

  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dia);
}

type SemanaProps = {
  periods: Period[];
  notes: Note[];
  onAbrirNota: (id: string) => void;
  onAbrirPeriodo: (id: string) => void;
};

export function Semana({ periods, notes, onAbrirNota, onAbrirPeriodo }: SemanaProps) {
  const hoy = useMemo(() => new Date(), []);
  const [elegido, setElegido] = useState((hoy.getDay() + 6) % 7);

  const [accent, accentForeground, muted, foreground, surfaceSecondary, border] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'foreground',
    'surface-secondary',
    'border',
  ]);

  const lunes = useMemo(() => lunesDeEstaSemana(hoy), [hoy]);

  const dias = useMemo(
    () =>
      Array.from({ length: DIAS }, (_, indice) => {
        const fecha = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + indice);

        const clases = periods.flatMap((periodo) =>
          clasesDelDia(periodo.subjects, indice).map((una) => ({ ...una, periodo }))
        );

        const entregas = notes.filter(
          (note) => note.dueAt && !note.done && isSameDay(new Date(note.dueAt), fecha)
        );

        const encargos = periods.flatMap((periodo) =>
          periodo.subjects.flatMap((subject) =>
            subject.encargos
              .filter(
                (encargo) =>
                  !encargo.hecho && encargo.fecha && isSameDay(new Date(encargo.fecha), fecha)
              )
              .map((encargo) => ({ subject, encargo }))
          )
        );

        return { indice, fecha, clases, entregas, encargos };
      }),
    [lunes, periods, notes]
  );

  const dia = dias[elegido];
  const cosas = dia.clases.length + dia.entregas.length + dia.encargos.length;

  return (
    <View className="rounded-[24px] bg-surface p-4 shadow-surface">
      <View className="flex-row gap-1">
        {dias.map((uno) => {
          const activo = uno.indice === elegido;
          const esHoy = isSameDay(uno.fecha, hoy);
          const ocupado = uno.clases.length + uno.entregas.length + uno.encargos.length;

          return (
            <PressableFeedback
              key={uno.indice}
              onPress={() => setElegido(uno.indice)}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              accessibilityLabel={`${DIAS_CORTOS[uno.indice]} ${uno.fecha.getDate()}`}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 14,
                alignItems: 'center',
                gap: 3,
                backgroundColor: activo ? accent : 'transparent',
                borderWidth: esHoy && !activo ? 1.5 : 0,
                borderColor: accent,
              }}
            >
              <PressableFeedback.Highlight />
              <Text
                className="font-medium"
                style={{ fontSize: 11, color: activo ? accentForeground : muted }}
              >
                {DIAS_CORTOS[uno.indice]}
              </Text>
              <Text
                className="font-display"
                style={{ fontSize: 16, color: activo ? accentForeground : foreground }}
              >
                {uno.fecha.getDate()}
              </Text>
              <View
                style={{
                  height: 3,
                  width: ocupado > 0 ? 14 : 0,
                  borderRadius: 999,
                  backgroundColor: activo ? accentForeground : border,
                }}
              />
            </PressableFeedback>
          );
        })}
      </View>

      <View className="mt-3 gap-2">
        {cosas === 0 ? (
          <Text className="font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            Ese día está libre.
          </Text>
        ) : (
          <>
            {dia.clases.map(({ subject, clase, periodo }) => (
              <PressableFeedback
                key={clase.id}
                onPress={() => onAbrirPeriodo(periodo.id)}
                accessibilityRole="button"
                accessibilityLabel={`${subject.name} a las ${clase.inicio}`}
                className="flex-row items-center gap-3 rounded-[14px] px-3 py-2.5"
                style={{ backgroundColor: surfaceSecondary }}
              >
                <PressableFeedback.Highlight />
                <ClockIcon color={muted} size={13} />
                <Text className="font-semibold text-foreground" style={{ fontSize: 13 }}>
                  {clase.inicio}
                </Text>
                <Text
                  numberOfLines={1}
                  className="flex-1 font-sans text-foreground"
                  style={{ fontSize: 14 }}
                >
                  {subject.name}
                </Text>
              </PressableFeedback>
            ))}

            {dia.encargos.map(({ subject, encargo }) => (
              <View
                key={encargo.id}
                className="flex-row items-center gap-3 rounded-[14px] border px-3 py-2.5"
                style={{ borderColor: border }}
              >
                <Text
                  numberOfLines={1}
                  className="flex-1 font-sans text-foreground"
                  style={{ fontSize: 14 }}
                >
                  {encargo.titulo}
                </Text>
                <Text className="font-medium text-muted" style={{ fontSize: 11 }}>
                  {subject.name}
                </Text>
              </View>
            ))}

            {dia.entregas.map((note) => (
              <PressableFeedback
                key={note.id}
                onPress={() => onAbrirNota(note.id)}
                accessibilityRole="button"
                accessibilityLabel={note.title ?? note.body}
                className="flex-row items-center gap-3 rounded-[14px] border px-3 py-2.5"
                style={{ borderColor: border }}
              >
                <PressableFeedback.Highlight />
                <Text
                  numberOfLines={1}
                  className="flex-1 font-sans text-foreground"
                  style={{ fontSize: 14 }}
                >
                  {note.title ?? note.body.split('\n')[0]}
                </Text>
                <Text className="font-medium text-muted" style={{ fontSize: 11 }}>
                  nota
                </Text>
              </PressableFeedback>
            ))}
          </>
        )}
      </View>
    </View>
  );
}
