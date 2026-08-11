export const MIN_PASSWORD_LENGTH = 10;
export const MAX_NAME_LENGTH = 80;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function emailError(email: string): string | null {
  const value = normalizeEmail(email);

  if (!value) return 'Escribe tu correo';
  if (value.length > 320) return 'Ese correo es demasiado largo';
  if (!EMAIL_PATTERN.test(value)) return 'Ese correo no parece válido';

  return null;
}

export function passwordError(password: string): string | null {
  if (!password) return 'Escribe una contraseña';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Necesita al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  if (password.length > 200) return 'Esa contraseña es demasiado larga';

  return null;
}

export function nameError(name: string): string | null {
  const value = name.trim();

  if (!value) return 'Escribe tu nombre';
  if (value.length > MAX_NAME_LENGTH) return 'Ese nombre es demasiado largo';

  return null;
}

export function passwordStrength(password: string) {
  const checks = [
    password.length >= MIN_PASSWORD_LENGTH,
    password.length >= 14,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^\w\s]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  if (score <= 2) return { score, label: 'débil' as const };
  if (score <= 4) return { score, label: 'aceptable' as const };
  return { score, label: 'fuerte' as const };
}
