# Star Orchard Android

Android WebView package for the Star Orchard platform game.

## Build

This project includes a lightweight PowerShell build script that uses the
portable Android toolchain in the sibling `android-build-tools` folder.

Build a debug APK from this folder:

```powershell
.\build-apk.ps1
```

The APK output will be:

```text
star-orchard-debug.apk
```

Install with adb when a device or emulator is connected:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe install -r .\star-orchard-debug.apk
```

## Runtime Notes

- The game runs offline from `app/src/main/assets/game/index.html`.
- The activity is full-screen immersive landscape.
- JavaScript, DOM storage, and file asset loading are enabled for smooth WebView play.
- On-screen touch controls are included for movement, jump, and dash on phones/tablets.
