# Controls and Mobile Input

## Touch Controls

The mobile layout provides:

- Left movement
- Right movement
- Dash
- Jump
- Pause
- Restart
- Save and load after unlock
- Settings

Touch controls use DOM buttons over the canvas. CSS disables selection, callouts, and browser touch gestures on the stage.

## Combo Input

The input system supports common mobile platformer combinations:

- Hold right and press jump
- Hold left and press jump
- Hold movement and press dash
- Hold jump while movement is already active

The runtime tracks both `pressed` and `keys` state. `jumpHeld` prevents missed jump transitions when Android WebView drops or delays a pointer event during multi-touch.

## Pointer Capture Handling

Android WebView can briefly lose pointer capture during two-thumb play. The game treats `pointerup` and `pointercancel` as authoritative release events. `lostpointercapture` no longer clears held input by itself.

## Keyboard Controls

Desktop keyboard controls remain available:

- Move: `A`, `D`, arrow keys
- Jump: `Space`, `W`, `ArrowUp`
- Dash: `Shift`
- Pause: `P`
- Start/continue: `Enter` or overlay button

