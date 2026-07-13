# Getting Started

## Requirements

- Windows PowerShell
- Android device with USB debugging enabled, or an Android emulator
- Portable Android build tools in the sibling `android-build-tools` directory

The project does not require Android Studio for the current manual build flow.

## Open The Project

Use this directory as the project root:

```text
C:\Users\yuanzhen02\Documents\Star Orchard Android
```

Key files:

- `README.md`: short build summary
- `build-apk.ps1`: manual debug APK build
- `app/src/main/assets/game/game.js`: game runtime
- `app/src/main/AndroidManifest.xml`: Android package metadata

## Run On A Device

Build the APK:

```powershell
.\build-apk.ps1
```

Install it:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe install --no-streaming -r .\star-orchard-debug.apk
```

Launch it:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe shell am start --user 0 -n com.starorchard.platform/.MainActivity
```

## Verify Installed Version

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe shell dumpsys package com.starorchard.platform | Select-String -Pattern "versionCode|versionName|installed=true"
```

Expected current version:

```text
versionCode=45
versionName=1.0.44
```

