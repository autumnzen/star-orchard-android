# Star Orchard Android Wiki

Star Orchard Android is a landscape Android WebView package for the Star Orchard platform game. The game runs fully offline from bundled HTML, CSS, and JavaScript assets.

## Current Release

- Android package: `com.starorchard.platform`
- Version code: `45`
- Version name: `1.0.44`
- Minimum SDK: `23`
- Target SDK: `34`
- Main APK artifact: `star-orchard-debug.apk`

## Wiki Index

- [Getting Started](Getting-Started.md)
- [Build and Install](Build-and-Install.md)
- [Gameplay and Progression](Gameplay-and-Progression.md)
- [Controls and Mobile Input](Controls-and-Mobile-Input.md)
- [Settings, Weather, and Localization](Settings-Weather-and-Localization.md)
- [Architecture](Architecture.md)
- [QA Checkpoints](QA-Checkpoints.md)
- [Troubleshooting](Troubleshooting.md)
- [Release Notes](Release-Notes.md)

## Repository Layout

```text
app/src/main/assets/game/       Browser game runtime assets
app/src/main/java/...           Android WebView activity
app/src/main/res/               Android resources and launcher icon
build-apk.ps1                   Manual APK build script
manual-build/                   Last manual build working directory
outputs/                        Visual QA screenshots
star-orchard-debug.apk          Current debug APK
```

## Operating Model

The Android shell is intentionally small. The game logic, UI, localization, weather system, level generation, save/load logic, and input handling are implemented in `app/src/main/assets/game/game.js`, with presentation in `styles.css` and DOM structure in `index.html`.

