# Troubleshooting

## ADB device missing or unauthorized

Unlock the phone, enable USB debugging, reconnect in File Transfer mode, and run adb devices. Accept the phone authorization dialog. The state must be device.

## INSTALL_FAILED_UPDATE_INCOMPATIBLE

The installed package uses another key. Uninstall com.starorchard.platform before installing the APK. Uninstalling removes local saves.

## Web page not available

Confirm index.html, styles.css, and game.js are packaged below app/src/main/assets/game. The Activity must load file:///android_asset/game/index.html.

## Application stops

Capture adb logcat after launch and search for FATAL EXCEPTION, AndroidRuntime, and the package name.

## Buttons or translations fail

Verify JavaScript is enabled, hidden overlays do not receive pointer events, and handlers work in started, paused, level-clear, and game-over states. For language errors, find the translation key and verify every locale defines it.
