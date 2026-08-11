# Miniout

App de notas para universidad donde escribir nunca esta a mas de cero toques.
La abres y el campo ya esta esperando.

[English](README.md)

## Por que

Toda app de notas te hace decidir algo antes de dejarte escribir. Que cuaderno,
que carpeta, que etiqueta, que tipo de nota. Esa decision cae justo en el
momento en que menos puedes tomarla: en mitad de una clase, con la idea a punto
de irse.

Miniout lo invierte. Primero se escribe, y archivar es opcional y despues.

## Que hace

- **La captura ya esta abierta.** No hay boton para crear una nota. El campo es
  la pantalla de inicio.
- **Clasificar es una propuesta, nunca una accion.** Escribe "parcial de calculo
  el viernes" y Miniout te ofrece la materia y el dia como chips. Los aceptas o
  los ignoras: la nota se guarda igual.
- **Guardar no tiene dialogo.** Las notas van primero al dispositivo, asi que no
  hay nada que confirmar ni nada que perder sin conexion.
- **Tres pantallas, y no habra una cuarta.** Captura, cuaderno y dia.

## Stack

Expo SDK 57 con expo-router, React Native 0.86 y React 19.
[heroui-native](https://github.com/heroui-inc/heroui-native) (Apache-2.0) para
los componentes, tematizado con los tokens propios de Miniout, y
[uniwind](https://uniwind.dev) para las clases de Tailwind v4 en React Native.
Las notas persisten en local con AsyncStorage.

## Arrancar

```bash
npm install
npx expo start
```

Se abre con Expo Go en un dispositivo, o con `a` para el emulador de Android.
No hace falta el SDK de Android para desarrollar: las builds van por EAS.

## Estructura

```
src/
  app/            rutas de expo-router: index (bienvenida), captura, que-hace
  components/     la marca M y el fondo de papel rayado
  lib/            formato de fechas, deteccion de pistas, el store de notas
  global.css      los tokens de diseno, sobreescribiendo los de heroui-native
```

## Diseno

El design system completo esta en `shielus.lat/design-system-miniout`. La
version corta: escala neutra calida, un solo acento ambar que hace de
resaltador, Fraunces para titulos y Figtree para todo lo demas. Los colores se
editan en `src/global.css` y en ningun otro sitio.

Ojo con una cosa: el ambar base da 2.59:1 contra el papel claro, asi que nunca
lleva texto en modo claro. Los links y el texto pequeno usan
`--color-accent-deep` (4.79:1).

## Contribuir

Los issues y pull requests son bienvenidos. Dos reglas propias de este repo:

- Sin comentarios en el codigo. Si una linea necesita explicacion, el arreglo es
  un mejor nombre.
- Nunca guion largo y nunca emojis, en ningun sitio: codigo, interfaz, docs ni
  mensajes de commit.

## Licencia

MIT. Ver [LICENSE](LICENSE).
