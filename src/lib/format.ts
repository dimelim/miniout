export type MarcaTipo = 'negrita' | 'cursiva' | 'subrayado' | 'titulo';

export type Marca = { tipo: MarcaTipo; desde: number; hasta: number };

export type Trozo = { texto: string; tipos: MarcaTipo[] };

export type Cambio = { desde: number; borrados: number; insertados: number };

export const VINETA = '• ';

const TIPOS: MarcaTipo[] = ['negrita', 'cursiva', 'subrayado', 'titulo'];

export function normalizar(marcas: Marca[]): Marca[] {
  const salida: Marca[] = [];

  for (const tipo of TIPOS) {
    const suyas = marcas
      .filter((marca) => marca.tipo === tipo && marca.hasta > marca.desde)
      .sort((una, otra) => una.desde - otra.desde);

    let actual: Marca | null = null;

    for (const marca of suyas) {
      if (actual && marca.desde <= actual.hasta) {
        actual.hasta = Math.max(actual.hasta, marca.hasta);
        continue;
      }

      actual = { ...marca };
      salida.push(actual);
    }
  }

  return salida;
}

export function tieneTodo(marcas: Marca[], tipo: MarcaTipo, desde: number, hasta: number) {
  if (hasta <= desde) return false;

  let cubierto = desde;

  for (const marca of marcas
    .filter((una) => una.tipo === tipo)
    .sort((una, otra) => una.desde - otra.desde)) {
    if (marca.hasta <= cubierto) continue;
    if (marca.desde > cubierto) return false;

    cubierto = marca.hasta;

    if (cubierto >= hasta) return true;
  }

  return cubierto >= hasta;
}

export function quitar(marcas: Marca[], tipo: MarcaTipo, desde: number, hasta: number) {
  const salida: Marca[] = [];

  for (const marca of marcas) {
    if (marca.tipo !== tipo || marca.hasta <= desde || marca.desde >= hasta) {
      salida.push(marca);
      continue;
    }

    if (marca.desde < desde) {
      salida.push({ tipo, desde: marca.desde, hasta: desde });
    }
    if (marca.hasta > hasta) {
      salida.push({ tipo, desde: hasta, hasta: marca.hasta });
    }
  }

  return normalizar(salida);
}

export function alternar(marcas: Marca[], tipo: MarcaTipo, desde: number, hasta: number) {
  if (hasta <= desde) return marcas;

  if (tieneTodo(marcas, tipo, desde, hasta)) {
    return quitar(marcas, tipo, desde, hasta);
  }

  return normalizar([...marcas, { tipo, desde, hasta }]);
}

export function limitesDeLinea(texto: string, posicion: number) {
  const desde = texto.lastIndexOf('\n', Math.max(0, posicion - 1)) + 1;
  const salto = texto.indexOf('\n', posicion);

  return { desde, hasta: salto === -1 ? texto.length : salto };
}

export function diferencia(viejo: string, nuevo: string): Cambio {
  let inicio = 0;
  const menor = Math.min(viejo.length, nuevo.length);

  while (inicio < menor && viejo[inicio] === nuevo[inicio]) inicio += 1;

  let cola = 0;

  while (
    cola < menor - inicio &&
    viejo[viejo.length - 1 - cola] === nuevo[nuevo.length - 1 - cola]
  ) {
    cola += 1;
  }

  return {
    desde: inicio,
    borrados: viejo.length - inicio - cola,
    insertados: nuevo.length - inicio - cola,
  };
}

export function moverPosicion(posicion: number, cambio: Cambio) {
  const hasta = cambio.desde + cambio.borrados;

  if (posicion <= cambio.desde) return posicion;
  if (posicion >= hasta) return posicion + cambio.insertados - cambio.borrados;

  return cambio.desde + Math.min(cambio.insertados, posicion - cambio.desde);
}

export function desplazar(marcas: Marca[], cambio: Cambio) {
  return normalizar(
    marcas.map((marca) => ({
      tipo: marca.tipo,
      desde: moverPosicion(marca.desde, cambio),
      hasta: moverPosicion(marca.hasta, cambio),
    }))
  );
}

export function recortar(marcas: Marca[], desde: number, hasta: number): Marca[] {
  return marcas
    .filter((marca) => marca.hasta > desde && marca.desde < hasta)
    .map((marca) => ({
      tipo: marca.tipo,
      desde: Math.max(desde, marca.desde) - desde,
      hasta: Math.min(hasta, marca.hasta) - desde,
    }));
}

export function trozos(texto: string, marcas: Marca[]): Trozo[] {
  if (!texto) return [];

  const validas = marcas.filter((marca) => marca.hasta > marca.desde);

  if (validas.length === 0) return [{ texto, tipos: [] }];

  const cortes = new Set<number>([0, texto.length]);

  for (const marca of validas) {
    if (marca.desde > 0 && marca.desde < texto.length) cortes.add(marca.desde);
    if (marca.hasta > 0 && marca.hasta < texto.length) cortes.add(marca.hasta);
  }

  const puntos = [...cortes].sort((uno, otro) => uno - otro);
  const salida: Trozo[] = [];

  for (let indice = 0; indice < puntos.length - 1; indice += 1) {
    const desde = puntos[indice];
    const hasta = puntos[indice + 1];

    salida.push({
      texto: texto.slice(desde, hasta),
      tipos: TIPOS.filter((tipo) =>
        validas.some(
          (marca) => marca.tipo === tipo && marca.desde <= desde && marca.hasta >= hasta
        )
      ),
    });
  }

  return salida;
}

const BOLD = /\*\*(.+?)\*\*/;
const ITALIC = /_(.+?)_/;

export function desdeMarkdown(original: string) {
  const lineas = original.split('\n');
  const marcas: Marca[] = [];
  const salida: string[] = [];

  let base = 0;

  for (const linea of lineas) {
    let texto = linea;
    let titulo = false;

    if (texto.startsWith('# ')) {
      texto = texto.slice(2);
      titulo = true;
    } else if (texto.startsWith('- [x] ') || texto.startsWith('- [ ] ')) {
      texto = `${VINETA}${texto.slice(6)}`;
    } else if (texto.startsWith('- ')) {
      texto = `${VINETA}${texto.slice(2)}`;
    }

    for (const [patron, tipo] of [
      [BOLD, 'negrita'],
      [ITALIC, 'cursiva'],
    ] as const) {
      let encontrado = texto.match(patron);

      while (encontrado?.index !== undefined) {
        const desde = encontrado.index;
        const contenido = encontrado[1];

        texto = texto.slice(0, desde) + contenido + texto.slice(desde + encontrado[0].length);
        marcas.push({ tipo, desde: base + desde, hasta: base + desde + contenido.length });

        encontrado = texto.slice(desde + contenido.length).match(patron);

        if (encontrado?.index !== undefined) {
          encontrado.index += desde + contenido.length;
        }
      }
    }

    if (titulo && texto.length > 0) {
      marcas.push({ tipo: 'titulo', desde: base, hasta: base + texto.length });
    }

    salida.push(texto);
    base += texto.length + 1;
  }

  return { texto: salida.join('\n'), marcas: normalizar(marcas) };
}

export function tieneMarcasViejas(texto: string) {
  return /\*\*.+?\*\*|_.+?_|^#\s|^- /m.test(texto);
}
