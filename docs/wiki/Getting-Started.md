# Getting Started

## Requirements

- Windows PowerShell
- The portable Android toolchain in the sibling `android-build-tools` directory
- An Android device or emulator running Android 6.0 (API 23) or newer
- USB debugging enabled when installing to a physical device

Expected layout:

```text
files-mentioned-by-the-user-star-3/
|-- android-build-tools/
`-- star-orchard-android/
```

## Build the APK

Open PowerShell in `star-orchard-android` and run:

```powershell
.\build-apk.ps1
```

The script builds and signs the debug package:

```text
star-orchard-debug.apk
```

## Connect a phone

Enable Developer options and USB debugging on the phone, connect it by USB, unlock the screen, and accept the computer authorization prompt. Verify the connection:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe devices
```

The device state must be `device`, not `unauthorized` or blank.

## Install and launch

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe install -r .\star-orchard-debug.apk
..\android-build-tools\android-sdk\platform-tools\adb.exe shell monkey -p com.starorchard.platform -c android.intent.category.LAUNCHER 1
```

The application opens in immersive landscape mode and loads the bundled game from `file:///android_asset/game/index.html`.

## First-run check

1. Confirm the title screen and Start Game button are visible.
2. Open Settings and change the language.
3. Confirm the HUD, controls, settings, and pickup messages all change language.
4. Start Level 1 and test movement, jump, dash, pause, and restart.
5. Background the app and return; the WebView should resume without a blank page.
