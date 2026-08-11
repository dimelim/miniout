<p align="center">
  <img src="assets/brand/banner.png" alt="Miniout" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img alt="Licencia MIT" src="https://img.shields.io/badge/licencia-MIT-e0891c?style=flat-square"></a>
  <img alt="Expo SDK 57" src="https://img.shields.io/badge/expo-SDK%2057-1d1913?style=flat-square">
  <img alt="React Native 0.86" src="https://img.shields.io/badge/react%20native-0.86-1d1913?style=flat-square">
  <a href="README.md"><img alt="Read me in English" src="https://img.shields.io/badge/read%20me%20in-english-6c665d?style=flat-square"></a>
</p>

# Miniout

Apuntes y tareas de universidad. La abres y el campo ya esta esperando.

## Por que

Toda app de notas te hace decidir algo antes de dejarte escribir. Que cuaderno,
que lista, que proyecto, que etiqueta. Esa decision llega en el peor momento
posible, en mitad de una clase y con la idea a punto de irse.

Miniout le da la vuelta. Primero escribes y archivas despues, si es que llegas a
archivar. Una nota y una tarea son lo mismo escrito igual, asi que lo que
mencione un dia pasa a tener fecha.

## Que hace

- El campo de captura es la pantalla de inicio. No hay boton para crear una nota
  ni para crear una tarea.
- Escribe "parcial de calculo el viernes" y Miniout te ofrece la materia y el
  dia como chips. Tu decides si se quedan.
- Lo que mencione un dia aparece en ese dia con su casilla y se marca vencido
  solo. Nunca rellenas un formulario de tarea.
- Las notas van primero al dispositivo, asi que nada bloquea la escritura y no
  se pierde nada sin conexion.
- Tres pantallas y no habra una cuarta. Captura, cuaderno y dia.

## Stack

Expo SDK 57 con expo-router, React Native 0.86 y React 19.
[heroui-native](https://github.com/heroui-inc/heroui-native) pone los
componentes bajo Apache-2.0, tematizados con los tokens propios de Miniout, y
[uniwind](https://uniwind.dev) trae las clases de Tailwind v4 a React Native.
Las notas persisten en local con AsyncStorage.

## Arrancar

```bash
npm install
npx expo start
```

Se abre con Expo Go en un dispositivo, o con `a` para el emulador de Android. No
hace falta el SDK de Android para desarrollar, porque las builds van por EAS.

## Scripts

```bash
npm test          # jest, cubre el parser que lee materias y fechas
npm run typecheck # tsc
npm run icons     # regenera los iconos de la app desde la marca
```

## Estructura

```
src/
  app/            rutas de expo-router, la bienvenida y las tres pantallas
  components/     la marca, la firma y las piezas de demo
  lib/            formato de fechas, deteccion de pistas y el store de notas
  global.css      los tokens de diseno que tematizan heroui-native
api/              el servicio que da cuentas y sincronizacion
```

## Diseno

El design system completo esta en `shielus.lat/design-system-miniout`. La
version corta es una escala neutra calida con un solo acento ambar que se
comporta como resaltador, Newsreader para titulos y Figtree para todo lo demas.
Los colores se editan en `src/global.css` y en ningun otro sitio.

Hay algo que conviene saber antes de tocar un color. El ambar base da 2.59:1
contra el papel claro, asi que nunca lleva texto en modo claro. Los links y el
texto pequeno usan `--color-accent-deep`, que mide 4.79:1.

## Contribuir

Los issues y pull requests son bienvenidos. Dos reglas propias de este repo.

- Sin comentarios en el codigo. Si una linea necesita explicacion, el arreglo es
  un mejor nombre.
- Nunca guion largo y nunca emojis, ni en codigo, ni en interfaz, ni en docs, ni
  en mensajes de commit.

## Licencia

MIT. Ver [LICENSE](LICENSE).
