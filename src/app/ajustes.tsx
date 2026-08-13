import { Button, Card, Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { Aviso } from '@/components/aviso';
import { BackButton } from '@/components/back-button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CheckIcon, ChevronRightIcon } from '@/components/icons';
import { RuledPaper } from '@/components/ruled-paper';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { nameError } from '@/lib/credentials';
import { useLock } from '@/lib/lock';
import { useAbrir } from '@/lib/navigate';
import {
  DEFAULT_PREFS,
  ORDERS,
  readPrefs,
  savePrefs,
  type NoteOrder,
  type NotePrefs,
} from '@/lib/preferences';
import {
  EMPTY_PROFILE,
  SCALES,
  findScale,
  formatGrade,
  periodWords,
  readProfile,
  saveProfile,
  type Profile,
  type Stage,
} from '@/lib/profile';

export default function Ajustes() {
  const abrir = useAbrir();
  const insets = useSafeAreaInsets();
  const { account, saveName } = useAuth();
  const { tieneClave, quitar } = useLock();

  const [nombre, setNombre] = useState(account?.displayName ?? '');
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [prefs, setPrefs] = useState<NotePrefs>(DEFAULT_PREFS);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const [quitandoClave, setQuitandoClave] = useState(false);

  const [accent, accentForeground, muted, border] = useThemeColor([
    'accent',
    'accent-foreground',
    'muted',
    'border',
  ]);

  useEffect(() => {
    readProfile().then(setPerfil);
    readPrefs().then(setPrefs);
  }, []);

  const palabras = periodWords(perfil.stage);
  const escala = findScale(perfil.scale);

  const guardarNombre = async () => {
    const problem = nameError(nombre);
    setProblema(problem);
    setAviso(null);

    if (problem) return;

    setGuardando(true);

    try {
      await saveName(nombre.trim());
      setAviso('Listo, ahora te llamo así.');
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo guardar tu nombre');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEtapa = async (stage: Stage) => {
    const siguiente = { ...perfil, stage };
    setPerfil(siguiente);
    await saveProfile(siguiente);
  };

  const cambiarEscala = async (scale: Profile['scale']) => {
    const definicion = findScale(scale);
    const siguiente: Profile = {
      ...perfil,
      scale,
      passMark: definicion && scale !== 'letras' ? definicion.defaultPass : null,
    };

    setPerfil(siguiente);
    await saveProfile(siguiente);
  };

  const cambiarPrefs = async (patch: Partial<NotePrefs>) => {
    const siguiente = { ...prefs, ...patch };
    setPrefs(siguiente);
    await savePrefs(siguiente);
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View className="px-7" style={{ paddingTop: insets.top + 12 }}>
        <BackButton label="Cuenta" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 60,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.6 }}
          >
            Ajustes
          </Text>
        </Appear>

        <Appear delay={70} className="mt-7">
          <Titulo texto="Cómo te llamo" />

          <Card className="gap-3">
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor={muted}
              selectionColor={accent}
              cursorColor={accent}
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={guardarNombre}
              accessibilityLabel="Tu nombre"
              className="font-display text-foreground"
              style={{ fontSize: 22, padding: 0 }}
            />

            <View
              style={{ height: 2, borderRadius: 999, backgroundColor: accent, opacity: 0.9 }}
            />

            {aviso && <Aviso mensaje={aviso} tono="exito" />}
            {problema && <Aviso mensaje={problema} />}

            <Button size="sm" onPress={guardarNombre} isDisabled={guardando}>
              <Button.Label>{guardando ? 'Guardando' : 'Guardar'}</Button.Label>
            </Button>
          </Card>
        </Appear>

        <Appear delay={130} className="mt-8">
          <Titulo texto="Dónde estudias" />

          <Card className="gap-3">
            <View className="flex-row gap-2">
              {(['universidad', 'colegio'] as Stage[]).map((etapa) => (
                <Opcion
                  key={etapa}
                  activa={perfil.stage === etapa}
                  etiqueta={etapa === 'colegio' ? 'Colegio' : 'Universidad'}
                  onPress={() => cambiarEtapa(etapa)}
                />
              ))}
            </View>

            <Text className="font-sans text-muted" style={{ fontSize: 13, lineHeight: 20 }}>
              Ahora mismo les llamo {palabras.plural.toLowerCase()}.
            </Text>
          </Card>
        </Appear>

        <Appear delay={190} className="mt-8">
          <Titulo texto="Tus calificaciones" />

          <Card className="gap-3">
            <View className="flex-row flex-wrap gap-2">
              {SCALES.map((opcion) => (
                <Opcion
                  key={opcion.id}
                  activa={perfil.scale === opcion.id}
                  etiqueta={opcion.label}
                  onPress={() => cambiarEscala(opcion.id)}
                />
              ))}
            </View>

            {escala && perfil.passMark !== null && (
              <View className="flex-row items-center gap-2">
                <Chip size="sm" variant="secondary">
                  <Chip.Label>{`Pasas con ${formatGrade(perfil.passMark, escala.decimals)}`}</Chip.Label>
                </Chip>
              </View>
            )}
          </Card>
        </Appear>

        <Appear delay={250} className="mt-8">
          <Titulo texto="Tus notas" />

          <Card className="gap-4">
            <View className="gap-3">
              <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
                Cómo las ordeno
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {ORDERS.map((orden) => (
                  <Opcion
                    key={orden.id}
                    activa={prefs.order === orden.id}
                    etiqueta={orden.label}
                    onPress={() => cambiarPrefs({ order: orden.id as NoteOrder })}
                  />
                ))}
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: border }} />

            <View className="flex-row items-center gap-4">
              <View className="flex-1">
                <Text className="font-medium text-foreground" style={{ fontSize: 15 }}>
                  Esconder las hechas
                </Text>
                <Text
                  className="mt-0.5 font-sans text-muted"
                  style={{ fontSize: 13, lineHeight: 19 }}
                >
                  La lista se queda solo con lo que te falta.
                </Text>
              </View>

              <Switch
                value={prefs.hideDone}
                onValueChange={(valor) => cambiarPrefs({ hideDone: valor })}
                trackColor={{ true: accent, false: border }}
                thumbColor={prefs.hideDone ? accentForeground : undefined}
                accessibilityLabel="Esconder las notas hechas"
              />
            </View>
          </Card>
        </Appear>

        <Appear delay={310} className="mt-8">
          <Titulo texto="MiniLock" />

          <PressableFeedback
            onPress={() => (tieneClave ? setQuitandoClave(true) : abrir('/minilock'))}
            accessibilityRole="button"
            accessibilityLabel={tieneClave ? 'Quitar el código' : 'Poner un código'}
            className="rounded-[20px] bg-surface p-4 shadow-surface"
          >
            <PressableFeedback.Highlight />
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-medium text-foreground" style={{ fontSize: 16 }}>
                    Código de 4 dígitos
                  </Text>
                  {!tieneClave && (
                    <View
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        backgroundColor: accent,
                      }}
                    >
                      <Text
                        className="font-semibold"
                        style={{ fontSize: 10, color: accentForeground }}
                      >
                        Nuevo
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className="mt-0.5 font-sans text-muted"
                  style={{ fontSize: 13, lineHeight: 19 }}
                >
                  {tieneClave
                    ? 'Miniout te lo pide al abrir. Tócalo para quitarlo.'
                    : 'Para que nadie abra tus notas si te dejan el teléfono en la mano.'}
                </Text>
              </View>
              <ChevronRightIcon color={muted} size={16} />
            </View>
          </PressableFeedback>
        </Appear>
      </ScrollView>

      <ConfirmDialog
        visible={quitandoClave}
        titulo="Quitar MiniLock"
        mensaje="Cualquiera que tenga tu teléfono podrá abrir tus notas."
        confirmar="Quitar el código"
        onConfirm={async () => {
          setQuitandoClave(false);
          await quitar();
        }}
        onCancel={() => setQuitandoClave(false)}
      />
    </View>
  );
}

function Titulo({ texto }: { texto: string }) {
  return (
    <Text className="mb-3 font-display text-foreground" style={{ fontSize: 20 }}>
      {texto}
    </Text>
  );
}

function Opcion({
  activa,
  etiqueta,
  onPress,
}: {
  activa: boolean;
  etiqueta: string;
  onPress: () => void;
}) {
  const [accent, accentForeground, foreground, surfaceTertiary] = useThemeColor([
    'accent',
    'accent-foreground',
    'foreground',
    'surface-tertiary',
  ]);

  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={etiqueta}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: activa ? accent : surfaceTertiary,
      }}
    >
      <PressableFeedback.Highlight />
      {activa && <CheckIcon color={accentForeground} size={12} />}
      <Text
        className="font-medium"
        style={{ fontSize: 14, color: activa ? accentForeground : foreground }}
      >
        {etiqueta}
      </Text>
    </PressableFeedback>
  );
}
