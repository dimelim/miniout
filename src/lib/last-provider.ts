import AsyncStorage from '@react-native-async-storage/async-storage';

export type SignInMethod = 'google' | 'discord' | 'correo';

const KEY = 'miniout.ultimo-acceso.v1';

export async function readLastMethod(): Promise<SignInMethod | null> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'google' || value === 'discord' || value === 'correo' ? value : null;
  } catch {
    return null;
  }
}

export async function rememberMethod(method: SignInMethod) {
  try {
    await AsyncStorage.setItem(KEY, method);
  } catch {}
}
