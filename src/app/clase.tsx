import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aviso } from '@/components/aviso';
import {
  crearId,
  DIAS,
  DIAS_CORTOS,
  horaValida,
  normalizarHora,
  type Clase,
} from '@/lib/periods';
import { usePeriods } from '@/lib/periods-store';

export default function ClaseNueva() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { periodo: periodoId, materia, id } = useLocalSearchParams<{
    periodo?: string;
    materia?: string;
    id?: string;
  }>();
  const { find, edit } = usePeriods();

  const periodo = find(periodoId);
  const subject = periodo?.subjects.find((una) => una.id === materia) ?? null;
  const clase = subject?.clases.find((una) => una.id === id) ?? null;

  const [dia, setDia] = useState(clase?.dia ?? 0);
  const [inicio, setInicio] = useState(clase?.inicio ?? '');
  const [fin, setFin] = useState(clase?.fin ?? '');
  const [lugar, setLugar] = useState(clase?.lugar ?? '');
  const [problema, setProblema] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [accent, accentForeground, muted, foreground, surfaceSecondary] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'foreground',
    'surface-secondary',
  ]);

  if (!periodo || !subject) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-10">
        <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
          Esa materia ya no existe.
        </Text>
      </View>
    );
  }

  const guardar = async () => {
    if (!horaValida(inicio) || !horaValida(fin)) {
      setProblema('Escribe las horas como 08:30');
      return;
    }

    if (fin <= inicio) {
      setProblema('La clase tiene que acabar después de empezar');
      return;
    }

    setGuardando(true);

    const nueva: Clase = {
      id: clase?.id ?? crearId(),
      dia,
      inicio,
      fin,
      ...(lugar.trim() ? { lugar: lugar.trim() } : {}),
    };

    try {
      await edit(periodo.id, {
        subjects: periodo.subjects.map((una) =>
          una.id !== subject.id
            ? una
            : {
                ...una,
                clases: clase
                  ? una.clases.map((otra) => (otra.id === clase.id ? nueva : otra))
                  : [...una.clases, nueva],
              }
        ),
      });

      router.back();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 25, letterSpacing: -0.4 }}
        >
          {clase ? 'Esta clase' : `Clase de ${subject.name}`}
        </Text>

        <Text className="mb-3 mt-6 font-medium text-muted" style={{ fontSize: 12 }}>
          Día
        </Text>

        <View className="flex-row gap-1.5">
          {DIAS_CORTOS.map((letra, indice) => (
            <PressableFeedback
              key={`${letra}-${indice}`}
              onPress={() => setDia(indice)}
              accessibilityRole="radio"
              accessibilityState={{ selected: dia === indice }}
              accessibilityLabel={DIAS[indice]}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: dia === indice ? accent : surfaceSecondary,
              }}
            >
              <PressableFeedback.Highlight />
              <Text
                className="font-semibold"
                style={{ fontSize: 14, color: dia === indice ? accentForeground : foreground }}
              >
                {letra}
              </Text>
            </PressableFeedback>
          ))}
        </View>

        <View className="mt-7 flex-row gap-3">
          <Hora
            etiqueta="Empieza"
            valor={inicio}
            onChange={(valor) => {
              setInicio(normalizarHora(valor));
              if (problema) setProblema(null);
            }}
            accent={accent}
            muted={muted}
            fondo={surfaceSecondary}
          />

          <Hora
            etiqueta="Acaba"
            valor={fin}
            onChange={(valor) => {
              setFin(normalizarHora(valor));
              if (problema) setProblema(null);
            }}
            accent={accent}
            muted={muted}
            fondo={surfaceSecondary}
          />
        </View>

        <Text className="mb-3 mt-7 font-medium text-muted" style={{ fontSize: 12 }}>
          Dónde
        </Text>

        <TextInput
          value={lugar}
          onChangeText={setLugar}
          placeholder="Aula 204, laboratorio, casa"
          placeholderTextColor={muted}
          selectionColor={accent}
          cursorColor={accent}
          maxLength={40}
          accessibilityLabel="Dónde es la clase"
          className="font-sans text-foreground"
          style={{
            fontSize: 16,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: surfaceSecondary,
          }}
        />

        {problema && <Aviso mensaje={problema} className="mt-4" />}

        <Button size="lg" className="mt-8" onPress={guardar} isDisabled={guardando}>
          <Button.Label>{guardando ? 'Guardando' : 'Guardar'}</Button.Label>
        </Button>
      </ScrollView>
    </View>
  );
}

function Hora({
  etiqueta,
  valor,
  onChange,
  accent,
  muted,
  fondo,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  accent: string;
  muted: string;
  fondo: string;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-2 font-medium text-muted" style={{ fontSize: 12 }}>
        {etiqueta}
      </Text>

      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder="08:30"
        placeholderTextColor={muted}
        selectionColor={accent}
        cursorColor={accent}
        keyboardType="numeric"
        maxLength={5}
        accessibilityLabel={etiqueta}
        className="font-display text-foreground"
        style={{
          fontSize: 22,
          textAlign: 'center',
          borderRadius: 16,
          paddingVertical: 14,
          backgroundColor: fondo,
        }}
      />
    </View>
  );
}
