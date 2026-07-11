# Star Orchard Android Wiki

Star Orchard is a 21-level side-scrolling platform game packaged as an offline Android application. The game runs from bundled HTML, CSS, and JavaScript inside a full-screen landscape WebView, so gameplay does not require a network connection.

Current Android release: **1.0.28** (`versionCode 29`).

## Wiki contents

- [Getting Started](Getting-Started.md): requirements, build, install, and first launch
- [Gameplay and Progression](Gameplay-and-Progression.md): controls, levels, saves, treasures, and power-ups
- [Settings and Localization](Settings-and-Localization.md): language, illumination, weather, and natural rhythm
- [Architecture](Architecture.md): Android wrapper, web game, persistence, and important files
- [Build and Release](Build-and-Release.md): reproducible APK workflow and release checklist
- [Troubleshooting](Troubleshooting.md): ADB, signing, WebView, and installation failures
- [Contributing](Contributing.md): development rules and verification checkpoints

## Project principles

- Offline-first Android gameplay
- Touch-friendly landscape controls
- No level should require a randomly awarded power-up to remain passable
- UI text and gameplay notifications must follow the selected language
- Temporary effects must restore all hero and enemy state when they expire
- Generated APKs, signing keys, and build caches must not be committed

## Repository

Source: <https://github.com/autumnzen/star-orchard-android>
