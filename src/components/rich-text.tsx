import { useThemeColor } from 'heroui-native/hooks';
import { Text, View } from 'react-native';

import { CheckIcon } from './icons';

const BOLD = /\*\*(.+?)\*\*/g;
const ITALIC = /_(.+?)_/g;

type Trozo = { texto: string; negrita?: boolean; cursiva?: boolean };

function partir(linea: string): Trozo[] {
  const trozos: Trozo[] = [];
  let resto = linea;

  while (resto.length > 0) {
    BOLD.lastIndex = 0;
    ITALIC.lastIndex = 0;

    const negrita = BOLD.exec(resto);
    const cursiva = ITALIC.exec(resto);
    const primero =
      negrita && cursiva ? (negrita.index <= cursiva.index ? negrita : cursiva) : negrita ?? cursiva;

    if (!primero) {
      trozos.push({ texto: resto });
      break;
    }

    if (primero.index > 0) {
      trozos.push({ texto: resto.slice(0, primero.index) });
    }

    trozos.push({
      texto: primero[1],
      negrita: primero === negrita,
      cursiva: primero === cursiva,
    });

    resto = resto.slice(primero.index + primero[0].length);
  }

  return trozos;
}

type RichTextProps = {
  value: string;
  size?: number;
  lineas?: number;
};

export function RichText({ value, size = 15, lineas }: RichTextProps) {
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  const todas = value.split('\n');
  const visibles = lineas ? todas.slice(0, lineas) : todas;

  return (
    <View className="gap-1">
      {visibles.map((linea, indice) => {
        const casilla = linea.match(/^- \[( |x)\] (.*)$/);
        const punto = !casilla && linea.startsWith('- ');
        const titulo = linea.startsWith('# ');

        const contenido = casilla
          ? casilla[2]
          : punto
            ? linea.slice(2)
            : titulo
              ? linea.slice(2)
              : linea;

        if (!contenido.trim() && !casilla) {
          return <View key={indice} style={{ height: size * 0.5 }} />;
        }

        return (
          <View key={indice} className="flex-row items-start gap-2">
            {casilla && (
              <View
                style={{
                  width: size * 0.95,
                  height: size * 0.95,
                  borderRadius: 5,
                  borderWidth: 1.5,
                  marginTop: size * 0.28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: casilla[1] === 'x' ? accent : muted,
                  backgroundColor: casilla[1] === 'x' ? accent : 'transparent',
                }}
              >
                {casilla[1] === 'x' && <CheckIcon color="#1d1913" size={size * 0.6} />}
              </View>
            )}

            {punto && (
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  marginTop: size * 0.72,
                  backgroundColor: muted,
                }}
              />
            )}

            <Text
              className={titulo ? 'flex-1 font-display text-foreground' : 'flex-1 font-sans text-foreground'}
              style={{
                fontSize: titulo ? size * 1.3 : size,
                lineHeight: titulo ? size * 1.7 : size * 1.5,
                letterSpacing: titulo ? -0.3 : 0,
              }}
            >
              {partir(contenido).map((trozo, posicion) => (
                <Text
                  key={posicion}
                  className={trozo.negrita ? 'font-semibold' : undefined}
                  style={trozo.cursiva ? { fontStyle: 'italic' } : undefined}
                >
                  {trozo.texto}
                </Text>
              ))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
