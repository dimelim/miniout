import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'miniout.quotes.v1';

export const MAX_QUOTE_LENGTH = 140;

export type QuoteSource = 'miniout' | 'propias';

export type QuoteSettings = {
  source: QuoteSource;
  own: string[];
};

export const DEFAULT_QUOTES: QuoteSettings = { source: 'miniout', own: [] };

const QUOTES = [
  'Empieza por la parte que ya entiendes.',
  'Una página mala vale más que una página en blanco.',
  'Lo que anotas hoy es el favor que te haces mañana.',
  'Estudiar no es recordar, es volver a explicar.',
  'Diez minutos hoy pesan más que tres horas el domingo.',
  'Escribe la duda antes de que se te olvide que la tenías.',
  'Si no cabe en una frase, todavía no lo entiendes.',
  'El repaso corto gana al maratón de la noche anterior.',
  'Nadie llega listo, se llega empezado.',
  'Apunta lo que te costó, ahí está el examen.',
  'Terminar algo pequeño desatasca lo grande.',
  'Lo difícil primero, mientras la cabeza está fresca.',
  'Preguntar temprano ahorra semanas.',
  'El orden no es adorno, es memoria.',
  'Un problema resuelto enseña más que diez leídos.',
  'Deja la frase a medias y mañana sabrás por dónde seguir.',
  'Tu yo de la semana que viene lee lo que escribas hoy.',
  'La constancia se parece bastante a aparecer.',
  'Anota la fecha, el resto se acomoda solo.',
  'Cierra el día escribiendo qué quedó pendiente.',
  'Lo que no está escrito, se negocia con la memoria.',
  'Repasa como si tuvieras que enseñarlo.',
  'Avanzar despacio sigue siendo avanzar.',
  'El cuaderno no juzga, solo guarda.',
];

function dayOfYear(now: Date) {
  const start = new Date(now.getFullYear(), 0, 0).getTime();
  return Math.floor((now.getTime() - start) / 86_400_000);
}

export function quoteOfTheDay(settings: QuoteSettings = DEFAULT_QUOTES, now = new Date()) {
  const list = settings.source === 'propias' && settings.own.length > 0 ? settings.own : QUOTES;

  return list[dayOfYear(now) % list.length];
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
      source: parsed.source === 'propias' ? 'propias' : 'miniout',
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
