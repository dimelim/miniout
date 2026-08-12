import { useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon } from '@/components/icons';
import { DEFAULT_ICON, PROJECT_ICONS, ProjectIcon } from '@/components/project-icons';
import { readProfile, periodWords, EMPTY_PROFILE, type Profile } from '@/lib/profile';
import {
  addSemester,
  DEFAULT_COLOR,
  MAX_SEMESTER_NAME,
  PROJECT_COLORS,
} from '@/lib/semesters';

export default function NuevoPeriodo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_COLOR);

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
    if (!nombre.trim()) return;

    await addSemester({ name: nombre, icon: icono, color });
    router.back();
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
            {palabras.one}
          </Text>
        </View>

        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder={palabras.example}
          placeholderTextColor={muted}
          selectionColor={color}
          cursorColor={color}
          maxLength={MAX_SEMESTER_NAME}
          returnKeyType="done"
          onSubmitEditing={guardar}
          autoFocus
          accessibilityLabel={palabras.one}
          className="font-display text-foreground"
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

        <Text className="mt-8 font-medium text-muted" style={{ fontSize: 12 }}>
          Icono
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {PROJECT_ICONS.map((id) => (
            <PressableFeedback
              key={id}
              onPress={() => setIcono(id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: icono === id }}
              accessibilityLabel={id}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: icono === id ? color : surfaceSecondary,
              }}
            >
              <PressableFeedback.Highlight />
              <ProjectIcon name={id} color={icono === id ? background : muted} size={20} />
            </PressableFeedback>
          ))}
        </View>

        <Text className="mt-7 font-medium text-muted" style={{ fontSize: 12 }}>
          Color
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2.5">
          {PROJECT_COLORS.map((value) => (
            <PressableFeedback
              key={value}
              onPress={() => setColor(value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: color === value }}
              accessibilityLabel={`Color ${value}`}
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: value,
              }}
            >
              {color === value && <CheckIcon color={background} size={15} />}
            </PressableFeedback>
          ))}
        </View>

        <Button size="lg" className="mt-9" onPress={guardar} isDisabled={!nombre.trim()}>
          <Button.Label>Guardar</Button.Label>
        </Button>
      </ScrollView>
    </View>
  );
}
