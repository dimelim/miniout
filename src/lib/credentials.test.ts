import {
  emailError,
  nameError,
  normalizeEmail,
  passwordError,
  passwordStrength,
} from './credentials';

describe('normalizeEmail', () => {
  it('quita espacios y baja a minusculas', () => {
    expect(normalizeEmail('  Diego@Correo.COM ')).toBe('diego@correo.com');
  });
});

describe('emailError', () => {
  it('pide el correo cuando esta vacio', () => {
    expect(emailError('')).toBe('Escribe tu correo');
    expect(emailError('   ')).toBe('Escribe tu correo');
  });

  it('rechaza lo que no parece un correo', () => {
    expect(emailError('diego')).not.toBeNull();
    expect(emailError('diego@')).not.toBeNull();
    expect(emailError('diego@correo')).not.toBeNull();
    expect(emailError('diego correo@x.com')).not.toBeNull();
  });

  it('acepta un correo normal', () => {
    expect(emailError('diego@correo.com')).toBeNull();
    expect(emailError('Diego.Sierra+uni@correo.co')).toBeNull();
  });

  it('rechaza un correo absurdamente largo', () => {
    expect(emailError(`${'a'.repeat(320)}@x.com`)).not.toBeNull();
  });
});

describe('passwordError', () => {
  it('pide una contraseña cuando está vacía', () => {
    expect(passwordError('')).toBe('Escribe una contraseña');
  });

  it('exige el mínimo', () => {
    expect(passwordError('corta')).toBe('Necesita al menos 10 caracteres');
    expect(passwordError('123456789')).not.toBeNull();
  });

  it('acepta desde diez caracteres', () => {
    expect(passwordError('1234567890')).toBeNull();
  });

  it('rechaza una de doscientos y pico', () => {
    expect(passwordError('a'.repeat(201))).not.toBeNull();
  });
});

describe('nameError', () => {
  it('pide el nombre cuando esta vacio', () => {
    expect(nameError('  ')).toBe('Escribe tu nombre');
  });

  it('acepta un nombre normal', () => {
    expect(nameError('Diego')).toBeNull();
  });
});

describe('passwordStrength', () => {
  it('marca debil lo corto', () => {
    expect(passwordStrength('abc').label).toBe('débil');
  });

  it('sube a aceptable con longitud y variedad', () => {
    expect(passwordStrength('Contrasena1').label).toBe('aceptable');
  });

  it('llega a fuerte con longitud, mayúsculas, número y símbolo', () => {
    expect(passwordStrength('Contrasena1Larga!').label).toBe('fuerte');
  });
});
