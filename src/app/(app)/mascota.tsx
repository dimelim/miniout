import { useThemeColor } from 'heroui-native/hooks';
import { useMemo } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { PressableFeedback } from 'heroui-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { Appear } from '@/components/appear';
import { CheckIcon } from '@/components/icons';
import { InkDrop } from '@/components/ink-drop';
import { KeyboardSpace } from '@/components/keyboard-space';
import { RuledPaper } from '@/components/ruled-paper';
import { useAuth } from '@/lib/auth-store';
import {
  ACCESORIOS,
  MASCOTA_COLORES,
  MAX_NOMBRE_MASCOTA,
  useMascota,
} from '@/lib/mascota';
import { useNotes } from '@/lib/notes-store';
import { usePeriods } from '@/lib/periods-store';
import { useProjects } from '@/lib/projects-store';

function fraseDeLaGota(nombre: string, pendientes: number, hora: number) {
  const yo = nombre || 'Tu gota';

  if (hora < 7) return `${yo} dice: madrugaste, yo sigo medio dormida.`;
  if (pendientes === 0) return `${yo} dice: hoy no debes nada. Se siente bien, no?`;
  if (pendientes === 1) return `${yo} dice: solo queda una cosa. La sacamos y listo.`;
  if (hora >= 21) return `${yo} dice: deja algo para mañana, pero escríbelo antes.`;

  return `${yo} dice: quedan ${pendientes} cosas. Una a la vez.`;
}

export default function MascotaTab() {
  const insets = useSafeAreaInsets();
  const { account } = useAuth();
  const { mascota, cambiar } = useMascota();
  const { notes } = useNotes();
  const { projects } = useProjects();
  const { periods } = usePeriods();

  const [accent, muted, background, surfaceTertiary, foreground] = useThemeColor([
    'accent',
    'muted',
    'background',
    'surface-tertiary',
    'foreground',
  ]);

  const flotar = useSharedValue(0);

  useEffect(() => {
    flotar.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [flotar]);

  const vuelo = useAnimatedStyle(() => ({
    transform: [{ translateY: flotar.value * -8 }],
  }));

  const hechas = notes.filter((note) => note.done).length;
  const pendientes = notes.length - hechas;
  const materias = periods.reduce((total, periodo) => total + periodo.subjects.length, 0);

  const frase = useMemo(
    () => fraseDeLaGota(mascota.nombre, pendientes, new Date().getHours()),
    [mascota.nombre, pendientes]
  );

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
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
          >
            {mascota.nombre || 'Tu mascota'}
          </Text>
          <Text className="mt-1 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            {mascota.nombre
              ? 'Vive en tu Inicio y en MiniLock. Tócala, que responde.'
              : 'Todavía no tiene nombre. Ponle uno abajo.'}
          </Text>
        </Appear>

        <Appear delay={60} className="mt-6">
          <View className="items-center rounded-[28px] bg-surface py-8 shadow-surface">
            <Animated.View style={vuelo}>
              <InkDrop size={120} mood={pendientes === 0 ? 'happy' : 'idle'} />
            </Animated.View>

            <Text
              className="mt-6 px-8 text-center font-sans text-muted"
              style={{ fontSize: 14, lineHeight: 21 }}
            >
              {frase}
            </Text>
          </View>
        </Appear>

        <Appear delay={110} className="mt-7">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Cómo se llama
          </Text>

          <View className="rounded-[20px] bg-surface p-4 shadow-surface">
            <TextInput
              value={mascota.nombre}
              onChangeText={(nombre) => cambiar({ nombre })}
              placeholder="Gota, Tinta, Amber, lo que quieras"
              placeholderTextColor={muted}
              selectionColor={accent}
              cursorColor={accent}
              maxLength={MAX_NOMBRE_MASCOTA}
              accessibilityLabel="Nombre de tu mascota"
              className="font-display text-foreground"
              style={{ fontSize: 22, padding: 0 }}
            />
            <View
              className="mt-3"
              style={{ height: 2, borderRadius: 999, backgroundColor: accent, opacity: 0.9 }}
            />
          </View>
        </Appear>

        <Appear delay={150} className="mt-7">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            De qué color es
          </Text>

          <View className="flex-row flex-wrap gap-2.5 rounded-[20px] bg-surface p-4 shadow-surface">
            {MASCOTA_COLORES.map((valor, indice) => {
              const activa =
                mascota.color === valor || (mascota.color === null && indice === 0);

              return (
                <PressableFeedback
                  key={valor}
                  onPress={() => cambiar({ color: indice === 0 ? null : valor })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: activa }}
                  accessibilityLabel={`Color ${indice + 1}`}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: valor,
                    borderWidth: activa ? 3 : 0,
                    borderColor: foreground,
                  }}
                >
                  {activa && <CheckIcon color={background} size={15} />}
                </PressableFeedback>
              );
            })}
          </View>
        </Appear>

        <Appear delay={190} className="mt-7">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            Qué lleva puesto
          </Text>

          <View className="flex-row gap-2">
            {ACCESORIOS.map((uno) => {
              const activo = mascota.accesorio === uno.id;

              return (
                <PressableFeedback
                  key={uno.id}
                  onPress={() => cambiar({ accesorio: uno.id })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: activo }}
                  accessibilityLabel={uno.label}
                  className="flex-1 items-center rounded-[20px] bg-surface py-4 shadow-surface"
                  style={{ borderWidth: 1.5, borderColor: activo ? accent : 'transparent' }}
                >
                  <PressableFeedback.Highlight />
                  <View style={{ height: 56, justifyContent: 'flex-end' }}>
                    <InkDrop size={40} accesorio={uno.id} />
                  </View>
                  <Text
                    className="mt-2 font-medium"
                    style={{ fontSize: 12, color: activo ? foreground : muted }}
                  >
                    {uno.label}
                  </Text>
                </PressableFeedback>
              );
            })}
          </View>
        </Appear>

        <Appear delay={230} className="mt-7">
          <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
            {`Lo que ha visto ${mascota.nombre ? `${mascota.nombre}` : 'contigo'}`}
          </Text>

          <View className="flex-row gap-2.5">
            <Dato valor={notes.length} etiqueta="notas escritas" fondo={surfaceTertiary} />
            <Dato valor={hechas} etiqueta="cosas hechas" fondo={surfaceTertiary} />
            <Dato
              valor={projects.length + materias}
              etiqueta="cajones y materias"
              fondo={surfaceTertiary}
            />
          </View>

          {account?.displayName && (
            <Text className="mt-4 font-sans text-muted" style={{ fontSize: 13, lineHeight: 20 }}>
              {`${mascota.nombre || 'Tu gota'} acompaña a ${account.displayName.split(' ')[0]} desde que abrió su cuenta.`}
            </Text>
          )}
        </Appear>

        <KeyboardSpace bottomInset={insets.bottom} />
      </ScrollView>
    </View>
  );
}

function Dato({
  valor,
  etiqueta,
  fondo,
}: {
  valor: number;
  etiqueta: string;
  fondo: string;
}) {
  return (
    <View
      className="flex-1 items-center rounded-[18px] px-2 py-4"
      style={{ backgroundColor: fondo }}
    >
      <Text
        className="font-display text-foreground"
        style={{ fontSize: 26, letterSpacing: -0.5 }}
      >
        {valor}
      </Text>
      <Text
        className="mt-0.5 text-center font-medium text-muted"
        style={{ fontSize: 11, lineHeight: 15 }}
      >
        {etiqueta}
      </Text>
    </View>
  );
}
