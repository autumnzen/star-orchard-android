# Star Orchard Android 1.0.44

Final Android WebView build for Star Orchard.

## Build Metadata

- Package: `com.starorchard.platform`
- Version name: `1.0.44`
- Version code: `45`
- Minimum SDK: `23`
- Target SDK: `34`
- APK: `star-orchard-debug.apk`
- SHA-256: `30B10EADB8086F70D5B237A08721DDE1ACE57C26F7EA7AB3FE5FAB11F460BD8E`

## Highlights

- Offline bundled Android WebView game runtime.
- Full-screen immersive landscape play.
- 21-stage platform progression.
- Save/load unlock from Level 6.
- Level select unlock from Level 10.
- Randomized treasure rewards.
- Power spring duration: 13 seconds.
- Rage potion duration: 10 seconds.
- Weather, illumination, natural rhythm, moon phase, and multi-language systems.
- Mobile touch controls with combo-input handling.
- Runtime QA checkpoints for layout, input, localization, progression, effects, controls, and levels.

## Install

Download `star-orchard-debug.apk`, then install on Android after allowing installation from the chosen source.

For ADB install:

```powershell
adb install --no-streaming -r .\star-orchard-debug.apk
```

## GitHub Package

The APK is also published as a GHCR package:

```text
ghcr.io/autumnzen/star-orchard-android:1.0.44
ghcr.io/autumnzen/star-orchard-android:latest
```
