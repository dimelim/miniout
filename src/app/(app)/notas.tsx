import { useFocusEffect } from 'expo-router';
import { PressableFeedback, Spinner } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { GradeIcon, PlusIcon, SearchIcon, SortIcon } from '@/components/icons';
import { NoteRow } from '@/components/note-row';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { useAbrir } from '@/lib/navigate';
import { filtrarNotas, ordenarNotas } from '@/lib/note-list';
import { useNotes } from '@/lib/notes-store';
import { DEFAULT_PREFS, ORDERS, readPrefs, savePrefs, type NotePrefs } from '@/lib/preferences';
import { EMPTY_PROFILE, readProfile, type Profile } from '@/lib/profile';
import { useProjects } from '@/lib/projects-store';

export default function Notas() {
  const insets = useSafeAreaInsets();
  const abrir = useAbrir();
  const { notes, isLoading, toggle, refresh } = useNotes();
  const { projects, find: buscarProyecto, refresh: refrescarProyectos } = useProjects();

  const [busqueda, setBusqueda] = useState('');
  const [prefs, setPrefs] = useState<NotePrefs>(DEFAULT_PREFS);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [proyecto, setProyecto] = useState<string | null>(null);
  const [soloConNota, setSoloConNota] = useState(false);
  const [abriendoOrden, setAbriendoOrden] = useState(false);

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
      soloConNota,
      projectId: proyecto === null ? undefined : proyecto,
    });

    return ordenarNotas(filtradas, prefs.order);
  }, [notes, busqueda, prefs, proyecto, soloConNota]);

  const cambiarOrden = async (order: NotePrefs['order']) => {
    const siguiente = { ...prefs, order };
    setPrefs(siguiente);
    setAbriendoOrden(false);
    await savePrefs(siguiente);
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

        <Appear delay={70} className="mt-5">
          <View
            className="flex-row items-center gap-2.5 rounded-[16px] px-4"
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
        </Appear>

        <Appear delay={110} className="mt-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            <Filtro
              activo={proyecto === null && !soloConNota}
              etiqueta="Todas"
              onPress={() => {
                setProyecto(null);
                setSoloConNota(false);
              }}
              accent={accent}
              accentForeground={accentForeground}
              fondo={surfaceTertiary}
              texto={foreground}
            />

            <Filtro
              activo={soloConNota}
              etiqueta="Con calificación"
              onPress={() => setSoloConNota((valor) => !valor)}
              accent={accent}
              accentForeground={accentForeground}
              fondo={surfaceTertiary}
              texto={foreground}
              icono={
                <GradeIcon color={soloConNota ? accentForeground : muted} size={13} />
              }
            />

            {projects.map((item) => (
              <Filtro
                key={item.id}
                activo={proyecto === item.id}
                etiqueta={item.name}
                onPress={() => setProyecto(proyecto === item.id ? null : item.id)}
                accent={accent}
                accentForeground={accentForeground}
                fondo={surfaceTertiary}
                texto={foreground}
                icono={
                  <ProjectIcon
                    name={item.icon}
                    color={proyecto === item.id ? accentForeground : item.color}
                    size={13}
                  />
                }
              />
            ))}
          </ScrollView>
        </Appear>

        <Appear delay={150} className="mt-4">
          <PressableFeedback
            onPress={() => setAbriendoOrden((valor) => !valor)}
            accessibilityRole="button"
            accessibilityLabel="Cambiar el orden"
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: surfaceTertiary,
            }}
          >
            <PressableFeedback.Highlight />
            <SortIcon color={muted} size={14} />
            <Text className="font-medium" style={{ fontSize: 13, color: foreground }}>
              {ORDERS.find((orden) => orden.id === prefs.order)?.label ?? 'Lo último'}
            </Text>
          </PressableFeedback>

          {abriendoOrden && (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {ORDERS.map((orden) => (
                <Filtro
                  key={orden.id}
                  activo={prefs.order === orden.id}
                  etiqueta={orden.label}
                  onPress={() => cambiarOrden(orden.id)}
                  accent={accent}
                  accentForeground={accentForeground}
                  fondo={surfaceTertiary}
                  texto={foreground}
                />
              ))}
            </View>
          )}
        </Appear>

        {isLoading ? (
          <View className="items-center py-10">
            <Spinner size="sm" />
          </View>
        ) : visibles.length === 0 ? (
          <Appear delay={190} className="mt-10">
            <Text className="font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              {busqueda
                ? `No hay nada con "${busqueda.trim()}".`
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
                  perfil={perfil}
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

function Filtro({
  activo,
  etiqueta,
  onPress,
  accent,
  accentForeground,
  fondo,
  texto,
  icono,
}: {
  activo: boolean;
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
      accessibilityState={{ selected: activo }}
      accessibilityLabel={etiqueta}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 9,
        backgroundColor: activo ? accent : fondo,
      }}
    >
      <PressableFeedback.Highlight />
      {icono}
      <Text
        className="font-medium"
        style={{ fontSize: 13, color: activo ? accentForeground : texto }}
      >
        {etiqueta}
      </Text>
    </PressableFeedback>
  );
}
