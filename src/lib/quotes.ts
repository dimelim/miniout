import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'miniout.quotes.v2';

export const MAX_QUOTE_LENGTH = 140;

export type QuoteSource = 'miniout' | 'escritores' | 'propias' | 'todas';
export type QuoteRate = 'apertura' | 'dia' | 'semana';

export type Frase = { texto: string; autor?: string };

export type QuoteSettings = {
  source: QuoteSource;
  rate: QuoteRate;
  own: string[];
};

export const DEFAULT_QUOTES: QuoteSettings = { source: 'miniout', rate: 'dia', own: [] };

export const FUENTES: { id: QuoteSource; label: string }[] = [
  { id: 'miniout', label: 'De Miniout' },
  { id: 'escritores', label: 'De escritores' },
  { id: 'propias', label: 'Las tuyas' },
  { id: 'todas', label: 'Todas' },
];

export const RITMOS: { id: QuoteRate; label: string }[] = [
  { id: 'apertura', label: 'Cada vez que abro' },
  { id: 'dia', label: 'Una al día' },
  { id: 'semana', label: 'Una a la semana' },
];

export const DE_MINIOUT: Frase[] = [
  { texto: 'Empieza por la parte que ya entiendes.' },
  { texto: 'Una página mala vale más que una página en blanco.' },
  { texto: 'Lo que anotas hoy es el favor que te haces mañana.' },
  { texto: 'Estudiar no es recordar, es volver a explicar.' },
  { texto: 'Diez minutos hoy pesan más que tres horas el domingo.' },
  { texto: 'Escribe la duda antes de que se te olvide que la tenías.' },
  { texto: 'Si no cabe en una frase, todavía no lo entiendes.' },
  { texto: 'El repaso corto gana al maratón de la noche anterior.' },
  { texto: 'Nadie llega listo, se llega empezado.' },
  { texto: 'Apunta lo que te costó, ahí está el examen.' },
  { texto: 'Terminar algo pequeño desatasca lo grande.' },
  { texto: 'Lo difícil primero, mientras la cabeza está fresca.' },
  { texto: 'Preguntar temprano ahorra semanas.' },
  { texto: 'El orden no es adorno, es memoria.' },
  { texto: 'Un problema resuelto enseña más que diez leídos.' },
  { texto: 'Deja la frase a medias y mañana sabrás por dónde seguir.' },
  { texto: 'Tu yo de la semana que viene lee lo que escribas hoy.' },
  { texto: 'La constancia se parece bastante a aparecer.' },
  { texto: 'Anota la fecha, el resto se acomoda solo.' },
  { texto: 'Cierra el día escribiendo qué quedó pendiente.' },
  { texto: 'Lo que no está escrito, se negocia con la memoria.' },
  { texto: 'Repasa como si tuvieras que enseñarlo.' },
  { texto: 'Avanzar despacio sigue siendo avanzar.' },
  { texto: 'El cuaderno no juzga, solo guarda.' },
];

export const DE_ESCRITORES: Frase[] = [
  { texto: 'No hay libro tan malo que no tenga algo bueno.', autor: 'Miguel de Cervantes' },
  { texto: 'Caminante, no hay camino, se hace camino al andar.', autor: 'Antonio Machado' },
  { texto: 'Yo no estudio para saber más, sino para ignorar menos.', autor: 'Sor Juana Inés de la Cruz' },
  { texto: 'El papel tiene más paciencia que la gente.', autor: 'Ana Frank' },
  { texto: 'La vida no es la que uno vivió, sino la que uno recuerda.', autor: 'Gabriel García Márquez' },
  {
    texto: 'A mí me enorgullecen las páginas que he leído.',
    autor: 'Jorge Luis Borges',
  },
  {
    texto: 'No nos atrevemos a muchas cosas porque son difíciles.',
    autor: 'Séneca',
  },
  {
    texto: 'Una mujer necesita una habitación propia para poder escribir.',
    autor: 'Virginia Woolf',
  },
];

function dayOfYear(now: Date) {
  const start = new Date(now.getFullYear(), 0, 0).getTime();
  return Math.floor((now.getTime() - start) / 86_400_000);
}

export function listaDeFrases(settings: QuoteSettings = DEFAULT_QUOTES): Frase[] {
  const propias = settings.own.map((texto) => ({ texto }));

  if (settings.source === 'propias') return propias.length > 0 ? propias : DE_MINIOUT;
  if (settings.source === 'escritores') return DE_ESCRITORES;
  if (settings.source === 'todas') return [...DE_MINIOUT, ...DE_ESCRITORES, ...propias];

  return DE_MINIOUT;
}

export function quoteOfTheDay(settings: QuoteSettings = DEFAULT_QUOTES, now = new Date()) {
  const lista = listaDeFrases(settings);
  const dia = dayOfYear(now);

  if (settings.rate === 'semana') {
    return lista[Math.floor(dia / 7) % lista.length];
  }

  if (settings.rate === 'apertura') {
    return lista[Math.floor(now.getTime() / 1000) % lista.length];
  }

  return lista[dia % lista.length];
}

export function quoteError(value: string): string | null {
  const clean = value.trim();

  if (!clean) return 'Escribe una frase';
  if (clean.length > MAX_QUOTE_LENGTH) return 'Esa frase es demasiado larga';

  return null;
}

export async function readQuoteSettings(): Promise<QuoteSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_QUOTES;

    const parsed = JSON.parse(raw) as Partial<QuoteSettings>;

    return {
      source: FUENTES.some((fuente) => fuente.id === parsed.source)
        ? (parsed.source as QuoteSource)
        : DEFAULT_QUOTES.source,
      rate: RITMOS.some((ritmo) => ritmo.id === parsed.rate)
        ? (parsed.rate as QuoteRate)
        : DEFAULT_QUOTES.rate,
      own: Array.isArray(parsed.own) ? parsed.own.filter((item) => typeof item === 'string') : [],
    };
  } catch {
    return DEFAULT_QUOTES;
  }
}

export async function saveQuoteSettings(settings: QuoteSettings) {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  return settings;
}
