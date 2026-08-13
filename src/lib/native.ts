type ImagePickerModule = typeof import('expo-image-picker');
type FileSystemModule = typeof import('expo-file-system');
type SpeechModule = typeof import('expo-speech-recognition');

let picker: ImagePickerModule | null | undefined;
let files: FileSystemModule | null | undefined;
let speech: SpeechModule | null | undefined;

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
