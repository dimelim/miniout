import { useRouter } from 'expo-router';
import { Button, Separator } from 'heroui-native';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const POINTS = [
  {
    title: 'La captura ya esta abierta',
    body: 'No hay boton para crear una nota. Abres la app, el campo esta esperando y escribes.',
  },
  {
    title: 'Clasificar es opcional',
    body: 'Si escribes "parcial de calculo el viernes", Miniout te propone la materia y el dia como chip. Si no te sirve, lo quitas de un toque.',
  },
  {
    title: 'Se guarda solo',
    body: 'Sin dialogos y sin boton de confirmar. Si no hay internet, la nota ya esta en el telefono.',
  },
  {
    title: 'Tres pantallas',
    body: 'Captura, cuaderno y dia. No hay carpetas dentro de carpetas ni etiquetas de etiquetas.',
  },
];

export default function QueHace() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-7 pb-8 gap-6"
        style={{ paddingTop: insets.top + 28 }}
      >
        <Text
          className="font-display text-foreground"
          style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.5 }}
        >
          Que hace Miniout
        </Text>

        <View className="gap-5">
          {POINTS.map((point, index) => (
            <View key={point.title} className="gap-2">
              {index > 0 && <Separator className="mb-3" />}
              <Text className="font-semibold text-foreground" style={{ fontSize: 16 }}>
                {point.title}
              </Text>
              <Text
                className="font-sans text-muted"
                style={{ fontSize: 15, lineHeight: 24 }}
              >
                {point.body}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-7" style={{ paddingBottom: insets.bottom + 20 }}>
        <Button size="lg" onPress={() => router.replace('/captura')}>
          <Button.Label>Escribir algo</Button.Label>
        </Button>
      </View>
    </View>
  );
}
