import { Text, type TextStyle } from 'react-native';

import { trozos, type Marca, type MarcaTipo } from '@/lib/format';

function claseDe(tipos: MarcaTipo[]) {
  if (tipos.includes('titulo')) return 'font-display';
  if (tipos.includes('negrita')) return 'font-semibold';

  return undefined;
}

function estiloDe(tipos: MarcaTipo[], size: number): TextStyle {
  const estilo: TextStyle = {};

  if (tipos.includes('cursiva')) estilo.fontStyle = 'italic';
  if (tipos.includes('subrayado')) estilo.textDecorationLine = 'underline';
  if (tipos.includes('titulo')) {
    estilo.fontSize = size * 1.25;
    estilo.letterSpacing = -0.3;
  }

  return estilo;
}

export function Formateado({
  texto,
  marcas,
  size,
}: {
  texto: string;
  marcas: Marca[];
  size: number;
}) {
  return (
    <>
      {trozos(texto, marcas).map((trozo, indice) => (
        <Text key={indice} className={claseDe(trozo.tipos)} style={estiloDe(trozo.tipos, size)}>
          {trozo.texto}
        </Text>
      ))}
    </>
  );
}
