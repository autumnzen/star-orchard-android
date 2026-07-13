# Settings, Weather, and Localization

## System Settings

The in-game settings panel includes:

- Language
- Illumination
- Weather
- Level select after unlock

The settings UI uses custom option blocks instead of native visible selects. Native select elements remain hidden for state synchronization.

## Illumination

Supported light modes:

- Natural rhythm
- Dawn
- Day
- Dusk
- Night

Natural rhythm follows local time.

## Weather

Supported weather modes:

- Natural rhythm
- Sunny
- Cloudy
- Rain
- Thunder

The renderer changes sky colors, clouds, rain, lightning, sun, moon, stars, and birds based on light and weather state.

## Moon Phase

Night scenes render moon illumination based on lunar phase calculations. The checkpoint function verifies new moon, first quarter, full moon, and last quarter geometry.

## Languages

Supported language keys:

- Simplified Chinese: `zh`
- Traditional Chinese / Ancient Chinese label: `zhHK`
- English: `en`
- French: `fr`
- Spanish: `es`
- Russian: `ru`
- Arabic: `ar`
- Japanese: `ja`
- German: `de`

The language audit checks required UI, pickup, state, and control strings across supported languages.

