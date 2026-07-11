# Contributing

## Workflow

1. Start from an up-to-date main branch.
2. Create a focused branch.
3. Keep generated APKs, signing keys, and build output untracked.
4. Make the smallest coherent change.
5. Run relevant build and device checks.
6. Commit with a concise behavior-focused message.

## Required checkpoints

- Start, pause, resume, restart, and game-over actions work.
- Every level is passable without a random power-up.
- Checkpoints, Save/Load, and Level Select follow their rules.
- Effect expiry restores physics, speed, collisions, and hero colors.
- HUD and controls remain aligned without obscuring gameplay.
- Long translations do not clip; every visible message exists in every locale.
- APK builds, installs, launches offline, and resumes correctly.

Update this Wiki whenever build steps, controls, unlock rules, or architecture change.
