import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon, FolderIcon, PlusIcon } from '@/components/icons';
import { ProjectIcon } from '@/components/project-icons';
import { useAbrir } from '@/lib/navigate';
import { useNotes } from '@/lib/notes-store';
import { useProjects } from '@/lib/projects-store';

export default function Mover() {
  const router = useRouter();
  const abrir = useAbrir();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { find, edit } = useNotes();
  const { projects } = useProjects();

  const [moviendo, setMoviendo] = useState(false);

  const [accent, muted, surfaceSecondary, background, border] = useThemeColor([
    'accent',
    'muted',
    'surface-secondary',
    'background',
    'border',
  ]);

  const note = find(id);

  const mover = async (projectId: string | null) => {
    if (!note || moviendo) return;

    setMoviendo(true);

    try {
      await edit(note.id, { projectId });
      router.back();
    } finally {
      setMoviendo(false);
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
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 25, letterSpacing: -0.4 }}
        >
          ¿A qué proyecto?
        </Text>
        <Text className="mt-2 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
          Los proyectos son cajones: Universidad, Compras, lo que necesites.
        </Text>

        <View className="mt-6 gap-2">
          <Fila
            activo={!note?.projectId}
            etiqueta="Sin proyecto"
            color={border}
            onPress={() => mover(null)}
            accent={accent}
            muted={muted}
            fondo={surfaceSecondary}
            icono={<FolderIcon color={muted} size={19} />}
          />

          {projects.map((proyecto) => (
            <Fila
              key={proyecto.id}
              activo={note?.projectId === proyecto.id}
              etiqueta={proyecto.name}
              color={proyecto.color}
              onPress={() => mover(proyecto.id)}
              accent={accent}
              muted={muted}
              fondo={proyecto.color}
              icono={<ProjectIcon name={proyecto.icon} color={background} size={19} />}
            />
          ))}
        </View>

        <Button variant="tertiary" size="md" className="mt-5" onPress={() => abrir('/proyecto')}>
          <PlusIcon color={muted} size={15} />
          <Button.Label>Proyecto nuevo</Button.Label>
        </Button>
      </ScrollView>
    </View>
  );
}

function Fila({
  activo,
  etiqueta,
  onPress,
  accent,
  muted,
  fondo,
  icono,
}: {
  activo: boolean;
  etiqueta: string;
  color: string;
  onPress: () => void;
  accent: string;
  muted: string;
  fondo: string;
  icono: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={etiqueta}
      className="flex-row items-center gap-3 rounded-[20px] bg-surface p-3.5 shadow-surface"
    >
      <PressableFeedback.Highlight />
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fondo,
        }}
      >
        {icono}
      </View>

      <Text className="flex-1 font-medium text-foreground" style={{ fontSize: 16 }}>
        {etiqueta}
      </Text>

      {activo ? (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: accent,
          }}
        >
          <CheckIcon color="#1d1913" size={12} />
        </View>
      ) : (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: muted,
            opacity: 0.5,
          }}
        />
      )}
    </PressableFeedback>
  );
}
