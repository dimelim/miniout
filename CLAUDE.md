@AGENTS.md

# Miniout

App de notas y productividad para universidad. Codigo abierto. React Native +
Expo, con `heroui-native` y `uniwind`.

## Reglas duras de este repo

- **Commits sin `Co-Authored-By`.** Ninguna linea de coautoria en el mensaje.
- **Codigo sin comentarios.** Si una linea necesita explicacion, el arreglo es
  un mejor nombre de variable o funcion, no un comentario. Esto pisa la regla
  global de "pocos comentarios y solo los necesarios": aqui son cero.
- **Nunca guion largo (em dash).** Dos puntos, coma o frase nueva.
- **Nunca emojis.** Ni en UI, ni en README, ni en strings, ni en commits.

## Producto

Tres pantallas y ninguna mas:

- **captura**: el campo esta siempre abierto. Abrir la app y escribir es la
  misma accion. Sin pantalla de bienvenida, sin elegir cuaderno antes.
- **cuaderno**: las notas agrupadas por materia.
- **dia**: las tareas de hoy.

Clasificar es opcional. El sistema propone materia y fecha a partir del texto y
las muestra como chip: nunca las aplica en silencio. Si el usuario no clasifica
nada, la app sigue sirviendo.

Guardar es automatico y sin dialogo. Nada bloquea la escritura.

## Material

El design system completo esta en `shielus.lat/design-system-miniout` (interno).
Resumen operativo:

- Tinta sobre papel: escala neutra calida (hue 75-85) y un solo ambar de acento
  que hace de resaltador. Sin segundo acento, sin degradados.
- Los tokens viven en `src/global.css` y sobreescriben los de `heroui-native`,
  que usa los mismos nombres. Para cambiar un color se edita ahi, nunca dentro
  de un componente.
- El ambar base (`--accent`) da 2.59:1 sobre el papel: **no puede llevar texto
  en modo claro**. Para links y texto claro va `--color-accent-deep`.
- Tipografia: Fraunces para titulos, Figtree para todo lo demas. Fraunces nunca
  en cuerpo, listas ni botones.
- Radios: chip 10, control 14, card 20, sheet 28.
- Motion: techo de 240ms, curva `cubic-bezier(0.32, 0.72, 0, 1)`, y se respeta
  reduced motion.

## Stack

- Expo SDK 57, expo-router, React Native 0.86, React 19.
- `heroui-native` (Apache-2.0) para los componentes. **Nunca `@heroui-pro/*`**:
  su licencia prohibe publicar el fuente y el repo dejaria de poder compilarse
  sin comprar licencia.
- `uniwind` para las clases de Tailwind v4 en React Native. No NativeWind.
- Build con EAS, porque esta maquina no tiene Android SDK.
