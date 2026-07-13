# Gameplay and Progression

## Core Objective

The player collects coins, avoids hazards, stomps enemies, opens treasure boxes, and reaches the flag to clear each stage.

## Levels

- Total stages: `21`
- Stage display format: `level/21 (chapter-stage)`
- Difficulty tiers are generated from `DIFFICULTY_TIERS` in `game.js`.
- The level generator increases gaps, enemy pressure, hazards, moving platforms, and layout complexity across later stages.

## Saves and Level Select

- Save/load unlocks from Level 6.
- Level select unlocks from Level 10.
- Save data is stored in browser local storage through the WebView runtime.
- New game start uses the current run start index.

## Treasure and Effects

Treasure rewards are randomized through a reward bag system.

Current notable effects:

- Power spring duration: `13` seconds
- Rage potion duration: `10` seconds
- Spring enemy speed multiplier: `1.2`
- Spring jump multiplier: `Math.SQRT2`, which approximately doubles jump height without doubling jump velocity

Effect progress bars use:

- Green while remaining progress is at least `2/3`
- Yellow while remaining progress is at least `1/5`
- Red below `1/5`

## Damage Feedback

When the hero hits hazards or enemies, the game emits a life loss prompt similar to coin and treasure pickup prompts.

