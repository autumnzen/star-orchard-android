# Build and Release

The Android version is defined in app/build.gradle and mirrored in AndroidManifest.xml. Increment versionCode and versionName together.

## Build

Run .\build-apk.ps1 from PowerShell. The output is star-orchard-debug.apk, using the sibling portable Android toolchain.

## Release verification

- Package is com.starorchard.platform; version metadata and signature verify.
- All web assets are packaged; ADB installation and offline launch succeed.
- No fatal exception or Web page not available message appears.
- Complete one level and test pause, restart, resume, Save/Load, and Level Select.
- Exercise every language and representative weather/illumination combinations.
- Confirm temporary effects restore physics, speed, collisions, and hero colors.

Never commit APKs, keystores, manual-build, Gradle output, local SDK configuration, logs, or temporary files.
