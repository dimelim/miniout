import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Chip, PressableFeedback, Spinner, useToast } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '@/components/appear';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Firma } from '@/components/firma';
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
import { ApiError, type Note, type NoteDrawing, type NoteImage as Imagen } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { useAvisar } from '@/lib/avisos';
import { construir, desplazarAnclas, fusionar } from '@/lib/bloques';
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
  recortar,
  tieneMarcasViejas,
  tieneTodo,
  VINETA,
  type Cambio,
  type Marca,
  type MarcaTipo,
} from '@/lib/format';
import { detectHints } from '@/lib/hints';
import { elegirImagen, subirImagen, type Origen } from '@/lib/images';
import { useAbrir } from '@/lib/navigate';
import { copiar, puedeCopiar, puedeUsarImagenes } from '@/lib/native';
import { useNotes } from '@/lib/notes-store';
import { useProjects } from '@/lib/projects-store';
import { estadoDeEntrega } from '@/lib/schedule';

const CUERPO = 17;
const ALTO_IMAGEN = 420;

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
  const { width } = useWindowDimensions();
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
  const campos = useRef(new Map<string, TextInput | null>());
  const cuerpoActual = useRef(inicial.current.texto);
  const saliendo = useRef(false);

  const [titulo, setTitulo] = useState(note?.title ?? '');
  const [cuerpo, setCuerpo] = useState(inicial.current.texto);
  const [marcas, setMarcas] = useState<Marca[]>(inicial.current.marcas);
  const [imagenes, setImagenes] = useState<Imagen[]>(note?.media ?? []);
  const [trazos, setTrazos] = useState<NoteDrawing[]>(note?.drawings ?? []);
  const [seleccion, setSeleccion] = useState<Seleccion>({ start: 0, end: 0 });
  const [activa, setActiva] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState<Partial<Record<MarcaTipo, boolean>>>({});
  const [forzada, setForzada] = useState<{ clave: string; seleccion: Seleccion } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [preguntando, setPreguntando] = useState(false);

  const [accent, muted, border, danger, warning, foreground] = useThemeColor([
    'accent',
    'muted',
    'border',
    'danger',
    'warning',
    'foreground',
  ]);

  const desplazarTodo = useCallback((cambio: Cambio, nuevoCuerpo: string) => {
    cuerpoActual.current = nuevoCuerpo;

    setMarcas((actuales) => desplazar(actuales, cambio));
    setImagenes((actuales) => desplazarAnclas(actuales, cambio));
    setTrazos((actuales) => desplazarAnclas(actuales, cambio));
    setCuerpo(nuevoCuerpo);
  }, []);

  const dictar = useCallback(
    (texto: string) => {
      const actual = cuerpoActual.current;
      const siguiente = actual.trim() ? `${actual.trimEnd()} ${texto}` : texto;

      desplazarTodo(diferencia(actual, siguiente), siguiente);
    },
    [desplazarTodo]
  );

  const { toast } = useToast();
  const avisar = useAvisar();
  const dictado = useDictado(dictar);
  const conAdjuntos = useMemo(() => puedeUsarImagenes(), []);
  const conCopia = useMemo(() => puedeCopiar(), []);

  const pistas = useMemo(() => detectHints(cuerpo), [cuerpo]);
  const bloques = useMemo(() => construir(cuerpo, imagenes, trazos), [cuerpo, imagenes, trazos]);
  const ultima = bloques[bloques.length - 1];

  const cambiado =
    cuerpo.trim() !== original.current.body.trim() ||
    titulo.trim() !== original.current.title.trim();
  const entrega = estadoDeEntrega(note?.dueAt ?? null);
  const proyecto = buscarProyecto(note?.projectId);
  const ancho = width - 44;

  const activo = useMemo(() => {
    const texto = bloques.filter((bloque) => bloque.tipo === 'texto');

    return texto.find((bloque) => bloque.clave === activa) ?? texto[texto.length - 1];
  }, [bloques, activa]);

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
    cuerpoActual.current = cuerpo;
  }, [cuerpo]);

  useEffect(() => {
    if (dictado.problema) avisar(dictado.problema);
  }, [avisar, dictado.problema]);

  useEffect(() => {
    if (!note || cargado.current) return;

    const contenido = contenidoInicial(note);

    setTitulo(note.title ?? '');
    setCuerpo(contenido.texto);
    setMarcas(contenido.marcas);
    original.current = { title: note.title ?? '', body: contenido.texto };
    cargado.current = true;
  }, [note]);

  useEffect(() => {
    if (!note) return;

    setImagenes((locales) => fusionar(locales, note.media, (imagen) => imagen.name));
  }, [note]);

  useEffect(() => {
    if (!note) return;

    setTrazos((locales) => fusionar(locales, note.drawings, (trazo) => trazo.id));
  }, [note]);

  const dondeVaElBloque = () =>
    activa ? Math.min(cuerpo.length, seleccion.start) : cuerpo.length;

  const cambiarTexto = (clave: string, desde: number, anterior: string, texto: string) => {
    const continuado = continuarVineta(anterior, texto);
    const definitivo = continuado ?? texto;
    const local = diferencia(anterior, definitivo);
    const cambio = { ...local, desde: desde + local.desde };

    setMarcas((actuales) => {
      let siguientes = desplazar(actuales, cambio);

      if (cambio.insertados > 0) {
        const inicio = cambio.desde;
        const fin = inicio + cambio.insertados;

        for (const tipo of ESCRIBIBLES) {
          const querido = pendientes[tipo];

          if (querido === true) {
            siguientes = normalizar([...siguientes, { tipo, desde: inicio, hasta: fin }]);
          } else if (querido === false) {
            siguientes = quitar(siguientes, tipo, inicio, fin);
          }
        }
      }

      return siguientes;
    });

    setImagenes((actuales) => desplazarAnclas(actuales, cambio));
    setTrazos((actuales) => desplazarAnclas(actuales, cambio));

    escribiendo.current = true;
    setCuerpo(cuerpo.slice(0, desde) + definitivo + cuerpo.slice(desde + anterior.length));

    if (continuado) {
      setForzada({
        clave,
        seleccion: { start: continuado.length, end: continuado.length },
      });
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

    desplazarTodo(diferencia(cuerpo, texto), texto);

    const cursor = yaEsta
      ? Math.max(desde, seleccion.start - VINETA.length)
      : seleccion.start + VINETA.length;

    if (activo) {
      setForzada({
        clave: activo.clave,
        seleccion: { start: cursor - activo.desde, end: cursor - activo.desde },
      });
    }
  };

  const guardar = useCallback(
    async (extra?: { media?: Imagen[]; drawings?: NoteDrawing[]; aunqueVacia?: boolean }) => {
      const limpioCuerpo = cuerpo.trim();
      const limpioTitulo = titulo.trim();
      const media = extra?.media ?? imagenes;
      const drawings = extra?.drawings ?? trazos;

      const vacia =
        !limpioCuerpo && !limpioTitulo && media.length === 0 && drawings.length === 0;

      if (vacia && !extra?.aunqueVacia) return null;

      setGuardando(true);

      try {
        const patch = {
          title: limpioTitulo || null,
          body: cuerpo,
          format: marcas,
          media,
          drawings,
        };

        const guardada = note ? await edit(note.id, patch) : await create(patch);

        if (!note) {
          cargado.current = true;
          setCreada(guardada);
          router.setParams({ id: guardada.id });
        }

        original.current = { title: limpioTitulo, body: cuerpo };

        return guardada;
      } catch (error) {
        avisar(error instanceof ApiError ? error.message : 'No se pudo guardar el cambio');
        return null;
      } finally {
        setGuardando(false);
      }
    },
    [avisar, create, cuerpo, edit, imagenes, marcas, note, router, titulo, trazos]
  );

  const borrar = async () => {
    setPreguntando(false);

    if (!note) {
      router.back();
      return;
    }

    saliendo.current = true;

    try {
      await remove(note.id);
      router.back();
    } catch {
      saliendo.current = false;
      avisar('No se pudo borrar la nota');
    }
  };

  const salir = async () => {
    const sinNada =
      !cuerpo.trim() && !titulo.trim() && imagenes.length === 0 && trazos.length === 0;

    if (creada && sinNada) {
      saliendo.current = true;
      await remove(creada.id).catch(() => {});
    } else {
      await guardar();
    }

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

    try {
      const subida = await subirImagen(asset, session.accessToken);
      const siguientes = [...imagenes, { ...subida, at: dondeVaElBloque() }];

      setImagenes(siguientes);
      await guardar({ media: siguientes, aunqueVacia: true });
    } catch (error) {
      avisar(error instanceof Error ? error.message : 'No se pudo subir la imagen');
    } finally {
      setSubiendo(false);
    }
  };

  const firmar = async () => {
    const destino = note ?? (await guardar({ aunqueVacia: true }));

    if (!destino) return;

    Keyboard.dismiss();
    abrir(`/firma?id=${destino.id}&at=${dondeVaElBloque()}`);
  };

  const abrirBloque = async (href: Href) => {
    await guardar();
    Keyboard.dismiss();
    abrir(href);
  };

  if (!note && id && !saliendo.current) {
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
            onBlur={() => guardar()}
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
          onPress={() => campos.current.get(ultima.clave)?.focus()}
          accessible={false}
          className="mt-5"
          style={{ minHeight: 340 }}
        >
          {bloques.map((bloque) => {
            if (bloque.tipo === 'imagen') {
              return (
                <PressableFeedback
                  key={bloque.clave}
                  onPress={() =>
                    abrirBloque(`/imagen?id=${note?.id ?? ''}&name=${bloque.imagen.name}`)
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Abrir la imagen"
                  style={{ marginVertical: 12, borderRadius: 20 }}
                >
                  <NoteImage
                    imagen={bloque.imagen}
                    width={ancho}
                    height={altoDe(bloque.imagen, ancho)}
                    radio={20}
                  />
                </PressableFeedback>
              );
            }

            if (bloque.tipo === 'trazo') {
              return (
                <PressableFeedback
                  key={bloque.clave}
                  onPress={() =>
                    abrirBloque(`/firma?id=${note?.id ?? ''}&trazo=${bloque.trazo.id}`)
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Abrir la firma"
                  style={{ marginVertical: 8, borderRadius: 20 }}
                >
                  <Firma trazo={bloque.trazo} ancho={ancho} />
                </PressableFeedback>
              );
            }

            const ultimo = bloque.clave === ultima.clave;

            return (
              <TextInput
                key={bloque.clave}
                ref={(instancia) => {
                  campos.current.set(bloque.clave, instancia);
                }}
                onChangeText={(texto) =>
                  cambiarTexto(bloque.clave, bloque.desde, bloque.texto, texto)
                }
                onFocus={() => setActiva(bloque.clave)}
                onBlur={() => guardar()}
                selection={
                  forzada?.clave === bloque.clave ? forzada.seleccion : undefined
                }
                onSelectionChange={(evento) => {
                  const { start, end } = evento.nativeEvent.selection;

                  setSeleccion({ start: bloque.desde + start, end: bloque.desde + end });
                  setActiva(bloque.clave);
                  if (forzada) setForzada(null);

                  if (escribiendo.current) {
                    escribiendo.current = false;
                    return;
                  }

                  setPendientes({});
                }}
                multiline
                autoFocus={!note && ultimo}
                maxLength={8000}
                placeholder={ultimo && bloques.length === 1 ? 'Escribe algo' : undefined}
                placeholderTextColor={muted}
                selectionColor={accent}
                cursorColor={accent}
                accessibilityLabel="Cuerpo de la nota"
                className="font-sans text-foreground"
                style={{
                  fontSize: CUERPO,
                  lineHeight: CUERPO * 1.65,
                  padding: 0,
                  minHeight: ultimo ? 220 : CUERPO * 1.65,
                  textAlignVertical: 'top',
                  textDecorationLine: note?.done ? 'line-through' : 'none',
                }}
              >
                <Formateado
                  texto={bloque.texto}
                  marcas={recortar(marcas, bloque.desde, bloque.desde + bloque.texto.length)}
                  size={CUERPO}
                />
              </TextInput>
            );
          })}

          {subiendo && (
            <View className="mt-4 flex-row items-center gap-2">
              <Spinner size="sm" />
              <Text className="font-medium text-muted" style={{ fontSize: 13 }}>
                Subiendo la imagen
              </Text>
            </View>
          )}

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
        onFirma={firmar}
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

function altoDe(imagen: Imagen, ancho: number) {
  if (!imagen.width || !imagen.height) return Math.round(ancho * 0.75);

  return Math.min(ALTO_IMAGEN, Math.round((ancho * imagen.height) / imagen.width));
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
