# Gameplay and Progression

## Objective

Collect coins, avoid hazards, defeat or bypass monsters, and reach the flag. The campaign contains 21 levels with increasing gaps, platforms, enemies, hazards, and moving elements.

## Controls

- Left and right: move
- Jump: jump or stomp enemies from above
- Dash: short burst of horizontal movement
- Pause: suspend gameplay without losing progress
- Restart: begin the current run again

The web build also supports keyboard input. The on-screen control map is the source of truth for supported keys.

## Progression rules

- Save and Load unlock after Level 5.
- Level Select unlocks after clearing the first 10 levels.
- Checkpoints become the respawn position after activation.
- A spike or monster collision removes one life and displays a localized notification.
- Every level must remain passable with the base jump ability. Random treasure effects may help, but must never be required.

## Mystery boxes

Mystery boxes are randomized and can contain rewards or penalties. Current outcomes include helpful effects, time loss, and an additional roaming enemy.

### Power Spring

- Duration: **13 seconds**
- Jump impulse multiplier: **sqrt(2), approximately 1.414x**
- Approximate peak jump height: **2x**, because ballistic height scales with launch velocity squared
- Monster speed multiplier during the same period: **1.2x**

Expiration must restore the original jump value, monster speed, and hero appearance.

### Rage Potion

- Duration: **10 seconds**
- The hero can destroy eligible obstacles and monsters by colliding with them.
- Destroyed targets award their configured score bonuses.

Expiration must restore normal collision rules and hero appearance.

## Save data

Progress is stored through WebView DOM storage under `starOrchard.save.v3`. Uninstalling the application or clearing its storage removes the save.
