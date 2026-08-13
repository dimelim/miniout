import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { CloseIcon } from './icons';
import { SendButton } from './send-button';

import {
  faltaParaPasar,
  gradeLabel,
  gradeTone,
  notaHastaAhora,
  pesoCalificado,
  pesoTotal,
} from '@/lib/grades';
import { crearId, REPARTOS, type Subject } from '@/lib/periods';
import type { Profile } from '@/lib/profile';

type EvaluacionesProps = {
  subject: Subject;
  perfil: Profile;
  color: string;
  onCambiar: (cambio: (una: Subject) => Subject) => void;
  onCalificar: (id: string) => void;
};

export function Evaluaciones({
  subject,
  perfil,
  color,
  onCambiar,
  onCalificar,
}: EvaluacionesProps) {
  const [nombre, setNombre] = useState('');

  const [muted, foreground, border, surfaceSecondary, danger, warning, success, background, link] =
    useThemeColor([
      'muted',
      'foreground',
      'border',
      'surface-secondary',
      'danger',
      'warning',
      'success',
      'background',
      'link',
    ]);

  const total = pesoTotal(subject.evaluaciones);
  const calificado = pesoCalificado(subject.evaluaciones);
  const nota = notaHastaAhora(subject.evaluaciones);
  const falta = faltaParaPasar(subject.evaluaciones, perfil);

  const tono = nota === null ? null : gradeTone(nota, perfil);
  const colorNota = tono === 'bajo' ? danger : tono === 'justo' ? warning : success;

  const usarReparto = (pesos: number[]) => {
    onCambiar((una) => ({
      ...una,
      evaluaciones: pesos.map((peso, indice) => ({
        id: crearId(),
        nombre: pesos.length === indice + 1 && peso >= 40 ? 'Final' : `Corte ${indice + 1}`,
        peso,
        nota: null,
        fecha: null,
      })),
    }));
  };

  const agregar = () => {
    const limpio = nombre.trim();
    if (!limpio) return;

    setNombre('');
    Keyboard.dismiss();

    onCambiar((una) => ({
      ...una,
      evaluaciones: [
        ...una.evaluaciones,
        {
          id: crearId(),
          nombre: limpio.slice(0, 60),
          peso: Math.max(0, 100 - pesoTotal(una.evaluaciones)),
          nota: null,
          fecha: null,
        },
      ],
    }));
  };

  const cambiarNombre = (id: string, texto: string) => {
    const limpio = texto.trim();
    if (!limpio) return;

    onCambiar((una) => ({
      ...una,
      evaluaciones: una.evaluaciones.map((otra) =>
        otra.id === id ? { ...otra, nombre: limpio.slice(0, 60) } : otra
      ),
    }));
  };

  const cambiarPeso = (id: string, texto: string) => {
    const peso = Math.min(100, Math.max(0, Number(texto.replace(/[^0-9]/g, '')) || 0));

    onCambiar((una) => ({
      ...una,
      evaluaciones: una.evaluaciones.map((otra) => (otra.id === id ? { ...otra, peso } : otra)),
    }));
  };

  return (
    <View>
      {subject.evaluaciones.length === 0 ? (
        <View className="rounded-[22px] bg-surface p-4 shadow-surface">
          <View className="gap-2">
            {REPARTOS.map((reparto) => (
              <PressableFeedback
                key={reparto.id}
                onPress={() => usarReparto(reparto.pesos)}
                accessibilityRole="button"
                accessibilityLabel={reparto.label}
                className="flex-row items-center gap-3 rounded-[16px] px-4 py-3"
                style={{ backgroundColor: surfaceSecondary }}
              >
                <PressableFeedback.Highlight />
                <View className="flex-1">
                  <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
                    {reparto.label}
                  </Text>
                  <Text className="font-sans text-muted" style={{ fontSize: 12 }}>
                    {reparto.detalle}
                  </Text>
                </View>
                <Text className="font-semibold" style={{ fontSize: 12, color }}>
                  {`${reparto.pesos.length} notas`}
                </Text>
              </PressableFeedback>
            ))}
          </View>
        </View>
      ) : (
        <View className="rounded-[22px] bg-surface p-4 shadow-surface">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
                Llevas
              </Text>
              <Text
                className="font-display"
                style={{
                  fontSize: 40,
                  lineHeight: 46,
                  letterSpacing: -0.8,
                  color: nota === null ? muted : colorNota,
                }}
              >
                {nota === null ? '--' : gradeLabel(nota, perfil)}
              </Text>
            </View>

            <Text className="mb-2 font-medium text-muted" style={{ fontSize: 12 }}>
              {`${calificado}% de ${total}% calificado`}
            </Text>
          </View>

          <View
            className="mt-3 h-1.5 flex-row overflow-hidden rounded-full"
            style={{ backgroundColor: surfaceSecondary }}
          >
            <View
              style={{
                width: `${Math.min(100, calificado)}%`,
                backgroundColor: nota === null ? muted : colorNota,
              }}
            />
          </View>

          {falta && !falta.yaPasaste && (
            <Text
              className="mt-3 font-medium"
              style={{ fontSize: 13, color: falta.imposible ? danger : foreground }}
            >
              {falta.imposible
                ? `Con lo que queda ya no da para pasar, ni sacando el máximo.`
                : `Necesitas ${gradeLabel(falta.necesario, perfil)} en el ${falta.pendiente}% que falta.`}
            </Text>
          )}

          {falta?.yaPasaste && (
            <Text className="mt-3 font-medium" style={{ fontSize: 13, color: success }}>
              Ya pasaste, pase lo que pase en lo que queda.
            </Text>
          )}

          {total !== 100 && (
            <Text className="mt-2 font-sans text-muted" style={{ fontSize: 12 }}>
              {`Los pesos suman ${total}%, no 100%.`}
            </Text>
          )}
        </View>
      )}

      <Animated.View layout={LinearTransition.duration(200)} className="mt-2 gap-2">
        {subject.evaluaciones.map((una) => (
          <View
            key={una.id}
            className="flex-row items-center gap-3 rounded-[18px] bg-surface p-3.5 shadow-surface"
          >
            <View className="flex-1">
              <TextInput
                defaultValue={una.nombre}
                onChangeText={(texto) => cambiarNombre(una.id, texto)}
                maxLength={60}
                selectionColor={color}
                cursorColor={color}
                accessibilityLabel={`Nombre de ${una.nombre}`}
                className="font-medium text-foreground"
                style={{ fontSize: 15, padding: 0 }}
              />

              <PressableFeedback
                onPress={() => onCalificar(una.id)}
                accessibilityRole="button"
                accessibilityLabel={`Calificar ${una.nombre}`}
                style={{ alignSelf: 'flex-start', borderRadius: 8, marginTop: 1 }}
              >
                <PressableFeedback.Highlight />
                <Text
                  className="font-sans"
                  style={{
                    fontSize: 12,
                    lineHeight: 17,
                    color: una.nota === null ? link : foreground,
                  }}
                >
                  {una.nota === null
                    ? 'Poner la nota'
                    : `Sacaste ${gradeLabel(una.nota, perfil)}`}
                </Text>
              </PressableFeedback>
            </View>

            <View
              className="flex-row items-center gap-0.5 rounded-[10px] px-2"
              style={{ backgroundColor: surfaceSecondary }}
            >
              <TextInput
                value={String(una.peso)}
                onChangeText={(texto) => cambiarPeso(una.id, texto)}
                keyboardType="numeric"
                maxLength={3}
                selectionColor={color}
                cursorColor={color}
                accessibilityLabel={`Cuánto vale ${una.nombre}`}
                className="font-semibold text-foreground"
                style={{ fontSize: 13, minWidth: 26, textAlign: 'right', paddingVertical: 6 }}
              />
              <Text className="font-semibold text-muted" style={{ fontSize: 13 }}>
                %
              </Text>
            </View>

            <PressableFeedback
              onPress={() =>
                onCambiar((otra) => ({
                  ...otra,
                  evaluaciones: otra.evaluaciones.filter((cada) => cada.id !== una.id),
                }))
              }
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${una.nombre}`}
              style={{ padding: 6, borderRadius: 999 }}
            >
              <PressableFeedback.Highlight />
              <CloseIcon color={muted} size={14} />
            </PressableFeedback>
          </View>
        ))}
      </Animated.View>

      <View
        className="mt-2 flex-row items-center gap-3 rounded-[18px] px-4 py-2"
        style={{ borderWidth: 1.5, borderColor: border }}
      >
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Parcial, taller, quiz"
          placeholderTextColor={muted}
          selectionColor={color}
          cursorColor={color}
          maxLength={60}
          returnKeyType="done"
          onSubmitEditing={agregar}
          accessibilityLabel="Nombre de la evaluación"
          className="flex-1 font-sans text-foreground"
          style={{ fontSize: 15, paddingVertical: 10, paddingHorizontal: 0 }}
        />

        <SendButton
          activo={Boolean(nombre.trim())}
          color={color}
          fondo={surfaceSecondary}
          contraste={background}
          muted={muted}
          etiqueta="Añadir evaluación"
          onPress={agregar}
        />
      </View>
    </View>
  );
}
