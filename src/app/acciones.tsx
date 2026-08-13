import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableFeedback } from 'heroui-native';
import { useThemeColor } from 'heroui-native/hooks';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  CheckIcon,
  CopyIcon,
  FolderIcon,
  PencilIcon,
  SemesterIcon,
  TrashIcon,
} from '@/components/icons';
import { copiar, puedeCopiar } from '@/lib/native';
import { useNotes } from '@/lib/notes-store';
import { useProjects } from '@/lib/projects-store';
import { estadoDeEntrega } from '@/lib/schedule';

export default function Acciones() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { find, toggle, remove } = useNotes();
  const { find: buscarProyecto } = useProjects();

  const [borrando, setBorrando] = useState(false);
  const [copiada, setCopiada] = useState(false);

  const [foreground, danger, surfaceSecondary] = useThemeColor([
    'foreground',
    'danger',
    'surface-secondary',
  ]);

  const note = find(id);
  const proyecto = buscarProyecto(note?.projectId);
  const entrega = estadoDeEntrega(note?.dueAt ?? null);

  if (!note) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-10">
        <Text className="text-center font-sans text-muted" style={{ fontSize: 15 }}>
          Esa nota ya no existe.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          numberOfLines={2}
          className="font-display text-foreground"
          style={{ fontSize: 22, lineHeight: 28, letterSpacing: -0.4 }}
        >
          {note.title ?? note.body.split('\n')[0]}
        </Text>

        <View className="mt-6 gap-2">
          <Accion
            etiqueta="Abrirla"
            detalle="Escribir, poner imágenes y dictar"
            icono={<PencilIcon color={foreground} size={17} />}
            fondo={surfaceSecondary}
            color={foreground}
            onPress={() => router.replace(`/nota?id=${note.id}`)}
          />

          <Accion
            etiqueta="Moverla de proyecto"
            detalle={proyecto ? `Ahora está en ${proyecto.name}` : 'Ahora no está en ninguno'}
            icono={<FolderIcon color={foreground} size={17} />}
            fondo={surfaceSecondary}
            color={foreground}
            onPress={() => router.replace(`/mover?id=${note.id}`)}
          />

          <Accion
            etiqueta="Programarla"
            detalle={entrega ? entrega.etiqueta : 'Sin fecha de entrega'}
            icono={<SemesterIcon color={foreground} size={17} />}
            fondo={surfaceSecondary}
            color={foreground}
            onPress={() => router.replace(`/programar?id=${note.id}`)}
          />

          {puedeCopiar() && (
            <Accion
              etiqueta="Copiarla"
              detalle={copiada ? 'Ya está en el portapapeles' : 'Se copia el título y el texto'}
              icono={<CopyIcon color={foreground} size={17} />}
              fondo={surfaceSecondary}
              color={foreground}
              onPress={async () => {
                const texto = note.title ? `${note.title}\n\n${note.body}` : note.body;
                setCopiada(await copiar(texto));
              }}
            />
          )}

          <Accion
            etiqueta={note.done ? 'Dejarla pendiente' : 'Marcarla hecha'}
            detalle={note.done ? 'Vuelve a la lista de lo que falta' : 'Se tacha en la lista'}
            icono={<CheckIcon color={foreground} size={16} />}
            fondo={surfaceSecondary}
            color={foreground}
            onPress={async () => {
              await toggle(note);
              router.back();
            }}
          />

          <Accion
            etiqueta="Borrarla"
            detalle="Se va de todos tus dispositivos"
            icono={<TrashIcon color={danger} size={17} />}
            fondo={surfaceSecondary}
            color={danger}
            onPress={() => setBorrando(true)}
          />
        </View>

        <Text className="mt-6 text-center font-sans text-muted" style={{ fontSize: 12 }}>
          En la lista también puedes deslizarla a la derecha para moverla.
        </Text>
      </ScrollView>

      <ConfirmDialog
        visible={borrando}
        titulo="Borrar esta nota"
        mensaje="Se va de todos tus dispositivos y no se puede deshacer."
        confirmar="Borrar la nota"
        onConfirm={async () => {
          setBorrando(false);
          await remove(note.id);
          router.back();
        }}
        onCancel={() => setBorrando(false)}
      />
    </View>
  );
}

function Accion({
  etiqueta,
  detalle,
  icono,
  fondo,
  color,
  onPress,
}: {
  etiqueta: string;
  detalle: string;
  icono: React.ReactNode;
  fondo: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <PressableFeedback
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      className="flex-row items-center gap-3 rounded-[20px] bg-surface p-3.5 shadow-surface"
    >
      <PressableFeedback.Highlight />
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fondo,
        }}
      >
        {icono}
      </View>

      <View className="flex-1">
        <Text className="font-medium" style={{ fontSize: 16, color }}>
          {etiqueta}
        </Text>
        <Text className="mt-0.5 font-sans text-muted" style={{ fontSize: 13 }}>
          {detalle}
        </Text>
      </View>
    </PressableFeedback>
  );
}
