import { useMemo } from 'react';
import { Text } from 'react-native';

import { Formateado } from './formatted';

import { desdeMarkdown, tieneMarcasViejas, type Marca } from '@/lib/format';

type RichTextProps = {
  value: string;
  marcas?: Marca[];
  size?: number;
  lineas?: number;
};

export function RichText({ value, marcas, size = 15, lineas }: RichTextProps) {
  const contenido = useMemo(() => {
    if (marcas && marcas.length > 0) return { texto: value, marcas };
    if (tieneMarcasViejas(value)) return desdeMarkdown(value);

    return { texto: value, marcas: [] as Marca[] };
  }, [value, marcas]);

  return (
    <Text
      numberOfLines={lineas}
      className="font-sans text-foreground"
      style={{ fontSize: size, lineHeight: size * 1.5 }}
    >
      <Formateado texto={contenido.texto} marcas={contenido.marcas} size={size} />
    </Text>
  );
}
