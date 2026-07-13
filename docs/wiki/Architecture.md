# Architecture

## Android Layer

The Android layer is minimal:

- `MainActivity.java` hosts a full-screen WebView.
- JavaScript and DOM storage are enabled.
- File access is configured for bundled local assets.
- The activity is landscape and handles configuration changes.

## Web Runtime

The game runtime is bundled under:

```text
app/src/main/assets/game/
```

Files:

- `index.html`: DOM structure, HUD, overlay, settings modal, touch controls
- `styles.css`: visual system, layout, responsive mobile UI
- `game.js`: simulation, rendering, input, levels, localization, settings, saves

## Game Loop

The JavaScript runtime owns:

- Canvas rendering
- Entity updates
- Collision and platform movement
- Enemy behavior
- Power-up timers
- Weather rendering
- HUD synchronization
- Settings and local storage

## Generated Build Artifacts

`manual-build/` contains the most recent manual build intermediates. These are useful for debugging the no-Gradle build path, but source-of-truth code remains in `app/src/main`.

## Version Source

`app/build.gradle` is the source of Android version fields. `build-apk.ps1` copies those values into the staged manifest during manual build.

