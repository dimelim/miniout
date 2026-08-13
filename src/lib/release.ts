import Constants from 'expo-constants';

const ULTIMA = 'https://api.github.com/repos/dimelim/miniout/releases/latest';

export type VersionNueva = {
  version: string;
  nombre: string;
  apk: string | null;
  pagina: string;
};

function numeros(version: string) {
  return version
    .replace(/^v/, '')
    .split('-')[0]
    .split('.')
    .map((parte) => Number(parte) || 0);
}

export function esMasNueva(candidata: string, instalada: string) {
  const una = numeros(candidata);
  const otra = numeros(instalada);

  for (let indice = 0; indice < Math.max(una.length, otra.length); indice += 1) {
    const uno = una[indice] ?? 0;
    const otro = otra[indice] ?? 0;

    if (uno !== otro) return uno > otro;
  }

  return false;
}

export async function buscarVersionNueva(): Promise<VersionNueva | null> {
  const instalada = Constants.expoConfig?.version;

  if (!instalada) return null;

  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), 8000);

  try {
    const respuesta = await fetch(ULTIMA, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: control.signal,
    });

    if (!respuesta.ok) return null;

    const datos = (await respuesta.json()) as {
      tag_name?: string;
      name?: string;
      html_url?: string;
      assets?: { name: string; browser_download_url: string }[];
    };

    if (!datos.tag_name || !esMasNueva(datos.tag_name, instalada)) return null;

    const apk = datos.assets?.find((uno) => uno.name.endsWith('.apk'));

    return {
      version: datos.tag_name.replace(/^v/, ''),
      nombre: datos.name ?? datos.tag_name,
      apk: apk?.browser_download_url ?? null,
      pagina: datos.html_url ?? 'https://github.com/dimelim/miniout/releases',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(corte);
  }
}
