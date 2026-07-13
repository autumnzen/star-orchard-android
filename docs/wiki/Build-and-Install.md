# Build and Install

## Build Flow

`build-apk.ps1` performs a manual Android build:

1. Reads Android version fields from `app/build.gradle`.
2. Synchronizes `versionCode` and `versionName` into a staged manifest.
3. Compiles Android resources with `aapt2`.
4. Compiles Java sources with the bundled JDK.
5. Converts classes to DEX with `d8`.
6. Adds game assets from `app/src/main/assets`.
7. Aligns and signs the APK with the debug keystore.
8. Verifies APK signatures.

## Output

The signed debug APK is written to:

```text
star-orchard-debug.apk
```

Intermediate files are written to:

```text
manual-build/
```

## Known Build Warning

The bundled JDK may print an `AccessDeniedException` while closing `android.jar` after compilation. In observed runs, this appears after successful APK generation and signature verification. Treat the final process exit code and `apksigner verify` result as the decisive build status.

## Install Command

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe install --no-streaming -r .\star-orchard-debug.apk
```

If the device rejects install permissions, keep the device unlocked and approve any USB install or unknown app prompt, then rerun the command.

## Launch Command

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe shell am start --user 0 -n com.starorchard.platform/.MainActivity
```

## Runtime Verification

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe shell pidof com.starorchard.platform
..\android-build-tools\android-sdk\platform-tools\adb.exe logcat -d -t 500 | Select-String -Pattern "FATAL EXCEPTION|AndroidRuntime|crash|Stopping"
```

