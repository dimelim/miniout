import { useCallback, useEffect, useRef, useState } from 'react';

import { puedeDictar, speechRecognition } from './native';

type Estado = 'apagado' | 'escuchando';

export function useDictado(alTexto: (texto: string) => void) {
  const [estado, setEstado] = useState<Estado>('apagado');
  const [problema, setProblema] = useState<string | null>(null);
  const [disponible, setDisponible] = useState(false);
  const escrito = useRef('');

  useEffect(() => {
    setDisponible(puedeDictar());
  }, []);

  useEffect(() => {
    const modulo = speechRecognition();
    if (!modulo) return;

    const { ExpoSpeechRecognitionModule } = modulo;

    const resultado = ExpoSpeechRecognitionModule.addListener('result', (evento) => {
      const texto = evento.results[0]?.transcript?.trim();
      if (!texto || !evento.isFinal) return;

      const nuevo = texto.slice(escrito.current.length).trim();
      escrito.current = texto;

      alTexto(nuevo || texto);
    });

    const fin = ExpoSpeechRecognitionModule.addListener('end', () => {
      escrito.current = '';
      setEstado('apagado');
    });

    const fallo = ExpoSpeechRecognitionModule.addListener('error', (evento) => {
      escrito.current = '';
      setEstado('apagado');
      setProblema(
        evento.error === 'no-speech' ? 'No te escuché nada' : 'El dictado se cortó'
      );
    });

    return () => {
      resultado.remove();
      fin.remove();
      fallo.remove();
    };
  }, [alTexto]);

  const parar = useCallback(() => {
    const modulo = speechRecognition();
    if (!modulo) return;

    modulo.ExpoSpeechRecognitionModule.stop();
    setEstado('apagado');
  }, []);

  const arrancar = useCallback(async () => {
    const modulo = speechRecognition();
    if (!modulo) return;

    setProblema(null);

    const permiso = await modulo.ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!permiso.granted) {
      setProblema('Miniout necesita el micrófono para escribir lo que dictas');
      return;
    }

    escrito.current = '';
    setEstado('escuchando');

    modulo.ExpoSpeechRecognitionModule.start({
      lang: 'es-ES',
      interimResults: false,
      continuous: true,
    });
  }, []);

  return {
    disponible,
    escuchando: estado === 'escuchando',
    problema,
    arrancar,
    parar,
  };
}
