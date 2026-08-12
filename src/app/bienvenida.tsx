import { useRouter } from 'expo-router';
import { Button, Chip, PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Keyboard, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { CheckIcon, MinusIcon, PlusIcon } from '@/components/icons';
import { Mark } from '@/components/mark';
import { NameField } from '@/components/name-field';
import { RuledPaper } from '@/components/ruled-paper';
import { SignatureMark } from '@/components/signature-mark';
import { SlideDots } from '@/components/slide-dots';
import { TextLink } from '@/components/text-link';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { nameError } from '@/lib/credentials';
import {
  EMPTY_PROFILE,
  SCALES,
  findScale,
  formatGrade,
  saveProfile,
  type Profile,
  type ScaleId,
  type Stage,
} from '@/lib/profile';

const EASE = Easing.bezier(0.32, 0.72, 0, 1);
const FOCUS_DELAY = 420;
const PICK_DELAY = 190;
const PREGUNTA = '¿Cómo quieres que te llame?';

type Paso = 'nombre' | 'etapa' | 'escala' | 'aprobar' | 'listo';

const ORDEN: Paso[] = ['nombre', 'etapa', 'escala', 'aprobar'];

const ETAPAS: { id: Stage; label: string; hint: string }[] = [
  { id: 'universidad', label: 'Universidad', hint: 'Semestres, materias y créditos.' },
  { id: 'colegio', label: 'Colegio', hint: 'Periodos, asignaturas y cursos.' },
];

function firstName(displayName: string | null | undefined) {
  return displayName?.trim().split(/\s+/)[0] ?? '';
}

export default function Bienvenida() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account, saveName } = useAuth();

  const campo = useRef<TextInput>(null);
  const [nombre, setNombre] = useState(() => firstName(account?.displayName));
  const [paso, setPaso] = useState<Paso>('nombre');
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [guardando, setGuardando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, border] = useThemeColor(['accent', 'border']);

  const total = perfil.scale === 'letras' ? 3 : ORDEN.length;
  const posicion = ORDEN.indexOf(paso);

  useEffect(() => {
    const timer = setTimeout(() => campo.current?.focus(), FOCUS_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const cerrar = async (siguiente: Profile) => {
    setPerfil(siguiente);
    await saveProfile(siguiente);
    setPaso('listo');
  };

  const continuarNombre = async () => {
    const problem = nameError(nombre);
    setProblema(problem);

    if (problem) return;

    const limpio = nombre.trim();

    if (limpio !== account?.displayName) {
      setGuardando(true);

      try {
        await saveName(limpio);
      } catch (error) {
        setProblema(
          error instanceof ApiError
            ? error.message
            : 'No se pudo guardar tu nombre. Revisa tu conexión e inténtalo otra vez.'
        );
        return;
      } finally {
        setGuardando(false);
      }
    }

    Keyboard.dismiss();
    setNombre(limpio);
    setPaso('etapa');
  };

  const omitirNombre = () => {
    Keyboard.dismiss();
    setNombre(firstName(account?.displayName));
    setPaso('etapa');
  };

  const elegirEtapa = (stage: Stage) => {
    setPerfil((current) => ({ ...current, stage }));
    setTimeout(() => setPaso('escala'), PICK_DELAY);
  };

  const elegirEscala = (scale: ScaleId) => {
    const definicion = findScale(scale);
    const siguiente: Profile = {
      ...perfil,
      scale,
      passMark: definicion && scale !== 'letras' ? definicion.defaultPass : null,
    };

    setPerfil(siguiente);

    if (scale === 'letras') {
      setTimeout(() => cerrar(siguiente), PICK_DELAY);
      return;
    }

    setTimeout(() => setPaso('aprobar'), PICK_DELAY);
  };

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.4} />

      <View
        className="flex-1 px-7"
        style={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28 }}
      >
        {paso !== 'listo' && (
          <View className="mb-8 flex-row justify-start">
            <SlideDots
              count={total}
              index={Math.min(posicion, total - 1)}
              isPlaying={false}
              autoplayMs={0}
              restColor={border}
              activeColor={accent}
              onSelect={(destino) => {
                if (destino < posicion) setPaso(ORDEN[destino]);
              }}
            />
          </View>
        )}

        {paso === 'nombre' && (
          <PasoNombre
            campo={campo}
            nombre={nombre}
            onChange={setNombre}
            onSubmit={continuarNombre}
            onOmitir={omitirNombre}
            guardando={guardando}
            problema={problema}
            bottomInset={insets.bottom}
          />
        )}

        {paso === 'etapa' && (
          <PasoPregunta
            titulo="¿Dónde estudias ahora?"
            pista="Para llamar a las cosas como las llamas tú."
            onAtras={() => setPaso('nombre')}
            onOmitir={() => setPaso('escala')}
          >
            {ETAPAS.map((etapa, position) => (
              <Appear key={etapa.id} delay={120 + position * 70}>
                <Opcion
                  titulo={etapa.label}
                  descripcion={etapa.hint}
                  seleccionada={perfil.stage === etapa.id}
                  onPress={() => elegirEtapa(etapa.id)}
                />
              </Appear>
            ))}
          </PasoPregunta>
        )}

        {paso === 'escala' && (
          <PasoPregunta
            titulo="¿Cómo te califican?"
            pista="La escala de notas de donde estudias."
            onAtras={() => setPaso('etapa')}
            onOmitir={() => cerrar(perfil)}
          >
            {SCALES.map((escala, position) => (
              <Appear key={escala.id} delay={120 + position * 60}>
                <Opcion
                  titulo={escala.label}
                  ejemplo={escala.sample}
                  seleccionada={perfil.scale === escala.id}
                  onPress={() => elegirEscala(escala.id)}
                />
              </Appear>
            ))}
          </PasoPregunta>
        )}

        {paso === 'aprobar' && (
          <PasoAprobar
            perfil={perfil}
            onCambiar={(passMark) => setPerfil((current) => ({ ...current, passMark }))}
            onAtras={() => setPaso('escala')}
            onContinuar={() => cerrar(perfil)}
          />
        )}

        {paso === 'listo' && (
          <PasoListo
            nombre={nombre}
            perfil={perfil}
            onEmpezar={() => router.replace('/inicio')}
          />
        )}
      </View>
    </View>
  );
}

type PasoNombreProps = {
  campo: RefObject<TextInput | null>;
  nombre: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onOmitir: () => void;
  guardando: boolean;
  problema: string | null;
  bottomInset: number;
};

function PasoNombre({
  campo,
  nombre,
  onChange,
  onSubmit,
  onOmitir,
  guardando,
  problema,
  bottomInset,
}: PasoNombreProps) {
  const danger = useThemeColor('danger');
  const teclado = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
    isNavigationBarTranslucentAndroid: true,
  });

  const sobreElTeclado = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(0, teclado.height.value - bottomInset) }],
  }));

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Mark size={34} />
          <Text
            className="mt-7 font-display text-foreground"
            style={{ fontSize: 36, lineHeight: 42, letterSpacing: -0.7 }}
          >
            {PREGUNTA}
          </Text>
          <Text
            className="mt-3 font-sans text-muted"
            style={{ fontSize: 15, lineHeight: 23, maxWidth: 300 }}
          >
            Tu nombre o como te diga tu gente. Así te saluda la app.
          </Text>
        </Appear>

        <Appear delay={90} className="mt-10">
          <NameField
            ref={campo}
            value={nombre}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
            label={PREGUNTA}
          />
        </Appear>

        {problema && (
          <View accessibilityLiveRegion="polite" className="mt-3">
            <Text style={{ fontSize: 13, lineHeight: 19, color: danger }}>{problema}</Text>
          </View>
        )}
      </ScrollView>

      <Animated.View style={sobreElTeclado}>
        <Appear delay={180} className="gap-3 pt-6">
          <Button size="lg" onPress={onSubmit} isDisabled={guardando}>
            <Button.Label>{guardando ? 'Guardando' : 'Continuar'}</Button.Label>
          </Button>

          <TextLink label="Ahora no" onPress={onOmitir} />
        </Appear>
      </Animated.View>
    </>
  );
}

type PasoPreguntaProps = {
  titulo: string;
  pista: string;
  onAtras: () => void;
  onOmitir: () => void;
  children: React.ReactNode;
};

function PasoPregunta({ titulo, pista, onAtras, onOmitir, children }: PasoPreguntaProps) {
  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 34, lineHeight: 40, letterSpacing: -0.7 }}
          >
            {titulo}
          </Text>
          <Text
            className="mt-3 font-sans text-muted"
            style={{ fontSize: 15, lineHeight: 23, maxWidth: 300 }}
          >
            {pista}
          </Text>
        </Appear>

        <View className="mt-8 gap-2.5">{children}</View>
      </ScrollView>

      <Appear delay={220} className="flex-row items-center justify-between pt-6">
        <TextLink label="Atrás" onPress={onAtras} />
        <TextLink label="Ahora no" onPress={onOmitir} />
      </Appear>
    </>
  );
}

type OpcionProps = {
  titulo: string;
  descripcion?: string;
  ejemplo?: string;
  seleccionada: boolean;
  onPress: () => void;
};

function Opcion({ titulo, descripcion, ejemplo, seleccionada, onPress }: OpcionProps) {
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);

  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: seleccionada }}
      accessibilityLabel={descripcion ? `${titulo}. ${descripcion}` : titulo}
      className="rounded-[20px] bg-surface p-4 shadow-surface"
      style={{ borderWidth: 1.5, borderColor: seleccionada ? accent : 'transparent' }}
    >
      <PressableFeedback.Highlight />

      <View className="flex-row items-center gap-4">
        {ejemplo && (
          <View className="w-14 items-center">
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 26, letterSpacing: -0.4 }}
            >
              {ejemplo}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="font-medium text-foreground" style={{ fontSize: 17 }}>
            {titulo}
          </Text>
          {descripcion && (
            <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13, lineHeight: 19 }}>
              {descripcion}
            </Text>
          )}
        </View>

        {seleccionada && (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: accent,
            }}
          >
            <CheckIcon color={accentForeground} size={13} />
          </View>
        )}
      </View>
    </PressableFeedback>
  );
}

type PasoAprobarProps = {
  perfil: Profile;
  onCambiar: (passMark: number) => void;
  onAtras: () => void;
  onContinuar: () => void;
};

function PasoAprobar({ perfil, onCambiar, onAtras, onContinuar }: PasoAprobarProps) {
  const accent = useThemeColor('accent');
  const escala = findScale(perfil.scale);

  const valor = perfil.passMark ?? escala?.defaultPass ?? 0;
  const decimales = escala?.decimals ?? 0;

  const mover = (direccion: number) => {
    if (!escala) return;

    const siguiente = Math.min(
      escala.max,
      Math.max(escala.min, Number((valor + direccion * escala.step).toFixed(2)))
    );

    onCambiar(siguiente);
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        showsVerticalScrollIndicator={false}
      >
        <Appear>
          <Text
            className="font-display text-foreground"
            style={{ fontSize: 34, lineHeight: 40, letterSpacing: -0.7 }}
          >
            ¿Con cuánto pasas?
          </Text>
          <Text
            className="mt-3 font-sans text-muted"
            style={{ fontSize: 15, lineHeight: 23, maxWidth: 300 }}
          >
            La nota mínima para aprobar. Muévela hasta la tuya.
          </Text>
        </Appear>

        <Appear delay={120} className="mt-12 flex-row items-center justify-center gap-7">
          <PasoRedondo etiqueta="Bajar" onPress={() => mover(-1)}>
            <MinusIcon color={accent} size={18} />
          </PasoRedondo>

          <View className="items-center">
            <Text
              className="font-display text-foreground"
              style={{ fontSize: 64, lineHeight: 70, letterSpacing: -1.6 }}
            >
              {formatGrade(valor, decimales)}
            </Text>
            <View
              className="mt-1"
              style={{ height: 5, width: 54, borderRadius: 999, backgroundColor: accent }}
            />
          </View>

          <PasoRedondo etiqueta="Subir" onPress={() => mover(1)}>
            <PlusIcon color={accent} size={18} />
          </PasoRedondo>
        </Appear>

        <Appear delay={200} className="mt-6 items-center">
          <Text className="font-sans text-muted" style={{ fontSize: 13 }}>
            {escala ? `Escala ${escala.label.toLowerCase()}` : ''}
          </Text>
        </Appear>
      </ScrollView>

      <Appear delay={260} className="gap-3 pt-6">
        <Button size="lg" onPress={onContinuar}>
          <Button.Label>Continuar</Button.Label>
        </Button>
        <View className="flex-row items-center justify-between">
          <TextLink label="Atrás" onPress={onAtras} />
          <TextLink label="Ahora no" onPress={onContinuar} />
        </View>
      </Appear>
    </>
  );
}

function PasoRedondo({
  etiqueta,
  onPress,
  children,
}: {
  etiqueta: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const surfaceSecondary = useThemeColor('surface-secondary');

  return (
    <PressableFeedback
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{
        width: 52,
        height: 52,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: surfaceSecondary,
      }}
    >
      <PressableFeedback.Highlight />
      {children}
    </PressableFeedback>
  );
}

function PasoListo({
  nombre,
  perfil,
  onEmpezar,
}: {
  nombre: string;
  perfil: Profile;
  onEmpezar: () => void;
}) {
  const escala = findScale(perfil.scale);

  const resumen = [
    perfil.stage === 'colegio' ? 'Colegio' : perfil.stage === 'universidad' ? 'Universidad' : null,
    escala ? escala.label : null,
    perfil.passMark !== null && escala
      ? `Pasas con ${formatGrade(perfil.passMark, escala.decimals)}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow justify-center"
        showsVerticalScrollIndicator={false}
      >
        <Appear rise={0}>
          <View className="items-center">
            <SignatureMark isActive width={200} />
          </View>
        </Appear>

        <Appear delay={240} className="mt-8">
          <Saludo nombre={nombre} />

          <Text
            className="mt-4 font-sans text-muted"
            style={{ fontSize: 16, lineHeight: 25, maxWidth: 320 }}
          >
            Tu cuenta ya está lista. Desde ahora lo que escribas te sigue a cualquier
            teléfono donde entres.
          </Text>
        </Appear>

        {resumen.length > 0 && (
          <Appear delay={320} className="mt-5 flex-row flex-wrap gap-1.5">
            {resumen.map((linea) => (
              <Chip key={linea} size="sm" variant="secondary">
                <Chip.Label>{linea}</Chip.Label>
              </Chip>
            ))}
          </Appear>
        )}

        <Appear
          delay={400}
          className="mt-8 flex-row items-start gap-3 rounded-[20px] bg-surface px-5 py-4 shadow-surface"
        >
          <View className="mt-0.5">
            <Mark size={18} />
          </View>
          <Text className="flex-1 font-sans text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
            Miniout está empezando. Lo que veas hoy es la base, y va a crecer a partir de
            aquí.
          </Text>
        </Appear>
      </ScrollView>

      <Appear delay={480} className="pt-6">
        <Button size="lg" onPress={onEmpezar}>
          <Button.Label>Empezar</Button.Label>
        </Button>
      </Appear>
    </>
  );
}

function Saludo({ nombre }: { nombre: string }) {
  const accent = useThemeColor('accent');
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!nombre) return;
    sweep.value = withDelay(460, withTiming(1, { duration: 360, easing: EASE }));
  }, [nombre, sweep]);

  const trazo = useAnimatedStyle(() => ({ transform: [{ scaleX: sweep.value }] }));

  if (!nombre) {
    return (
      <Text
        className="font-display text-foreground"
        style={{ fontSize: 38, lineHeight: 44, letterSpacing: -0.7 }}
      >
        Todo listo
      </Text>
    );
  }

  return (
    <View className="self-start">
      <Text
        className="font-display text-foreground"
        style={{ fontSize: 38, lineHeight: 44, letterSpacing: -0.7 }}
      >
        Listo,
      </Text>
      <Text
        className="font-display text-foreground"
        style={{ fontSize: 38, lineHeight: 44, letterSpacing: -0.7 }}
      >
        {nombre}
      </Text>
      <Animated.View
        style={[
          {
            marginTop: 4,
            height: 5,
            borderRadius: 999,
            backgroundColor: accent,
            transformOrigin: 'left',
          },
          trazo,
        ]}
      />
    </View>
  );
}
