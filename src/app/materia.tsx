import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { BackButton } from '@/components/back-button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Evaluaciones } from '@/components/evaluaciones';
import { CheckIcon, ClockIcon, CloseIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { KeyboardSpace } from '@/components/keyboard-space';
import { RuledPaper } from '@/components/ruled-paper';
import { SendButton } from '@/components/send-button';
import { formatDayLabel } from '@/lib/dates';
import { EMPTY_PROFILE, readProfile, type Profile } from '@/lib/profile';
import { useAbrir } from '@/lib/navigate';
import {
  crearId,
  DIAS,
  MAX_APUNTE,
  MAX_ENCARGO,
  MAX_SUBJECT_NAME,
  ordenarClases,
  type Subject,
} from '@/lib/periods';
import { usePeriods } from '@/lib/periods-store';
import { ATAJOS, conDias } from '@/lib/schedule';

export default function Materia() {
  const router = useRouter();
  const abrir = useAbrir();
  const insets = useSafeAreaInsets();
  const { periodo: periodoId, id } = useLocalSearchParams<{ periodo?: string; id?: string }>();
  const { find, edit } = usePeriods();

  const periodo = find(periodoId);
  const subject = periodo?.subjects.find((una) => una.id === id) ?? null;

  const [nombre, setNombre] = useState(subject?.name ?? '');
  const [encargo, setEncargo] = useState('');
  const [apunte, setApunte] = useState('');
  const [borrando, setBorrando] = useState(false);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);

  useEffect(() => {
    readProfile().then(setPerfil);
  }, []);

  const [muted, danger, border, surfaceSecondary, accent, accentForeground, background] =
    useThemeColor([
      'muted',
      'danger',
      'border',
      'surface-secondary',
      'accent',
      'accent-foreground',
      'background',
    ]);

  const clases = useMemo(() => (subject ? ordenarClases(subject.clases) : []), [subject]);
  const apuntes = useMemo(
    () =>
      subject
        ? [...(subject.apuntes ?? [])].sort((uno, otro) => otro.fecha.localeCompare(uno.fecha))
        : [],
    [subject]
  );

  if (!periodo || !subject) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
          <BackButton label="Atrás" />
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
            Esa materia ya no existe.
          </Text>
        </View>
      </View>
    );
  }

  const cambiar = (cambio: (una: Subject) => Subject) =>
    edit(periodo.id, {
      subjects: periodo.subjects.map((una) => (una.id === subject.id ? cambio(una) : una)),
    });

  const guardarNombre = async () => {
    const limpio = nombre.trim();

    if (!limpio || limpio === subject.name) return;

    await cambiar((una) => ({ ...una, name: limpio }));
  };

  const agregarEncargo = async () => {
    const limpio = encargo.trim();
    if (!limpio) return;

    setEncargo('');
    Keyboard.dismiss();

    await cambiar((una) => ({
      ...una,
      encargos: [
        ...una.encargos,
        { id: crearId(), titulo: limpio.slice(0, MAX_ENCARGO), fecha: null, hecho: false },
      ],
    }));
  };

  const agregarApunte = async () => {
    const limpio = apunte.trim();
    if (!limpio) return;

    setApunte('');
    Keyboard.dismiss();

    await cambiar((una) => ({
      ...una,
      apuntes: [
        ...una.apuntes,
        {
          id: crearId(),
          fecha: new Date().toISOString(),
          texto: limpio.slice(0, MAX_APUNTE),
        },
      ],
    }));
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View
        className="flex-row items-center justify-between px-7"
        style={{ paddingTop: insets.top + 12 }}
      >
        <BackButton label={periodo.name} />

        <PressableFeedback
          onPress={() => setBorrando(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Borrar la materia"
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
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            onBlur={guardarNombre}
            maxLength={MAX_SUBJECT_NAME}
            selectionColor={periodo.color}
            cursorColor={periodo.color}
            accessibilityLabel="Nombre de la materia"
            className="font-display text-foreground"
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.6, padding: 0 }}
          />
          <View
            style={{ height: 2, width: 46, borderRadius: 999, backgroundColor: periodo.color }}
          />
        </Appear>

        <Appear delay={60} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Cómo te va
          </Text>

          <Evaluaciones
            subject={subject}
            perfil={perfil}
            color={periodo.color}
            onCambiar={cambiar}
            onCalificar={(evaluacion) =>
              abrir(`/calificar?periodo=${periodo.id}&materia=${subject.id}&id=${evaluacion}`)
            }
          />
        </Appear>

        <Appear delay={110} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Horario
          </Text>

          <Animated.View layout={LinearTransition.duration(200)} className="gap-2">
            {clases.map((clase) => (
              <View
                key={clase.id}
                className="flex-row items-center gap-3 rounded-[18px] bg-surface p-3.5 shadow-surface"
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: surfaceSecondary,
                  }}
                >
                  <Text className="font-semibold text-foreground" style={{ fontSize: 13 }}>
                    {DIAS[clase.dia].slice(0, 2)}
                  </Text>
                </View>

                <PressableFeedback
                  onPress={() =>
                    abrir(`/clase?periodo=${periodo.id}&materia=${subject.id}&id=${clase.id}`)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Cambiar la clase de ${DIAS[clase.dia]}`}
                  style={{ flex: 1, borderRadius: 12 }}
                >
                  <PressableFeedback.Highlight />
                  <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
                    {`${clase.inicio} a ${clase.fin}`}
                  </Text>
                  <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 12 }}>
                    {clase.lugar ? clase.lugar : DIAS[clase.dia]}
                  </Text>
                </PressableFeedback>

                <PressableFeedback
                  onPress={() =>
                    cambiar((una) => ({
                      ...una,
                      clases: una.clases.filter((otra) => otra.id !== clase.id),
                    }))
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Quitar la clase"
                  style={{ padding: 6, borderRadius: 999 }}
                >
                  <PressableFeedback.Highlight />
                  <CloseIcon color={muted} size={14} />
                </PressableFeedback>
              </View>
            ))}
          </Animated.View>

          <PressableFeedback
            onPress={() => abrir(`/clase?periodo=${periodo.id}&materia=${subject.id}`)}
            accessibilityRole="button"
            accessibilityLabel="Añadir una clase"
            className="mt-2 flex-row items-center justify-center gap-2 rounded-[18px] border border-border py-3"
          >
            <PressableFeedback.Highlight />
            <ClockIcon color={muted} size={15} />
            <Text className="font-medium text-muted" style={{ fontSize: 14 }}>
              {clases.length === 0 ? 'Ponle horario' : 'Otra clase'}
            </Text>
          </PressableFeedback>
        </Appear>

        <Appear delay={150} className="mt-8">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Lo que te mandaron
          </Text>

          <Animated.View layout={LinearTransition.duration(200)} className="gap-2">
            {subject.encargos.map((uno) => (
              <View
                key={uno.id}
                className="flex-row items-start gap-3 rounded-[18px] bg-surface p-3.5 shadow-surface"
              >
                <PressableFeedback
                  onPress={() =>
                    cambiar((una) => ({
                      ...una,
                      encargos: una.encargos.map((otro) =>
                        otro.id === uno.id ? { ...otro, hecho: !otro.hecho } : otro
                      ),
                    }))
                  }
                  hitSlop={10}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: uno.hecho }}
                  accessibilityLabel={uno.titulo}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 8,
                    marginTop: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: uno.hecho ? accent : border,
                    backgroundColor: uno.hecho ? accent : 'transparent',
                  }}
                >
                  {uno.hecho && <CheckIcon color={accentForeground} size={13} />}
                </PressableFeedback>

                <View className="flex-1">
                  <Text
                    className="font-medium text-foreground"
                    style={{
                      fontSize: 15,
                      textDecorationLine: uno.hecho ? 'line-through' : 'none',
                      opacity: uno.hecho ? 0.55 : 1,
                    }}
                  >
                    {uno.titulo}
                  </Text>

                  <View className="mt-2 flex-row flex-wrap gap-1.5">
                    {ATAJOS.map((atajo) => {
                      const fecha = conDias(atajo.dias, new Date()).toISOString().slice(0, 10);
                      const activo = uno.fecha?.slice(0, 10) === fecha;

                      return (
                        <PressableFeedback
                          key={atajo.id}
                          onPress={() =>
                            cambiar((una) => ({
                              ...una,
                              encargos: una.encargos.map((otro) =>
                                otro.id === uno.id
                                  ? {
                                      ...otro,
                                      fecha: activo
                                        ? null
                                        : conDias(atajo.dias, new Date()).toISOString(),
                                    }
                                  : otro
                              ),
                            }))
                          }
                          accessibilityRole="radio"
                          accessibilityState={{ selected: activo }}
                          accessibilityLabel={`Entregar ${atajo.etiqueta}`}
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            backgroundColor: activo ? accent : surfaceSecondary,
                          }}
                        >
                          <Text
                            className="font-medium"
                            style={{
                              fontSize: 11,
                              lineHeight: 15,
                              color: activo ? accentForeground : muted,
                            }}
                          >
                            {atajo.etiqueta}
                          </Text>
                        </PressableFeedback>
                      );
                    })}
                  </View>
                </View>

                <PressableFeedback
                  onPress={() =>
                    cambiar((una) => ({
                      ...una,
                      encargos: una.encargos.filter((otro) => otro.id !== uno.id),
                    }))
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Quitarlo"
                  style={{ padding: 6, borderRadius: 999 }}
                >
                  <PressableFeedback.Highlight />
                  <CloseIcon color={muted} size={14} />
                </PressableFeedback>
              </View>
            ))}
          </Animated.View>

          <Campo
            valor={encargo}
            onChange={setEncargo}
            onEnviar={agregarEncargo}
            marcador="Trabajo, consulta, lo que sea"
            color={periodo.color}
            muted={muted}
            border={border}
            fondo={surfaceSecondary}
            background={background}
            maximo={MAX_ENCARGO}
          />
        </Appear>

        <Appear delay={190} className="mt-8">
          <Text className="mb-1 font-display text-foreground" style={{ fontSize: 20 }}>
            Cómo fue cada día
          </Text>
          <Text className="mb-3 font-sans text-muted" style={{ fontSize: 13, lineHeight: 20 }}>
            Lo que se vio en clase, lo que dijo el profesor, lo que hay que repasar.
          </Text>

          <Animated.View layout={LinearTransition.duration(200)} className="gap-2">
            {apuntes.map((uno) => (
              <View key={uno.id} className="rounded-[18px] bg-surface p-4 shadow-surface">
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text className="font-medium text-muted" style={{ fontSize: 11 }}>
                      {formatDayLabel(new Date(uno.fecha))}
                    </Text>
                    <Text
                      className="mt-1 font-sans text-foreground"
                      style={{ fontSize: 15, lineHeight: 22 }}
                    >
                      {uno.texto}
                    </Text>
                  </View>

                  <PressableFeedback
                    onPress={() =>
                      cambiar((una) => ({
                        ...una,
                        apuntes: una.apuntes.filter((otro) => otro.id !== uno.id),
                      }))
                    }
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Quitar el comentario"
                    style={{ padding: 6, borderRadius: 999 }}
                  >
                    <PressableFeedback.Highlight />
                    <CloseIcon color={muted} size={14} />
                  </PressableFeedback>
                </View>
              </View>
            ))}
          </Animated.View>

          <Campo
            valor={apunte}
            onChange={setApunte}
            onEnviar={agregarApunte}
            marcador="Hoy vimos..."
            color={periodo.color}
            muted={muted}
            border={border}
            fondo={surfaceSecondary}
            background={background}
            maximo={MAX_APUNTE}
          />
        </Appear>

        <KeyboardSpace bottomInset={insets.bottom} />
      </ScrollView>

      <ConfirmDialog
        visible={borrando}
        titulo={`Borrar ${subject.name}`}
        mensaje="Se van su horario, sus entregas y sus comentarios."
        confirmar="Borrar la materia"
        onConfirm={async () => {
          setBorrando(false);
          await edit(periodo.id, {
            subjects: periodo.subjects.filter((una) => una.id !== subject.id),
          });
          router.back();
        }}
        onCancel={() => setBorrando(false)}
      />
    </View>
  );
}

function Campo({
  valor,
  onChange,
  onEnviar,
  marcador,
  color,
  muted,
  border,
  fondo,
  background,
  maximo,
}: {
  valor: string;
  onChange: (valor: string) => void;
  onEnviar: () => void;
  marcador: string;
  color: string;
  muted: string;
  border: string;
  fondo: string;
  background: string;
  maximo: number;
}) {
  return (
    <View
      className="mt-2 flex-row items-center gap-3 rounded-[18px] px-4 py-2"
      style={{ borderWidth: 1.5, borderColor: border }}
    >
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder={marcador}
        placeholderTextColor={muted}
        selectionColor={color}
        cursorColor={color}
        maxLength={maximo}
        returnKeyType="done"
        onSubmitEditing={onEnviar}
        accessibilityLabel={marcador}
        className="flex-1 font-sans text-foreground"
        style={{ fontSize: 15, paddingVertical: 10, paddingHorizontal: 0 }}
      />

      <SendButton
        activo={Boolean(valor.trim())}
        color={color}
        fondo={fondo}
        contraste={background}
        muted={muted}
        etiqueta="Añadir"
        onPress={onEnviar}
      />
    </View>
  );
}
