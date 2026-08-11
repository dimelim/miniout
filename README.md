<p align="center">
  <img src="assets/brand/banner.png" alt="Miniout" width="100%">
</p>

<p align="center">
  <a href="LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/license-MIT-e0891c?style=flat-square"></a>
  <img alt="Expo SDK 57" src="https://img.shields.io/badge/expo-SDK%2057-1d1913?style=flat-square">
  <img alt="React Native 0.86" src="https://img.shields.io/badge/react%20native-0.86-1d1913?style=flat-square">
  <a href="README.es.md"><img alt="Leeme en espanol" src="https://img.shields.io/badge/l%C3%A9eme%20en-espa%C3%B1ol-6c665d?style=flat-square"></a>
</p>

# Miniout

Notes and tasks for university. You open it and the field is already waiting.

## Why

Every notes app makes you decide something before it lets you write. Which
notebook, which list, which project, which tag. That decision arrives at the
worst possible moment, in the middle of a class with the thought about to leave.

Miniout turns it around. You write first and file later, if you ever file at
all. A note and a task are the same thing typed the same way, so anything that
mentions a day becomes something due.

## What it does

- The capture field is the home screen. There is no button to create a note and
  none to create a task.
- Write "parcial de calculo el viernes" and Miniout offers the subject and the
  day as chips. You decide whether they stay.
- Anything that mentions a day shows up in that day with a checkbox and turns
  overdue on its own. You never fill in a task form.
- Notes are written to the device first, so nothing blocks writing and nothing
  is lost offline.
- Three screens and there will not be a fourth. Capture, notebook and day.

## Stack

Expo SDK 57 with expo-router, React Native 0.86 and React 19.
[heroui-native](https://github.com/heroui-inc/heroui-native) provides the
components under Apache-2.0, themed with Miniout's own tokens, and
[uniwind](https://uniwind.dev) brings Tailwind v4 class names to React Native.
Notes persist locally through AsyncStorage.

## Getting started

```bash
npm install
npx expo start
```

Open it with Expo Go on a device, or press `a` for an Android emulator. You do
not need the Android SDK to develop, since builds go through EAS.

## Scripts

```bash
npm test          # jest, covers the parser that reads subjects and dates
npm run typecheck # tsc
npm run icons     # rebuilds the app icons from the mark
```

## Project layout

```
src/
  app/            expo-router routes, the onboarding and the three screens
  components/     the mark, the signature and the demo pieces
  lib/            date formatting, hint detection and the notes store
  global.css      the design tokens that theme heroui-native
api/              the service that backs accounts and sync
```

## Design

The full design system lives at `shielus.lat/design-system-miniout`. The short
version is a warm neutral scale with a single amber accent that behaves like a
highlighter, Newsreader for headings and Figtree for everything else. Colors are
edited in `src/global.css` and nowhere else.

One thing worth knowing before you touch a color. The base amber sits at 2.59:1
against the light canvas, so it never carries text in light mode. Links and
small text use `--color-accent-deep` instead, which measures 4.79:1.

## Contributing

Issues and pull requests are welcome. Two rules specific to this repo.

- No comments in the code. If a line needs an explanation, the fix is a better
  name.
- No em dashes and no emojis anywhere, whether in code, interface, docs or
  commit messages.

## License

MIT. See [LICENSE](LICENSE).
