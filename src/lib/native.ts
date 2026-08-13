type ImagePickerModule = typeof import('expo-image-picker');
type FileSystemModule = typeof import('expo-file-system');
type SpeechModule = typeof import('expo-speech-recognition');
type ClipboardModule = typeof import('expo-clipboard');

let picker: ImagePickerModule | null | undefined;
let files: FileSystemModule | null | undefined;
let speech: SpeechModule | null | undefined;
let clip: ClipboardModule | null | undefined;

export function imagePicker() {
  if (picker === undefined) {
    try {
      picker = require('expo-image-picker') as ImagePickerModule;
    } catch {
      picker = null;
    }
  }

  return picker;
}

export function fileSystem() {
  if (files === undefined) {
    try {
      files = require('expo-file-system') as FileSystemModule;
    } catch {
      files = null;
    }
  }

  return files;
}

export function speechRecognition() {
  if (speech === undefined) {
    try {
      speech = require('expo-speech-recognition') as SpeechModule;
    } catch {
      speech = null;
    }
  }

  return speech;
}

export function clipboard() {
  if (clip === undefined) {
    try {
      clip = require('expo-clipboard') as ClipboardModule;
    } catch {
      clip = null;
    }
  }

  return clip;
}

export async function copiar(texto: string) {
  const modulo = clipboard();

  if (!modulo) return false;

  try {
    await modulo.setStringAsync(texto);
    return true;
  } catch {
    return false;
  }
}

export function puedeCopiar() {
  return clipboard() !== null;
}

export function puedeUsarImagenes() {
  return imagePicker() !== null && fileSystem() !== null;
}

export function puedeDictar() {
  const modulo = speechRecognition();

  if (!modulo) return false;

  try {
    return modulo.ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}
