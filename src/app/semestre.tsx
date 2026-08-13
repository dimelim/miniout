import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { Aviso } from '@/components/aviso';
import { BackButton } from '@/components/back-button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ChevronRightIcon, ClockIcon, PencilIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { useAbrir } from '@/lib/navigate';
import {
  clasesDelDia,
  completarSubject,
  crearId,
  DIAS,
  encargosPendientes,
  resumenHorario,
  subjectNameError,
  MAX_SUBJECT_NAME,
} from '@/lib/periods';
import { usePeriods } from '@/lib/periods-store';
import { EMPTY_PROFILE, periodWords, readProfile, type Profile } from '@/lib/profile';

export default function Semestre() {
  const router = useRouter();
  const abrir = useAbrir();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { find, edit, remove } = usePeriods();

  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [materia, setMateria] = useState('');
  const [problema, setProblema] = useState<string | null>(null);
  const [borrando, setBorrando] = useState(false);

  const [muted, danger, background, border, surfaceSecondary] = useThemeColor([
    'muted',
    'danger',
    'background',
    'border',
    'surface-secondary',
  ]);

  const periodo = find(id);

  useEffect(() => {
    readProfile().then(setPerfil);
  }, []);

  const hoy = new Date();
  const diaDeHoy = (hoy.getDay() + 6) % 7;

  const deHoy = useMemo(
    () => (periodo ? clasesDelDia(periodo.subjects, diaDeHoy) : []),
    [periodo, diaDeHoy]
  );

  const pendientes = useMemo(
    () => (periodo ? encargosPendientes(periodo.subjects) : []),
    [periodo]
  );

  if (!periodo) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
          <BackButton label="Inicio" />
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
            Ese periodo ya no existe.
          </Text>
        </View>
      </View>
    );
  }

  const palabras = periodWords(perfil.stage);

  const agregar = async () => {
    const problem = subjectNameError(materia);
    setProblema(problem);

    if (problem) return;

    await edit(periodo.id, {
      subjects: [
        ...periodo.subjects,
        completarSubject({ id: crearId(), name: materia.trim() }),
      ],
    });

    setMateria('');
    Keyboard.dismiss();
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View
        className="flex-row items-center justify-between px-7"
        style={{ paddingTop: insets.top + 12 }}
      >
        <BackButton label="Inicio" />

        <View className="flex-row items-center gap-2">
          <Redondo
            etiqueta="Cambiar el periodo"
            borde={border}
            onPress={() => abrir(`/nuevo-periodo?id=${periodo.id}`)}
          >
            <PencilIcon color={muted} size={16} />
          </Redondo>

          <Redondo etiqueta="Borrar el periodo" borde={border} onPress={() => setBorrando(true)}>
            <TrashIcon color={danger} size={16} />
          </Redondo>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
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
                backgroundColor: periodo.color,
              }}
            >
              <ProjectIcon name={periodo.icon} color={background} size={23} />
            </View>

            <View className="flex-1">
              <Text className="font-medium text-muted" style={{ fontSize: 13 }}>
                {palabras.singular}
              </Text>
              <Text
                className="font-display text-foreground"
                style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.6 }}
              >
                {periodo.name}
              </Text>
            </View>
          </View>
        </Appear>

        {periodo.subjects.length > 0 && (
          <Appear delay={60} className="mt-7">
            <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
              {`Hoy, ${DIAS[diaDeHoy].toLowerCase()}`}
            </Text>

            <View className="rounded-[22px] bg-surface p-4 shadow-surface">
              {deHoy.length === 0 ? (
                <Text className="font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
                  Hoy no tienes clases puestas. Entra en una materia para darle horario.
                </Text>
              ) : (
                <View className="gap-3">
                  {deHoy.map(({ subject, clase }) => (
                    <View key={clase.id} className="flex-row items-center gap-3">
                      <View
                        style={{
                          borderRadius: 10,
                          paddingHorizontal: 9,
                          paddingVertical: 5,
                          backgroundColor: surfaceSecondary,
                        }}
                      >
                        <Text className="font-semibold text-foreground" style={{ fontSize: 12 }}>
                          {clase.inicio}
                        </Text>
                      </View>

                      <View className="flex-1">
                        <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
                          {subject.name}
                        </Text>
                        {clase.lugar ? (
                          <Text className="font-sans text-muted" style={{ fontSize: 12 }}>
                            {clase.lugar}
                          </Text>
                        ) : null}
                      </View>

                      <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
                        {`hasta ${clase.fin}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Appear>
        )}

        {pendientes.length > 0 && (
          <Appear delay={90} className="mt-7">
            <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
              Te falta entregar
            </Text>

            <View className="gap-2">
              {pendientes.slice(0, 4).map(({ subject, encargo }) => (
                <View
                  key={encargo.id}
                  className="flex-row items-center gap-3 rounded-[18px] border border-border px-4 py-3"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
                      {encargo.titulo}
                    </Text>
                    <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 12 }}>
                      {subject.name}
                    </Text>
                  </View>

                  {encargo.fecha && (
                    <Text className="font-medium text-muted" style={{ fontSize: 12 }}>
                      {new Date(encargo.fecha).toLocaleDateString('es', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </Appear>
        )}

        <Appear delay={120} className="mt-7">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Materias
          </Text>

          {periodo.subjects.length === 0 && (
            <Text
              className="mb-3 font-sans text-muted"
              style={{ fontSize: 14, lineHeight: 21 }}
            >
              Añade las que estás viendo. Dentro de cada una pones su horario, lo que te mandan y
              cómo fue cada día.
            </Text>
          )}

          <Animated.View layout={LinearTransition.duration(220)} className="gap-2">
            {periodo.subjects.map((subject) => {
              const horario = resumenHorario(subject.clases);
              const sinHacer = subject.encargos.filter((encargo) => !encargo.hecho).length;

              return (
                <PressableFeedback
                  key={subject.id}
                  onPress={() => abrir(`/materia?periodo=${periodo.id}&id=${subject.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${subject.name}`}
                  className="flex-row items-center gap-3 rounded-[20px] bg-surface p-4 shadow-surface"
                >
                  <PressableFeedback.Highlight />

                  <View className="flex-1">
                    <Text className="font-medium text-foreground" style={{ fontSize: 16 }}>
                      {subject.name}
                    </Text>

                    <View className="mt-1 flex-row items-center gap-2">
                      {horario ? (
                        <>
                          <ClockIcon color={muted} size={12} />
                          <Text className="font-sans text-muted" style={{ fontSize: 12 }}>
                            {horario}
                          </Text>
                        </>
                      ) : (
                        <Text className="font-sans text-muted" style={{ fontSize: 12 }}>
                          Sin horario
                        </Text>
                      )}
                    </View>

                    {sinHacer > 0 && (
                      <Text
                        className="mt-1 font-medium"
                        style={{ fontSize: 12, color: periodo.color }}
                      >
                        {sinHacer === 1 ? '1 cosa sin entregar' : `${sinHacer} cosas sin entregar`}
                      </Text>
                    )}
                  </View>

                  <ChevronRightIcon color={muted} size={16} />
                </PressableFeedback>
              );
            })}
          </Animated.View>

          <View className="mt-3">
            <View
              className="flex-row items-center gap-3 rounded-[18px] px-4 py-2"
              style={{ borderWidth: 1.5, borderColor: problema ? danger : border }}
            >
              <TextInput
                value={materia}
                onChangeText={(valor) => {
                  setMateria(valor);
                  if (problema) setProblema(null);
                }}
                placeholder="Añade una materia"
                placeholderTextColor={muted}
                selectionColor={periodo.color}
                cursorColor={periodo.color}
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
                  backgroundColor: materia.trim() ? periodo.color : surfaceSecondary,
                }}
              >
                <PressableFeedback.Highlight />
                <PlusIcon color={materia.trim() ? background : muted} size={16} />
              </PressableFeedback>
            </View>

            {problema && <Aviso mensaje={problema} className="mt-2 px-1" />}
          </View>
        </Appear>
      </ScrollView>

      <ConfirmDialog
        visible={borrando}
        titulo={`Borrar ${periodo.name}`}
        mensaje="Se van sus materias, sus horarios y lo que anotaste en ellas."
        confirmar="Borrar el periodo"
        onConfirm={async () => {
          setBorrando(false);
          await remove(periodo.id);
          router.back();
        }}
        onCancel={() => setBorrando(false)}
      />
    </View>
  );
}

function Redondo({
  etiqueta,
  borde,
  onPress,
  children,
}: {
  etiqueta: string;
  borde: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: borde,
      }}
    >
      <PressableFeedback.Highlight />
      {children}
    </PressableFeedback>
  );
}
