import { useFocusEffect } from 'expo-router';
import { Button, PressableFeedback, Spinner } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { ChevronRightIcon, GripIcon, PlusIcon } from '@/components/icons';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { SortableList } from '@/components/sortable-list';
import type { Project } from '@/lib/api';
import { useAbrir } from '@/lib/navigate';
import { useNotes } from '@/lib/notes-store';
import { useProjects } from '@/lib/projects-store';

const ALTO = 74;

export default function Proyectos() {
  const insets = useSafeAreaInsets();
  const abrir = useAbrir();
  const { projects, isLoading, refresh, reorder } = useProjects();
  const { notes } = useNotes();

  const [muted, background, border] = useThemeColor(['muted', 'background', 'border']);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
    }, [refresh])
  );

  const cuenta = useMemo(() => {
    const total = new Map<string, number>();

    for (const note of notes) {
      if (!note.projectId) continue;
      total.set(note.projectId, (total.get(note.projectId) ?? 0) + 1);
    }

    return total;
  }, [notes]);

  const sueltas = notes.filter((note) => !note.projectId).length;

  const mover = (id: string, salto: number) => {
    const ids = projects.map((project) => project.id);
    const desde = ids.indexOf(id);
    const hasta = Math.min(ids.length - 1, Math.max(0, desde + salto));

    if (desde < 0 || desde === hasta) return;

    ids.splice(hasta, 0, ids.splice(desde, 1)[0]);
    reorder(ids);
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
          >
            Proyectos
          </Text>
          <Text className="mt-1 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            Cajones para tus notas. Mantén pulsado uno para cambiarlo de sitio.
          </Text>
        </Appear>

        {isLoading ? (
          <View className="items-center py-10">
            <Spinner size="sm" />
          </View>
        ) : projects.length === 0 ? (
          <Appear delay={80} className="mt-8">
            <View className="rounded-[24px] bg-surface p-5 shadow-surface">
              <Text
                className="font-display text-foreground"
                style={{ fontSize: 19, lineHeight: 26, letterSpacing: -0.3 }}
              >
                Todavía no tienes ninguno
              </Text>
              <Text
                className="mt-1.5 font-sans text-muted"
                style={{ fontSize: 14, lineHeight: 21 }}
              >
                Universidad, Compras, Personal. Luego arrastras una nota a la derecha para
                meterla en uno.
              </Text>
            </View>
          </Appear>
        ) : (
          <Appear delay={80} className="mt-6">
            <SortableList
              items={projects}
              idOf={(project: Project) => project.id}
              alto={ALTO}
              onOrden={reorder}
            >
              {(project: Project) => (
                <PressableFeedback
                  onPress={() => abrir(`/proyecto-notas?id=${project.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${project.name}`}
                  accessibilityActions={[
                    { name: 'subir', label: 'Subirlo un puesto' },
                    { name: 'bajar', label: 'Bajarlo un puesto' },
                  ]}
                  onAccessibilityAction={(evento) =>
                    mover(project.id, evento.nativeEvent.actionName === 'subir' ? -1 : 1)
                  }
                  className="h-full flex-row items-center gap-3 rounded-[22px] bg-surface px-4 shadow-surface"
                >
                  <PressableFeedback.Highlight />

                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: project.color,
                    }}
                  >
                    <ProjectIcon name={project.icon} color={background} size={21} />
                  </View>

                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-display text-foreground"
                      style={{ fontSize: 19, letterSpacing: -0.3 }}
                    >
                      {project.name}
                    </Text>
                    <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
                      {(cuenta.get(project.id) ?? 0) === 1
                        ? '1 nota'
                        : `${cuenta.get(project.id) ?? 0} notas`}
                    </Text>
                  </View>

                  <GripIcon color={border} size={15} />
                  <ChevronRightIcon color={muted} size={15} />
                </PressableFeedback>
              )}
            </SortableList>
          </Appear>
        )}

        <Appear delay={140} className="mt-5">
          <Button variant="tertiary" size="md" onPress={() => abrir('/proyecto')}>
            <PlusIcon color={muted} size={15} />
            <Button.Label>Proyecto nuevo</Button.Label>
          </Button>
        </Appear>

        {sueltas > 0 && (
          <Appear delay={200} className="mt-8">
            <View className="rounded-[22px] border border-border p-4">
              <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
                {sueltas === 1 ? '1 nota sin proyecto' : `${sueltas} notas sin proyecto`}
              </Text>
              <Text
                className="mt-1 font-sans text-muted"
                style={{ fontSize: 13, lineHeight: 20 }}
              >
                No pasa nada por dejarlas sueltas. Si quieres ordenarlas, deslízalas a la
                derecha desde la lista.
              </Text>
            </View>
          </Appear>
        )}
      </ScrollView>
    </View>
  );
}
