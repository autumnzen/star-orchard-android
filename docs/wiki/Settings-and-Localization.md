# Settings and Localization

The settings menu supports Simplified Chinese, Chinese Classical style, English, French, Spanish, Russian, Arabic, Japanese, and German. Changing language must update the HUD, controls, settings, level messages, pickups, treasure results, damage notices, pause state, and game-over state.

## Layout requirements

- Arabic must remain readable with right-to-left text.
- Long Latin-language labels must not clip or overlap.
- Compact controls should use short localized labels.
- Every new message key must exist in every locale and language checkpoint.

## Environment

Illumination modes are Natural Rhythm, Dawn, Day, Dusk, and Night. Weather modes are Natural Rhythm, Sunny, Cloudy, Rain, and Thunder. Natural Rhythm uses local device time. Weather and illumination are independent but must produce a coherent scene.

The moon phase uses the current date and lunar-cycle corrections. Rendering must respect screen coordinates so waxing and waning are not mirrored. Verify new moon, first-quarter, full-moon, and last-quarter dates after changes.
