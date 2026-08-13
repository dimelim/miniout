import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Chip, PressableFeedback, Spinner, useToast } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { Aviso } from '@/components/aviso';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { FormatBar, type Seleccion } from '@/components/format-bar';
import { Formateado } from '@/components/formatted';
import {
  ChecklistIcon,
  ChevronLeftIcon,
  CopyIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/icons';
import { KeyboardSpace } from '@/components/keyboard-space';
import { NoteImage } from '@/components/note-image';
import { ProjectIcon } from '@/components/project-icons';
import { RuledPaper } from '@/components/ruled-paper';
import { ApiError, type Note, type NoteImage as Imagen } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { formatDayLabel, formatRelative } from '@/lib/dates';
import { useDictado } from '@/lib/dictation';
import {
  alternar,
  desdeMarkdown,
  desplazar,
  diferencia,
  limitesDeLinea,
  normalizar,
  quitar,
  tieneMarcasViejas,
  tieneTodo,
  VINETA,
  type Marca,
  type MarcaTipo,
} from '@/lib/format';
import { detectHints } from '@/lib/hints';
import { elegirImagen, subirImagen, type Origen } from '@/lib/images';
import { useAbrir } from '@/lib/navigate';
import { copiar, puedeCopiar, puedeUsarImagenes } from '@/lib/native';
import { useNotes } from '@/lib/notes-store';
import { EMPTY_PROFILE, readProfile, type Profile } from '@/lib/profile';
import { useProjects } from '@/lib/projects-store';
import { estadoDeEntrega } from '@/lib/schedule';

const MINIATURA = 132;
const CUERPO = 17;

const TIPOS: MarcaTipo[] = ['negrita', 'cursiva', 'subrayado', 'titulo'];
const ESCRIBIBLES: MarcaTipo[] = ['negrita', 'cursiva', 'subrayado'];

function contenidoInicial(note: Note | null) {
  if (!note) return { texto: '', marcas: [] as Marca[] };
  if (note.format.length > 0) return { texto: note.body, marcas: note.format };
  if (tieneMarcasViejas(note.body)) return desdeMarkdown(note.body);

  return { texto: note.body, marcas: [] as Marca[] };
}

function continuarVineta(anterior: string, siguiente: string) {
  if (siguiente.length <= anterior.length || !siguiente.startsWith(anterior)) return null;
  if (!siguiente.slice(anterior.length).startsWith('\n')) return null;

  const lineas = anterior.split('\n');
  const ultima = lineas[lineas.length - 1];

  if (!ultima.startsWith(VINETA)) return null;

  if (!ultima.slice(VINETA.length).trim()) {
    return `${lineas.slice(0, -1).join('\n')}${lineas.length > 1 ? '\n' : ''}`;
  }

  return `${siguiente}${VINETA}`;
}

export default function Nota() {
  const router = useRouter();
  const abrir = useAbrir();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();
  const { find, create, edit, toggle, remove } = useNotes();
  const { find: buscarProyecto } = useProjects();

  const [creada, setCreada] = useState<Note | null>(null);
  const note = find(id) ?? creada;

  const inicial = useRef(contenidoInicial(note));
  const original = useRef({ title: note?.title ?? '', body: inicial.current.texto });
  const cargado = useRef(!id || Boolean(note));
  const escribiendo = useRef(false);
  const campo = useRef<TextInput>(null);

  const [titulo, setTitulo] = useState(note?.title ?? '');
  const [cuerpo, setCuerpo] = useState(inicial.current.texto);
  const [marcas, setMarcas] = useState<Marca[]>(inicial.current.marcas);
  const [seleccion, setSeleccion] = useState<Seleccion>({ start: 0, end: 0 });
  const [pendientes, setPendientes] = useState<Partial<Record<MarcaTipo, boolean>>>({});
  const [forzada, setForzada] = useState<Seleccion | null>(null);
  const [perfil, setPerfil] = useState<Profile>(EMPTY_PROFILE);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const [problema, setProblema] = useState<string | null>(null);

  const [accent, accentForeground, muted, border, danger, warning, success, foreground] =
    useThemeColor([
      'accent',
      'accent-foreground',
      'muted',
      'border',
      'danger',
      'warning',
      'success',
      'foreground',
    ]);

  const dictar = useCallback((texto: string) => {
    setCuerpo((actual) => (actual.trim() ? `${actual.trimEnd()} ${texto}` : texto));
  }, []);

  const { toast } = useToast();
  const dictado = useDictado(dictar);
  const conAdjuntos = useMemo(() => puedeUsarImagenes(), []);
  const conCopia = useMemo(() => puedeCopiar(), []);

  const pistas = useMemo(() => detectHints(cuerpo), [cuerpo]);
  const cambiado =
    cuerpo.trim() !== original.current.body.trim() ||
    titulo.trim() !== original.current.title.trim();
  const entrega = estadoDeEntrega(note?.dueAt ?? null);
  const proyecto = buscarProyecto(note?.projectId);
  const arriba = note?.media.filter((imagen) => imagen.arriba) ?? [];
  const abajo = note?.media.filter((imagen) => !imagen.arriba) ?? [];

  const activos = useMemo(() => {
    const desde = seleccion.start === seleccion.end ? seleccion.start - 1 : seleccion.start;
    const hasta = seleccion.end;

    return TIPOS.filter((tipo) => {
      const querido = pendientes[tipo];

      if (querido !== undefined && tipo !== 'titulo') return querido;

      return tieneTodo(marcas, tipo, Math.max(0, desde), Math.max(1, hasta));
    });
  }, [marcas, pendientes, seleccion]);

  useEffect(() => {
    readProfile().then(setPerfil);
  }, []);

  useEffect(() => {
    if (!note || cargado.current) return;

    const contenido = contenidoInicial(note);

    setTitulo(note.title ?? '');
    setCuerpo(contenido.texto);
    setMarcas(contenido.marcas);
    original.current = { title: note.title ?? '', body: contenido.texto };
    cargado.current = true;
  }, [note]);

  const cambiarCuerpo = (texto: string) => {
    const continuado = continuarVineta(cuerpo, texto);
    const definitivo = continuado ?? texto;
    const cambio = diferencia(cuerpo, definitivo);

    setMarcas((actuales) => {
      let siguientes = desplazar(actuales, cambio);

      if (cambio.insertados > 0) {
        const desde = cambio.desde;
        const hasta = desde + cambio.insertados;

        for (const tipo of ESCRIBIBLES) {
          const querido = pendientes[tipo];

          if (querido === true) {
            siguientes = normalizar([...siguientes, { tipo, desde, hasta }]);
          } else if (querido === false) {
            siguientes = quitar(siguientes, tipo, desde, hasta);
          }
        }
      }

      return siguientes;
    });

    escribiendo.current = true;
    setCuerpo(definitivo);

    if (continuado) {
      const cursor = continuado.length;
      setForzada({ start: cursor, end: cursor });
    }
  };

  const aplicarMarca = (tipo: MarcaTipo) => {
    if (tipo !== 'titulo' && seleccion.start === seleccion.end) {
      setPendientes((actuales) => ({ ...actuales, [tipo]: !activos.includes(tipo) }));
      return;
    }

    const rango =
      tipo === 'titulo'
        ? limitesDeLinea(cuerpo, seleccion.start)
        : { desde: seleccion.start, hasta: seleccion.end };

    if (rango.hasta <= rango.desde) return;

    setMarcas((actuales) => alternar(actuales, tipo, rango.desde, rango.hasta));
  };

  const ponerVineta = () => {
    const { desde } = limitesDeLinea(cuerpo, seleccion.start);
    const yaEsta = cuerpo.slice(desde).startsWith(VINETA);

    const texto = yaEsta
      ? cuerpo.slice(0, desde) + cuerpo.slice(desde + VINETA.length)
      : cuerpo.slice(0, desde) + VINETA + cuerpo.slice(desde);

    setMarcas((actuales) => desplazar(actuales, diferencia(cuerpo, texto)));
    setCuerpo(texto);

    const cursor = yaEsta
      ? Math.max(desde, seleccion.start - VINETA.length)
      : seleccion.start + VINETA.length;

    setForzada({ start: cursor, end: cursor });
  };

  const guardar = useCallback(async () => {
    const limpioCuerpo = cuerpo.trim();
    const limpioTitulo = titulo.trim();

    if (!limpioCuerpo && !limpioTitulo) return null;

    setGuardando(true);
    setProblema(null);

    try {
      const patch = { title: limpioTitulo || null, body: cuerpo, format: marcas };
      const guardada = note ? await edit(note.id, patch) : await create(patch);

      if (!note) {
        cargado.current = true;
        setCreada(guardada);
        router.setParams({ id: guardada.id });
      }

      original.current = { title: limpioTitulo, body: cuerpo };

      return guardada;
    } catch (error) {
      setProblema(error instanceof ApiError ? error.message : 'No se pudo guardar el cambio');
      return null;
    } finally {
      setGuardando(false);
    }
  }, [create, cuerpo, edit, marcas, note, router, titulo]);

  const borrar = async () => {
    setPreguntando(false);

    if (!note) {
      router.back();
      return;
    }

    try {
      await remove(note.id);
      router.back();
    } catch {
      setProblema('No se pudo borrar la nota');
    }
  };

  const salir = async () => {
    await guardar();
    Keyboard.dismiss();
    router.back();
  };

  const copiarNota = async () => {
    const texto = titulo.trim() ? `${titulo.trim()}\n\n${cuerpo}` : cuerpo;

    if (await copiar(texto)) {
      toast.show({ variant: 'success', label: 'Copiada', description: 'Ya la puedes pegar' });
    }
  };

  const adjuntar = async (origen: Origen) => {
    if (!session) return;

    const asset = await elegirImagen(origen);
    if (!asset) return;

    setSubiendo(true);
    setProblema(null);

    try {
      const destino = note ?? (await guardar());

      if (!destino) {
        setProblema('Escribe algo antes de meter una imagen');
        return;
      }

      const imagen = await subirImagen(asset, session.accessToken);
      setCreada(await edit(destino.id, { media: [...destino.media, imagen] }));
    } catch (error) {
      setProblema(error instanceof Error ? error.message : 'No se pudo subir la imagen');
    } finally {
      setSubiendo(false);
    }
  };

  if (!note && id) {
    return (
      <View className="flex-1 bg-background">
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 22 }}>
          <PressableFeedback
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={{ alignSelf: 'flex-start', borderRadius: 999, padding: 8 }}
          >
            <PressableFeedback.Highlight />
            <ChevronLeftIcon color={foreground} size={20} />
          </PressableFeedback>
        </View>
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
            Esta nota ya no existe.
          </Text>
        </View>
      </View>
    );
  }

  const colorEntrega =
    entrega?.tono === 'vencido' ? danger : entrega?.tono === 'hoy' ? warning : muted;

  return (
    <View className="flex-1 bg-background">
      <RuledPaper opacity={0.3} />

      <View
        className="flex-row items-center justify-between gap-3"
        style={{ paddingTop: insets.top + 10, paddingHorizontal: 22 }}
      >
        <PressableFeedback
          onPress={salir}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Guardar y volver"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            borderRadius: 999,
            paddingLeft: 6,
            paddingRight: 14,
            paddingVertical: 8,
          }}
        >
          <PressableFeedback.Highlight />
          <ChevronLeftIcon color={muted} size={18} />
          <Text className="font-medium text-muted" style={{ fontSize: 15 }}>
            {cambiado || guardando ? 'Guardar' : 'Listo'}
          </Text>
        </PressableFeedback>

        {note && (
          <View className="flex-row items-center gap-2">
            {conCopia && (
              <Redondo etiqueta="Copiar la nota" borde={border} onPress={copiarNota}>
                <CopyIcon color={muted} size={16} />
              </Redondo>
            )}

            <Redondo
              etiqueta="Borrar la nota"
              borde={border}
              onPress={() => setPreguntando(true)}
            >
              <TrashIcon color={danger} size={16} />
            </Redondo>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 14,
          paddingBottom: insets.bottom + 150,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Appear rise={6}>
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            onBlur={guardar}
            placeholder="Título"
            placeholderTextColor={muted}
            selectionColor={accent}
            cursorColor={accent}
            maxLength={120}
            accessibilityLabel="Título de la nota"
            className="font-display text-foreground"
            style={{ fontSize: 27, lineHeight: 34, letterSpacing: -0.5, padding: 0 }}
          />

          <Text className="mt-1 font-medium text-muted" style={{ fontSize: 12 }}>
            {note
              ? `${formatDayLabel(new Date(note.createdAt))} · editada ${formatRelative(new Date(note.updatedAt))}`
              : 'Nota nueva'}
          </Text>
        </Appear>

        {note && (
          <View className="mt-4 flex-row flex-wrap items-center gap-2">
            <Etiqueta
              onPress={() => toggle(note)}
              etiqueta={note.done ? 'Hecha' : 'Pendiente'}
              color={note.done ? accent : border}
              texto={note.done ? foreground : muted}
              icono={<ChecklistIcon color={note.done ? accent : muted} size={13} />}
            />

            <Etiqueta
              onPress={() => abrir(`/mover?id=${note.id}`)}
              etiqueta={proyecto ? proyecto.name : 'Sin proyecto'}
              color={proyecto ? proyecto.color : border}
              texto={proyecto ? foreground : muted}
              icono={
                proyecto ? (
                  <ProjectIcon name={proyecto.icon} color={muted} size={13} />
                ) : (
                  <PlusIcon color={muted} size={12} />
                )
              }
            />

            <Etiqueta
              onPress={() => abrir(`/programar?id=${note.id}`)}
              etiqueta={entrega ? entrega.etiqueta : 'Sin fecha'}
              color={entrega ? colorEntrega : border}
              texto={entrega ? colorEntrega : muted}
            />

          </View>
        )}

        <Pressable
          onPress={() => campo.current?.focus()}
          accessible={false}
          className="mt-4 rounded-[24px] bg-surface px-5 py-4 shadow-surface"
          style={{ minHeight: 280 }}
        >
          <Tira imagenes={arriba} note={note} abrir={abrir} className="mb-4" />

          {subiendo && (
            <View className="mb-4 flex-row items-center gap-2">
              <Spinner size="sm" />
              <Text className="font-medium text-muted" style={{ fontSize: 13 }}>
                Subiendo la imagen
              </Text>
            </View>
          )}

          <TextInput
            ref={campo}
            onChangeText={cambiarCuerpo}
            onBlur={guardar}
            selection={forzada ?? undefined}
            onSelectionChange={(event) => {
              setSeleccion(event.nativeEvent.selection);
              if (forzada) setForzada(null);

              if (escribiendo.current) {
                escribiendo.current = false;
                return;
              }

              setPendientes({});
            }}
            multiline
            autoFocus={!note}
            maxLength={8000}
            placeholder="Escribe algo"
            placeholderTextColor={muted}
            selectionColor={accent}
            cursorColor={accent}
            accessibilityLabel="Cuerpo de la nota"
            className="font-sans text-foreground"
            style={{
              fontSize: CUERPO,
              lineHeight: CUERPO * 1.6,
              padding: 0,
              minHeight: 200,
              textAlignVertical: 'top',
              textDecorationLine: note?.done ? 'line-through' : 'none',
            }}
          >
            <Formateado texto={cuerpo} marcas={marcas} size={CUERPO} />
          </TextInput>

          {dictado.escuchando && (
            <View className="mt-1 flex-row items-start gap-2">
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  marginTop: CUERPO * 0.62,
                  backgroundColor: danger,
                }}
              />
              <Text
                className="flex-1 font-sans"
                style={{ fontSize: CUERPO, lineHeight: CUERPO * 1.6, color: muted }}
              >
                {dictado.parcial || 'Te escucho'}
              </Text>
            </View>
          )}

          <Tira imagenes={abajo} note={note} abrir={abrir} className="mt-4" />

          {pistas.length > 0 && (
            <View className="mt-4 flex-row flex-wrap gap-1.5 border-t border-border pt-3">
              {pistas.map((pista) => (
                <Chip key={`${pista.kind}-${pista.label}`} size="sm" variant="secondary">
                  <Chip.Label>{pista.label}</Chip.Label>
                </Chip>
              ))}
            </View>
          )}
        </Pressable>

        {dictado.escuchando && (
          <Text className="mt-4 text-center font-medium text-muted" style={{ fontSize: 12 }}>
            Toca el micrófono otra vez para parar.
          </Text>
        )}

        {dictado.problema && <Aviso mensaje={dictado.problema} className="mt-4" />}
        {problema && <Aviso mensaje={problema} className="mt-4" />}

        <KeyboardSpace bottomInset={insets.bottom} extra={56} />
      </ScrollView>

      <FormatBar
        bottomInset={insets.bottom}
        activos={activos}
        conAdjuntos={conAdjuntos}
        conDictado={dictado.disponible}
        dictando={dictado.escuchando}
        onMarca={aplicarMarca}
        onVineta={ponerVineta}
        onImagen={() => adjuntar('galeria')}
        onCamara={() => adjuntar('camara')}
        onDictar={() => (dictado.escuchando ? dictado.parar() : dictado.arrancar())}
      />

      <ConfirmDialog
        visible={preguntando}
        titulo="Borrar esta nota"
        mensaje="Se va de todos tus dispositivos y no se puede deshacer."
        confirmar="Borrar la nota"
        onConfirm={borrar}
        onCancel={() => setPreguntando(false)}
      />
    </View>
  );
}

function Tira({
  imagenes,
  note,
  abrir,
  className,
}: {
  imagenes: Imagen[];
  note: Note | null;
  abrir: (href: Href) => void;
  className: string;
}) {
  if (!note || imagenes.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`-mx-1 ${className}`}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
    >
      {imagenes.map((imagen) => (
        <PressableFeedback
          key={imagen.name}
          onPress={() => abrir(`/imagen?id=${note.id}&name=${imagen.name}`)}
          accessibilityRole="button"
          accessibilityLabel="Abrir la imagen"
          style={{ borderRadius: 18 }}
        >
          <NoteImage imagen={imagen} width={MINIATURA} height={MINIATURA} />
        </PressableFeedback>
      ))}
    </ScrollView>
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

function Etiqueta({
  onPress,
  etiqueta,
  color,
  texto,
  icono,
}: {
  onPress: () => void;
  etiqueta: string;
  color: string;
  texto: string;
  icono?: React.ReactNode;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: color,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
    >
      <PressableFeedback.Highlight />
      {icono}
      <Text className="font-medium" style={{ fontSize: 13, color: texto }}>
        {etiqueta}
      </Text>
    </PressableFeedback>
  );
}
