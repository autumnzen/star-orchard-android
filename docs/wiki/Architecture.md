# Architecture

The Android Activity hosts a full-screen WebView, which loads local index.html, styles.css, and game.js. The application has no remote runtime dependency.

## Important files

| Path | Purpose |
| --- | --- |
| app/src/main/java/com/starorchard/platform/MainActivity.java | Activity and WebView lifecycle |
| app/src/main/assets/game/index.html | UI, HUD, controls, and settings |
| app/src/main/assets/game/styles.css | Responsive landscape UI |
| app/src/main/assets/game/game.js | Levels, physics, rendering, localization, weather, and saves |
| app/src/main/AndroidManifest.xml | App identity, orientation, and launcher |
| app/build.gradle | Android SDK and version configuration |
| build-apk.ps1 | Portable APK build workflow |

MainActivity enables hardware acceleration, JavaScript, DOM storage, local assets, immersive mode, and lifecycle handling. The game renders to a 960 x 540 internal canvas with responsive CSS.

Keep gameplay constants centralized, route visible strings through translations, centralize effect cleanup, version save formats, and keep level passability constraints separate from rendering.
