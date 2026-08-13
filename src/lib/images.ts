import type { ImagePickerAsset, ImagePickerOptions } from 'expo-image-picker';

import { uploadUrl, type NoteImage } from './api';
import { fileSystem, imagePicker } from './native';

export type Origen = 'galeria' | 'camara';

const EXTENSIONES = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

function extensionDe(asset: ImagePickerAsset) {
  const desdeNombre = asset.fileName?.split('.').pop()?.toLowerCase();
  if (desdeNombre && EXTENSIONES.includes(desdeNombre)) return desdeNombre;

  const desdeUri = asset.uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (desdeUri && EXTENSIONES.includes(desdeUri)) return desdeUri;

  return 'jpg';
}

export async function elegirImagen(origen: Origen) {
  const picker = imagePicker();
  if (!picker) return null;

  const permiso =
    origen === 'camara'
      ? await picker.requestCameraPermissionsAsync()
      : await picker.requestMediaLibraryPermissionsAsync();

  if (!permiso.granted) return null;

  const opciones: ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7, exif: false };

  const resultado =
    origen === 'camara'
      ? await picker.launchCameraAsync(opciones)
      : await picker.launchImageLibraryAsync(opciones);

  if (resultado.canceled || !resultado.assets?.length) return null;

  return resultado.assets[0];
}

export async function subirImagen(
  asset: ImagePickerAsset,
  accessToken: string
): Promise<NoteImage> {
  const files = fileSystem();
  if (!files) throw new Error('Este Miniout no puede subir imágenes todavía');

  const archivo = new files.File(asset.uri);

  const respuesta = await archivo.upload(uploadUrl(extensionDe(asset)), {
    httpMethod: 'POST',
    uploadType: files.UploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    },
  });

  if (respuesta.status >= 300) {
    throw new Error('No se pudo subir la imagen');
  }

  const { name } = JSON.parse(respuesta.body) as { name: string };

  return { name, width: asset.width, height: asset.height };
}
