import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Aviso } from '@/components/aviso';
import { Hoja } from '@/components/hoja';
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
  const { periodo: periodoId, materia, id } = useLocalSearchParams<{
    periodo?: string;
    materia?: string;
    id?: string;
  }>();
  const { find, edit } = usePeriods();

  const periodo = find(periodoId);
  const subject = periodo?.subjects.find((una) => una.id === materia) ?? null;
  const clase = subject?.clases.find((una) => una.id === id) ?? null;

  const [dias, setDias] = useState<number[]>(clase ? [clase.dia] : []);
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
    if (dias.length === 0) {
      setProblema('Marca al menos un día');
      return;
    }

    if (!horaValida(inicio) || !horaValida(fin)) {
      setProblema('Escribe las horas como 08:30');
      return;
    }

    if (fin <= inicio) {
      setProblema('La clase tiene que acabar después de empezar');
      return;
    }

    setGuardando(true);

    const comun = {
      inicio,
      fin,
      ...(lugar.trim() ? { lugar: lugar.trim() } : {}),
    };

    const nuevas: Clase[] = dias.map((dia, indice) => ({
      id: clase && indice === 0 ? clase.id : crearId(),
      dia,
      ...comun,
    }));

    try {
      await edit(periodo.id, {
        subjects: periodo.subjects.map((una) =>
          una.id !== subject.id
            ? una
            : {
                ...una,
                clases: clase
                  ? [
                      ...una.clases.map((otra) => (otra.id === clase.id ? nuevas[0] : otra)),
                      ...nuevas.slice(1),
                    ]
                  : [...una.clases, ...nuevas],
              }
        ),
      });

      router.back();
    } finally {
      setGuardando(false);
    }
  };

  const alternarDia = (indice: number) => {
    if (problema) setProblema(null);

    setDias((actuales) =>
      actuales.includes(indice)
        ? actuales.filter((dia) => dia !== indice)
        : [...actuales, indice].sort((uno, otro) => uno - otro)
    );
  };

  return (
    <Hoja>
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 25, letterSpacing: -0.4 }}
        >
          {clase ? 'Esta clase' : `Clase de ${subject.name}`}
        </Text>

        <Text className="mb-3 mt-6 font-medium text-muted" style={{ fontSize: 12 }}>
          {clase ? 'Días' : 'Días, los que hagan falta'}
        </Text>

        <View className="flex-row gap-1.5">
          {DIAS_CORTOS.map((letra, indice) => {
            const activo = dias.includes(indice);

            return (
              <PressableFeedback
                key={`${letra}-${indice}`}
                onPress={() => alternarDia(indice)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: activo }}
                accessibilityLabel={DIAS[indice]}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: activo ? accent : surfaceSecondary,
                }}
              >
                <PressableFeedback.Highlight />
                <Text
                  className="font-semibold"
                  style={{ fontSize: 14, color: activo ? accentForeground : foreground }}
                >
                  {letra}
                </Text>
              </PressableFeedback>
            );
          })}
        </View>

        {dias.length > 1 && (
          <Text className="mt-2 font-sans text-muted" style={{ fontSize: 12 }}>
            {`Se crean ${dias.length} clases con la misma hora.`}
          </Text>
        )}

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
    </Hoja>
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
