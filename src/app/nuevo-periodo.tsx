import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aviso } from '@/components/aviso';
import { CheckIcon } from '@/components/icons';
import { DEFAULT_ICON, PROJECT_ICONS, ProjectIcon } from '@/components/project-icons';
import { ApiError } from '@/lib/api';
import { usePeriods } from '@/lib/periods-store';
import { readProfile, periodWords, EMPTY_PROFILE, type Profile } from '@/lib/profile';
import {
  DEFAULT_COLOR,
  MAX_SEMESTER_NAME,
  PROJECT_COLORS,
  semesterNameError,
} from '@/lib/semesters';

export default function NuevoPeriodo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { create, edit, find } = usePeriods();

  const periodo = find(id);

  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [nombre, setNombre] = useState(periodo?.name ?? '');
  const [icono, setIcono] = useState(periodo?.icon ?? DEFAULT_ICON);
  const [color, setColor] = useState(periodo?.color ?? DEFAULT_COLOR);
  const [guardando, setGuardando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  const [foreground, muted, surfaceSecondary, background] = useThemeColor([
    'foreground',
    'muted',
    'surface-secondary',
    'background',
  ]);

  useEffect(() => {
    readProfile().then(setPerfil);
  }, []);

  const palabras = periodWords(perfil.stage);

  const guardar = async () => {
    const problem = semesterNameError(nombre);
    setProblema(problem);

    if (problem) return;

    setGuardando(true);

    try {
      if (periodo) {
        await edit(periodo.id, { name: nombre.trim(), icon: icono, color });
      } else {
        await create({ name: nombre.trim(), icon: icono, color });
      }

      router.back();
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3">
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color,
            }}
          >
            <ProjectIcon name={icono} color={background} size={23} />
          </View>

          <Text
            className="flex-1 font-display text-foreground"
            style={{ fontSize: 25, letterSpacing: -0.4 }}
          >
            {periodo ? `Este ${palabras.singular.toLowerCase()}` : palabras.one}
          </Text>
        </View>

        <TextInput
          value={nombre}
          onChangeText={(valor) => {
            setNombre(valor);
            if (problema) setProblema(null);
          }}
          placeholder={palabras.example}
          placeholderTextColor={muted}
          selectionColor={color}
          cursorColor={color}
          maxLength={MAX_SEMESTER_NAME}
          returnKeyType="done"
          onSubmitEditing={guardar}
          autoFocus={!periodo}
          accessibilityLabel={palabras.one}
          className="font-display"
          style={{
            marginTop: 22,
            fontSize: 24,
            color: foreground,
            borderBottomWidth: 2,
            borderBottomColor: color,
            paddingBottom: 8,
            paddingHorizontal: 0,
          }}
        />

        {problema && <Aviso mensaje={problema} className="mt-3" />}

        <Text className="mt-8 font-medium text-muted" style={{ fontSize: 12 }}>
          Icono
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {PROJECT_ICONS.map((valor) => (
            <PressableFeedback
              key={valor}
              onPress={() => setIcono(valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: icono === valor }}
              accessibilityLabel={valor}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: icono === valor ? color : surfaceSecondary,
              }}
            >
              <PressableFeedback.Highlight />
              <ProjectIcon name={valor} color={icono === valor ? background : muted} size={20} />
            </PressableFeedback>
          ))}
        </View>

        <Text className="mt-7 font-medium text-muted" style={{ fontSize: 12 }}>
          Color
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2.5">
          {PROJECT_COLORS.map((valor) => (
            <PressableFeedback
              key={valor}
              onPress={() => setColor(valor)}
              accessibilityRole="radio"
              accessibilityState={{ selected: color === valor }}
              accessibilityLabel={`Color ${valor}`}
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: valor,
              }}
            >
              {color === valor && <CheckIcon color={background} size={15} />}
            </PressableFeedback>
          ))}
        </View>

        <Button
          size="lg"
          className="mt-9"
          onPress={guardar}
          isDisabled={guardando || !nombre.trim()}
        >
          <Button.Label>{guardando ? 'Guardando' : 'Guardar'}</Button.Label>
        </Button>
      </ScrollView>
    </View>
  );
}
