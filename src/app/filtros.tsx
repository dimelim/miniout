import { useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { Hoja } from '@/components/hoja';
import { CheckIcon, FolderIcon } from '@/components/icons';
import { ProjectIcon } from '@/components/project-icons';
import {
  DEFAULT_PREFS,
  ORDERS,
  readPrefs,
  savePrefs,
  type NotePrefs,
} from '@/lib/preferences';
import { useProjects } from '@/lib/projects-store';

export default function Filtros() {
  const router = useRouter();
  const { projects } = useProjects();

  const [prefs, setPrefs] = useState<NotePrefs>(DEFAULT_PREFS);

  const [accent, accentForeground, muted, foreground, surfaceTertiary, border] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'foreground',
    'surface-tertiary',
    'border',
  ]);

  useEffect(() => {
    readPrefs().then(setPrefs);
  }, []);

  const cambiar = async (patch: Partial<NotePrefs>) => {
    const siguiente = { ...prefs, ...patch };
    setPrefs(siguiente);
    await savePrefs(siguiente);
  };

  return (
    <Hoja>
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 25, letterSpacing: -0.4 }}
        >
          Ver tus notas
        </Text>

        <Text className="mb-3 mt-6 font-medium text-muted" style={{ fontSize: 12 }}>
          Orden
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {ORDERS.map((orden) => (
            <Pastilla
              key={orden.id}
              activa={prefs.order === orden.id}
              etiqueta={orden.label}
              onPress={() => cambiar({ order: orden.id })}
              accent={accent}
              accentForeground={accentForeground}
              fondo={surfaceTertiary}
              texto={foreground}
            />
          ))}
        </View>

        <Text className="mb-3 mt-7 font-medium text-muted" style={{ fontSize: 12 }}>
          Proyecto
        </Text>

        <View className="flex-row flex-wrap gap-2">
          <Pastilla
            activa={prefs.projectId === null}
            etiqueta="Todos"
            onPress={() => cambiar({ projectId: null })}
            accent={accent}
            accentForeground={accentForeground}
            fondo={surfaceTertiary}
            texto={foreground}
            icono={
              <FolderIcon color={prefs.projectId === null ? accentForeground : muted} size={13} />
            }
          />

          {projects.map((proyecto) => (
            <Pastilla
              key={proyecto.id}
              activa={prefs.projectId === proyecto.id}
              etiqueta={proyecto.name}
              onPress={() => cambiar({ projectId: proyecto.id })}
              accent={accent}
              accentForeground={accentForeground}
              fondo={surfaceTertiary}
              texto={foreground}
              icono={
                <ProjectIcon
                  name={proyecto.icon}
                  color={prefs.projectId === proyecto.id ? accentForeground : muted}
                  size={13}
                />
              }
            />
          ))}
        </View>

        <View className="mt-7 rounded-[20px] bg-surface p-4 shadow-surface">
          <Interruptor
            etiqueta="Esconder las hechas"
            detalle="La lista se queda solo con lo que te falta."
            valor={prefs.hideDone}
            onChange={(hideDone) => cambiar({ hideDone })}
            accent={accent}
            accentForeground={accentForeground}
            border={border}
          />
        </View>

        <View className="mt-7 gap-2">
          <Button size="lg" onPress={() => router.back()}>
            <Button.Label>Ver las notas</Button.Label>
          </Button>

          <Button variant="tertiary" size="md" onPress={() => cambiar(DEFAULT_PREFS)}>
            <Button.Label>Quitar los filtros</Button.Label>
          </Button>
        </View>
    </Hoja>
  );
}

function Pastilla({
  activa,
  etiqueta,
  onPress,
  accent,
  accentForeground,
  fondo,
  texto,
  icono,
}: {
  activa: boolean;
  etiqueta: string;
  onPress: () => void;
  accent: string;
  accentForeground: string;
  fondo: string;
  texto: string;
  icono?: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={etiqueta}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: activa ? accent : fondo,
      }}
    >
      <PressableFeedback.Highlight />
      {icono}
      {activa && !icono && <CheckIcon color={accentForeground} size={12} />}
      <Text
        className="font-medium"
        style={{ fontSize: 14, color: activa ? accentForeground : texto }}
      >
        {etiqueta}
      </Text>
    </PressableFeedback>
  );
}

function Interruptor({
  etiqueta,
  detalle,
  valor,
  onChange,
  accent,
  accentForeground,
  border,
}: {
  etiqueta: string;
  detalle: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
  accent: string;
  accentForeground: string;
  border: string;
}) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="flex-1">
        <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
          {etiqueta}
        </Text>
        <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13, lineHeight: 19 }}>
          {detalle}
        </Text>
      </View>

      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ true: accent, false: border }}
        thumbColor={valor ? accentForeground : undefined}
        accessibilityLabel={etiqueta}
      />
    </View>
  );
}
