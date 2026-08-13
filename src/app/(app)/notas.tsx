import { useFocusEffect } from 'expo-router';
import { PressableFeedback, Spinner } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { FiltersIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { NoteRow } from '@/components/note-row';
import { RuledPaper } from '@/components/ruled-paper';
import { useAbrir } from '@/lib/navigate';
import { filtrarNotas, ordenarNotas } from '@/lib/note-list';
import { useNotes } from '@/lib/notes-store';
import {
  DEFAULT_PREFS,
  filtrosActivos,
  ORDERS,
  readPrefs,
  type NotePrefs,
} from '@/lib/preferences';
import { EMPTY_PROFILE, readProfile, type Profile } from '@/lib/profile';
import { useProjects } from '@/lib/projects-store';

export default function Notas() {
  const insets = useSafeAreaInsets();
  const abrir = useAbrir();
  const { notes, isLoading, toggle, refresh } = useNotes();
  const { find: buscarProyecto, refresh: refrescarProyectos } = useProjects();

  const [busqueda, setBusqueda] = useState('');
  const [prefs, setPrefs] = useState<NotePrefs>(DEFAULT_PREFS);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);

  const [muted, accent, accentForeground, surfaceTertiary, foreground, background] =
    useThemeColor([
      'muted',
      'accent',
      'accent-foreground',
      'surface-tertiary',
      'foreground',
      'background',
    ]);

  useFocusEffect(
    useCallback(() => {
      readPrefs().then(setPrefs);
      readProfile().then(setPerfil);
      refresh().catch(() => {});
      refrescarProyectos().catch(() => {});
    }, [refresh, refrescarProyectos])
  );

  const visibles = useMemo(() => {
    const filtradas = filtrarNotas(notes, {
      busqueda,
      hideDone: prefs.hideDone,
      projectId: prefs.projectId === null ? undefined : prefs.projectId,
    });

    return ordenarNotas(filtradas, prefs.order);
  }, [notes, busqueda, prefs]);

  const activos = filtrosActivos(prefs);
  const proyectoFiltrado = buscarProyecto(prefs.projectId);

  const resumen = [
    proyectoFiltrado?.name,
    prefs.hideDone ? 'sin las hechas' : null,
    prefs.order === DEFAULT_PREFS.order
      ? null
      : ORDERS.find((orden) => orden.id === prefs.order)?.label.toLowerCase(),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 120,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <View className="flex-row items-end justify-between gap-3">
            <View className="flex-1">
              <Text
                className="font-display text-foreground"
                style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
              >
                Tus notas
              </Text>
              <Text className="mt-1 font-sans text-muted" style={{ fontSize: 14 }}>
                {visibles.length === 1 ? '1 nota' : `${visibles.length} notas`}
              </Text>
            </View>

            <PressableFeedback
              onPress={() => abrir('/nota')}
              accessibilityRole="button"
              accessibilityLabel="Escribir una nota"
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accent,
              }}
            >
              <PressableFeedback.Highlight />
              <PlusIcon color={background} size={18} />
            </PressableFeedback>
          </View>
        </Appear>

        <Appear delay={70} className="mt-5 flex-row items-center gap-2">
          <View
            className="flex-1 flex-row items-center gap-2.5 rounded-[16px] px-4"
            style={{ backgroundColor: surfaceTertiary }}
          >
            <SearchIcon color={muted} size={16} />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar en tus notas"
              placeholderTextColor={muted}
              selectionColor={accent}
              cursorColor={accent}
              accessibilityLabel="Buscar en tus notas"
              className="flex-1 font-sans text-foreground"
              style={{ fontSize: 15, paddingVertical: 12, paddingHorizontal: 0 }}
            />
          </View>

          <PressableFeedback
            onPress={() => abrir('/filtros')}
            accessibilityRole="button"
            accessibilityLabel={
              activos === 0 ? 'Filtrar y ordenar' : `Filtros, ${activos} puestos`
            }
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activos > 0 ? accent : surfaceTertiary,
            }}
          >
            <PressableFeedback.Highlight />
            <FiltersIcon color={activos > 0 ? accentForeground : foreground} size={17} />
          </PressableFeedback>
        </Appear>

        {activos > 0 && (
          <Appear delay={110} className="mt-3">
            <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
              {resumen}
            </Text>
          </Appear>
        )}

        {isLoading ? (
          <View className="items-center py-10">
            <Spinner size="sm" />
          </View>
        ) : visibles.length === 0 ? (
          <Appear delay={150} className="mt-10">
            <Text className="font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              {busqueda
                ? `No hay nada con "${busqueda.trim()}".`
                : activos > 0
                  ? 'Ninguna nota pasa esos filtros. Tócalos para cambiarlos.'
                  : 'Aquí no hay nada todavía. Toca el más y escribe.'}
            </Text>
          </Appear>
        ) : (
          <Animated.View layout={LinearTransition.duration(220)} className="mt-4">
            {visibles.map((note, posicion) => (
              <View
                key={note.id}
                style={{
                  borderTopWidth: posicion === 0 ? 0 : 1,
                  borderTopColor: muted + '22',
                }}
              >
                <NoteRow
                  note={note}
                  proyecto={buscarProyecto(note.projectId)}
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
    </View>
  );
}
