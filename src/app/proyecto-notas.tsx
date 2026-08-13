import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { BackButton } from '@/components/back-button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PencilIcon, TrashIcon } from '@/components/icons';
import { NoteRow } from '@/components/note-row';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { useAbrir } from '@/lib/navigate';
import { filtrarNotas, ordenarNotas } from '@/lib/note-list';
import { useNotes } from '@/lib/notes-store';
import { DEFAULT_PREFS, readPrefs, type NotePrefs } from '@/lib/preferences';
import { EMPTY_PROFILE, readProfile, type Profile } from '@/lib/profile';
import { useProjects } from '@/lib/projects-store';

export default function ProyectoNotas() {
  const router = useRouter();
  const abrir = useAbrir();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, toggle } = useNotes();
  const { find, remove } = useProjects();

  const [prefs, setPrefs] = useState<NotePrefs>(DEFAULT_PREFS);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [borrando, setBorrando] = useState(false);

  const [muted, background, danger, border] = useThemeColor([
    'muted',
    'background',
    'danger',
    'border',
  ]);

  const proyecto = find(id);

  useEffect(() => {
    readPrefs().then(setPrefs);
    readProfile().then(setPerfil);
  }, []);

  const suyas = useMemo(() => {
    if (!proyecto) return [];

    return ordenarNotas(
      filtrarNotas(notes, { projectId: proyecto.id, hideDone: prefs.hideDone }),
      prefs.order
    );
  }, [notes, proyecto, prefs]);

  if (!proyecto) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
          <BackButton label="Proyectos" />
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
            Ese proyecto ya no existe.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View
        className="flex-row items-center justify-between px-7"
        style={{ paddingTop: insets.top + 12 }}
      >
        <BackButton label="Proyectos" />

        <View className="flex-row items-center gap-2">
          <PressableFeedback
            onPress={() => abrir(`/proyecto?id=${proyecto.id}`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cambiar el proyecto"
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <PressableFeedback.Highlight />
            <PencilIcon color={muted} size={16} />
          </PressableFeedback>

          <PressableFeedback
            onPress={() => setBorrando(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Borrar el proyecto"
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <PressableFeedback.Highlight />
            <TrashIcon color={danger} size={16} />
          </PressableFeedback>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <View className="flex-row items-center gap-3">
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: proyecto.color,
              }}
            >
              <ProjectIcon name={proyecto.icon} color={background} size={23} />
            </View>

            <View className="flex-1">
              <Text
                className="font-display text-foreground"
                style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.6 }}
              >
                {proyecto.name}
              </Text>
              <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
                {suyas.length === 1 ? '1 nota' : `${suyas.length} notas`}
              </Text>
            </View>
          </View>
        </Appear>

        {suyas.length === 0 ? (
          <Appear delay={80} className="mt-8">
            <Text className="font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              Aquí no hay nada. Desliza una nota a la derecha desde la lista para meterla.
            </Text>
          </Appear>
        ) : (
          <Animated.View layout={LinearTransition.duration(220)} className="mt-6">
            {suyas.map((note, posicion) => (
              <View
                key={note.id}
                style={{
                  borderTopWidth: posicion === 0 ? 0 : 1,
                  borderTopColor: muted + '22',
                }}
              >
                <NoteRow
                  note={note}
                  perfil={perfil}
                  onToggle={() => toggle(note)}
                  onOpen={() => abrir(`/nota?id=${note.id}`)}
                  onMenu={() => abrir(`/acciones?id=${note.id}`)}
                  onMover={() => abrir(`/mover?id=${note.id}`)}
                />
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={borrando}
        titulo={`Borrar ${proyecto.name}`}
        mensaje="Las notas no se borran, se quedan sueltas."
        confirmar="Borrar el proyecto"
        onConfirm={async () => {
          setBorrando(false);
          await remove(proyecto.id);
          router.back();
        }}
        onCancel={() => setBorrando(false)}
      />
    </View>
  );
}
