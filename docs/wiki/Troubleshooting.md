# Troubleshooting

## `adb.exe: no devices/emulators found`

Check:

- USB cable is connected.
- Developer options are enabled.
- USB debugging is enabled.
- The phone has accepted the RSA debugging prompt.

Run:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe devices
```

## Device Shows `unauthorized`

Unlock the phone and accept the USB debugging authorization prompt. If needed:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe kill-server
..\android-build-tools\android-sdk\platform-tools\adb.exe start-server
```

Then reconnect the cable.

## `INSTALL_FAILED_UPDATE_INCOMPATIBLE`

The installed app was signed with a different key. Uninstall the old package first:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe uninstall com.starorchard.platform
```

Then install again.

## `INSTALL_FAILED_ABORTED: User rejected permissions`

The phone rejected the install prompt. Keep the phone unlocked, approve USB install or unknown app prompts, then rerun install.

## App Opens To `Web page not available`

Confirm the WebView activity loads:

```text
file:///android_asset/game/index.html
```

Also confirm `app/src/main/assets/game/index.html` exists in the APK build source.

## App Stops Immediately

Capture logs:

```powershell
..\android-build-tools\android-sdk\platform-tools\adb.exe logcat -c
..\android-build-tools\android-sdk\platform-tools\adb.exe shell am start --user 0 -n com.starorchard.platform/.MainActivity
..\android-build-tools\android-sdk\platform-tools\adb.exe logcat -d -t 700 | Select-String -Pattern "FATAL EXCEPTION|AndroidRuntime|crash|Stopping"
```

