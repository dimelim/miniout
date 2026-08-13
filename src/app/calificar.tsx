import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { gradeLabel, gradeScale, gradeSteps, gradeTone, passMarkOf } from '@/lib/grades';
import { useNotes } from '@/lib/notes-store';
import { EMPTY_PROFILE, readProfile, type Profile } from '@/lib/profile';

const MAX_BOTONES = 21;

export default function Calificar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { find, edit } = useNotes();

  const note = find(id);

  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [valor, setValor] = useState<number | null>(note?.grade ?? null);
  const [escrito, setEscrito] = useState(note?.grade === null ? '' : String(note?.grade ?? ''));
  const [guardando, setGuardando] = useState(false);

  const [accent, accentForeground, muted, surfaceSecondary, foreground, danger, warning, success] =
    useThemeColor([
      'accent',
      'accent-foreground',
      'muted',
      'surface-secondary',
      'foreground',
      'danger',
      'warning',
      'success',
    ]);

  useEffect(() => {
    readProfile().then(setPerfil);
  }, []);

  const escala = gradeScale(perfil);
  const pasos = useMemo(() => gradeSteps(perfil), [perfil]);
  const enBotones = pasos.length <= MAX_BOTONES;

  const tono = valor === null ? null : gradeTone(valor, perfil);
  const color = tono === 'bajo' ? danger : tono === 'justo' ? warning : success;

  const guardar = async (nota: number | null) => {
    if (!note || guardando) return;

    setGuardando(true);

    try {
      await edit(note.id, { grade: nota });
      router.back();
    } finally {
      setGuardando(false);
    }
  };

  const escribir = (texto: string) => {
    setEscrito(texto);

    const numero = Number(texto.replace(',', '.'));

    if (!texto.trim() || Number.isNaN(numero)) {
      setValor(null);
      return;
    }

    setValor(Math.min(escala.max, Math.max(escala.min, numero)));
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
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 25, letterSpacing: -0.4 }}
          >
            ¿Qué sacaste?
          </Text>
          <Text className="mt-2 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            {`De ${escala.min} a ${escala.max}, y pasas con ${gradeLabel(passMarkOf(perfil), perfil)}. La escala se cambia en Ajustes.`}
          </Text>
        </Appear>

        <Appear delay={70} className="mt-6 items-center">
          <Text
            className="font-display"
            style={{ fontSize: 56, lineHeight: 62, letterSpacing: -1, color: valor === null ? muted : color }}
          >
            {valor === null ? '--' : gradeLabel(valor, perfil)}
          </Text>
        </Appear>

        {enBotones ? (
          <Appear delay={130} className="mt-6 flex-row flex-wrap justify-center gap-2">
            {pasos.map((paso) => (
              <PressableFeedback
                key={paso}
                onPress={() => setValor(paso)}
                accessibilityRole="radio"
                accessibilityState={{ selected: valor === paso }}
                accessibilityLabel={gradeLabel(paso, perfil)}
                style={{
                  minWidth: 52,
                  borderRadius: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  backgroundColor: valor === paso ? accent : surfaceSecondary,
                }}
              >
                <PressableFeedback.Highlight />
                <Text
                  className="font-medium"
                  style={{
                    fontSize: 15,
                    color: valor === paso ? accentForeground : foreground,
                  }}
                >
                  {gradeLabel(paso, perfil)}
                </Text>
              </PressableFeedback>
            ))}
          </Appear>
        ) : (
          <Appear delay={130} className="mt-6">
            <TextInput
              value={escrito}
              onChangeText={escribir}
              keyboardType="numeric"
              placeholder={`De ${escala.min} a ${escala.max}`}
              placeholderTextColor={muted}
              selectionColor={accent}
              cursorColor={accent}
              maxLength={6}
              autoFocus
              accessibilityLabel="Tu calificación"
              className="font-display text-foreground"
              style={{
                fontSize: 22,
                textAlign: 'center',
                borderRadius: 18,
                paddingVertical: 14,
                backgroundColor: surfaceSecondary,
              }}
            />
          </Appear>
        )}

        <Appear delay={190} className="mt-8 gap-3">
          <Button size="lg" onPress={() => guardar(valor)} isDisabled={valor === null}>
            <Button.Label>{guardando ? 'Guardando' : 'Guardar la nota'}</Button.Label>
          </Button>

          {note?.grade !== null && note?.grade !== undefined && (
            <PressableFeedback
              onPress={() => guardar(null)}
              accessibilityRole="button"
              accessibilityLabel="Quitar la calificación"
              style={{
                alignSelf: 'center',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <PressableFeedback.Highlight />
              <Text className="font-medium" style={{ fontSize: 14, color: muted }}>
                Quitar la calificación
              </Text>
            </PressableFeedback>
          )}
        </Appear>
      </ScrollView>
    </View>
  );
}
