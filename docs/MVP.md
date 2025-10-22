# Minimum Viable Product (MVP)

The MVP consolidates the particle experience with essential controls and post‑processing, reaching the initial vision.

## Scope

- GPU simulation (FBO) with automatic CPU fallback.
- Render modes (points and triangles) with Motion Blur‑compatible materials.
- Post‑processing: FXAA, Bloom, Motion Blur with toggles and presets.
- Control panel (Leva) for amount, speed, forces, colors, and post‑fx.
- Base visual theme (light) and style tokens.

## Acceptance criteria

- Boots without errors and renders in real time.
- Toggling effects does not cause feedback loops or obvious artifacts.
- Reasonable visual parity with the legacy on reference scenes.

## Suggested next steps

- Refine ESLint flat config and clean imports.
- Code‑split the panel and heavy assets.
- Explore WebGPU or compute shaders to scale further.
