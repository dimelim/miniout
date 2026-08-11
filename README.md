# Miniout

A notes app for university students where capture is never more than zero taps
away. You open it and the field is already waiting.

[Español](README.es.md)

## Why

Every note app asks you to decide something before you can write. Which
notebook, which folder, which tag, which type of note. That decision happens at
the exact moment you are least able to make it: in the middle of a class, with
the thought about to leave.

Miniout inverts it. Writing comes first, and filing is optional and afterwards.

## What it does

- **Capture is always open.** There is no button to create a note. The field is
  the home screen.
- **Filing is a suggestion, never an action.** Type "parcial de calculo el
  viernes" and Miniout offers the subject and the day as chips. Accept them or
  ignore them: the note is saved either way.
- **Saving has no dialog.** Notes are written to the device first, so there is
  nothing to confirm and nothing to lose offline.
- **Three screens, and there will not be a fourth.** Capture, notebook, day.

## Stack

Expo SDK 57 with expo-router, React Native 0.86 and React 19.
[heroui-native](https://github.com/heroui-inc/heroui-native) (Apache-2.0) for
components, themed to Miniout's own tokens, and
[uniwind](https://uniwind.dev) for Tailwind v4 class names in React Native.
Notes persist locally through AsyncStorage.

## Getting started

```bash
npm install
npx expo start
```

Open it with Expo Go on a device, or press `a` for an Android emulator. No
Android SDK is required to develop: builds go through EAS.

## Project layout

```
src/
  app/            expo-router routes: index (welcome), captura, que-hace
  components/     the M mark and the ruled paper backdrop
  lib/            date formatting, hint detection, the notes store
  global.css      the design tokens, overriding heroui-native's
```

## Design

The full design system lives at `shielus.lat/design-system-miniout`. The short
version: warm neutral scale, a single amber accent that acts as a highlighter,
Fraunces for headings and Figtree for everything else. Colors are edited in
`src/global.css` and nowhere else.

Note that the base amber sits at 2.59:1 against the light canvas, so it never
carries text in light mode. Links and small text use `--color-accent-deep`
instead (4.79:1).

## Contributing

Issues and pull requests are welcome. Two rules specific to this repo:

- No comments in the code. If a line needs an explanation, the fix is a better
  name.
- No em dashes and no emojis, anywhere: code, UI, docs or commit messages.

## License

MIT. See [LICENSE](LICENSE).
