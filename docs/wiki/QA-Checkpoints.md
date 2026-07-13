# QA Checkpoints

The game includes runtime checkpoint functions in `game.js`. These are intended to catch regressions in high-risk areas.

## Checkpoint Groups

- Moon phase
- Language coverage
- Progression unlock rules
- Input and touch state
- Effect progress colors
- Control tuning
- Level generation
- Layout geometry
- Button labels and states

## Core Assertions

Progression:

- Save/load unlock level remains `6`.
- Level select unlock level remains `10`.

Effects:

- Spring duration remains `13` seconds.
- Rage duration remains `10` seconds.
- Effect bars use green, yellow, and red thresholds.

Controls:

- Walk speed, dash speed, acceleration, friction, jump power, coyote time, jump buffer, and short-hop tuning remain inside expected bounds.

Layout:

- HUD stays centered on mobile.
- Top buttons avoid rounded screen edges.
- Touch controls stay below the main play area.
- Settings panel remains within the screen.
- Level options render in two columns.

Localization:

- Required text keys exist for every supported language.
- Pickup prompts and game-state prompts should not silently fall back to English for non-English languages.

## Manual Device Checks

Before publishing a new APK:

1. Install on a physical Android device.
2. Launch the app.
3. Confirm no immediate `FATAL EXCEPTION`.
4. Start gameplay.
5. Hold right and press jump.
6. Hold movement and press dash.
7. Open settings and switch language.
8. Verify touch labels update.
9. Verify save/load appears from Level 6.
10. Verify level select appears from Level 10.

