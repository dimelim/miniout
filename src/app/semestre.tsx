import { useLocalSearchParams } from 'expo-router';
import { Button, Card, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { PlusIcon } from '@/components/icons';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { api, type Note } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { EMPTY_PROFILE, periodWords, readProfile, type Profile } from '@/lib/profile';
import {
  addSubject,
  findSemester,
  MAX_SUBJECT_NAME,
  readSemesters,
  removeSubject,
  subjectNameError,
  type Semester,
} from '@/lib/semesters';

export default function SemestreScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [materia, setMateria] = useState('');
  const [problema, setProblema] = useState<string | null>(null);

  const [muted, danger, accent, background, borde, surfaceSecondary] = useThemeColor([
    'muted',
    'danger',
    'accent',
    'background',
    'border',
    'surface-secondary',
  ]);

  const semester = useMemo(() => findSemester(semesters, id), [semesters, id]);

  useEffect(() => {
    readSemesters().then(setSemesters);
    readProfile().then(setPerfil);
  }, []);

  useEffect(() => {
    if (!session) return;

    api
      .notes(session.accessToken)
      .then((payload) => setNotes(payload.notes.filter((note) => !note.deletedAt)))
      .catch(() => setNotes([]));
  }, [session]);

  const contarNotas = useCallback(
    (name: string) => {
      const target = name.trim().toLowerCase();

      return notes.filter((note) =>
        note.hints.some(
          (hint) => hint.kind === 'subject' && hint.label.toLowerCase() === target
        )
      ).length;
    },
    [notes]
  );

  const agregar = async () => {
    const problem = subjectNameError(materia);
    setProblema(problem);

    if (problem || !semester) return;

    setSemesters(await addSubject(semester.id, materia));
    setMateria('');
    Keyboard.dismiss();
  };

  const quitar = async (subjectId: string) => {
    if (!semester) return;
    setSemesters(await removeSubject(semester.id, subjectId));
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
        <BackButton label="Inicio" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!semester ? (
          <Text className="font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
            Ese semestre ya no existe.
          </Text>
        ) : (
          <>
            <View className="flex-row items-center gap-3">
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: semester.color,
                }}
              >
                <ProjectIcon name={semester.icon} color={background} size={21} />
              </View>
              <Text className="font-medium text-muted" style={{ fontSize: 13 }}>
                {periodWords(perfil.stage).singular}
              </Text>
            </View>

            <Text
              className="mt-2 font-display text-foreground"
              style={{ fontSize: 34, lineHeight: 40, letterSpacing: -0.7 }}
            >
              {semester.name}
            </Text>

            <Text className="mt-2 font-sans text-muted" style={{ fontSize: 15, lineHeight: 23 }}>
              {semester.subjects.length === 0
                ? 'Añade las materias que estás viendo. Cuando escribas una nota que las mencione, se enlazan solas.'
                : 'Las notas que mencionen una materia se cuentan aquí.'}
            </Text>

            <Animated.View layout={LinearTransition.duration(220)} className="mt-7 gap-2">
              {semester.subjects.map((subject) => (
                <View key={subject.id}>
                  <View className="flex-row items-center gap-3 rounded-[18px] bg-surface px-4 py-3.5 shadow-surface">
                    <View className="flex-1">
                      <Text className="font-sans text-foreground" style={{ fontSize: 16 }}>
                        {subject.name}
                      </Text>
                      <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 12 }}>
                        {contarNotas(subject.name) === 1
                          ? '1 nota'
                          : `${contarNotas(subject.name)} notas`}
                      </Text>
                    </View>

                    <PressableFeedback
                      onPress={() => quitar(subject.id)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar ${subject.name}`}
                      style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}
                    >
                      <PressableFeedback.Highlight />
                      <Text className="font-medium" style={{ fontSize: 13, color: muted }}>
                        Quitar
                      </Text>
                    </PressableFeedback>
                  </View>
                </View>
              ))}
            </Animated.View>

            <View className="mt-5">
              <View
                className="flex-row items-center gap-3 rounded-[18px] px-4 py-2"
                style={{ borderWidth: 1.5, borderColor: problema ? danger : borde }}
              >
                <TextInput
                  value={materia}
                  onChangeText={(value) => {
                    setMateria(value);
                    if (problema) setProblema(null);
                  }}
                  placeholder="Añade una materia"
                  placeholderTextColor={muted}
                  selectionColor={accent}
                  cursorColor={accent}
                  maxLength={MAX_SUBJECT_NAME}
                  returnKeyType="done"
                  onSubmitEditing={agregar}
                  accessibilityLabel="Nombre de la materia"
                  className="flex-1 font-sans text-foreground"
                  style={{ fontSize: 16, paddingVertical: 10, paddingHorizontal: 0 }}
                />

                <PressableFeedback
                  onPress={agregar}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Añadir materia"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: materia.trim() ? semester.color : surfaceSecondary,
                  }}
                >
                  <PressableFeedback.Highlight />
                  <PlusIcon color={materia.trim() ? background : muted} size={16} />
                </PressableFeedback>
              </View>

              {problema && (
                <Text
                  accessibilityLiveRegion="polite"
                  className="mt-2 px-1"
                  style={{ fontSize: 13, color: danger }}
                >
                  {problema}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
