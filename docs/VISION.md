# Vision

This particle lab demonstrates that we can build an expressive, high‑performance visual system on a modern pipeline (React + R3F + Three.js) while keeping parity with a legacy reference where it matters.

## Goals

- Scale to dense particle counts smoothly.
- Preserve artistic control (parameters and post‑fx) with a clear UI.
- Leave technical decisions documented and repeatable.

## Success criteria

- Stable GPU simulation (FBO ping‑pong) with CPU fallback.
- Visual parity with the legacy in Bloom, FXAA, and Motion Blur.
- Code structured by systems (simulation, render, post‑fx, UI) with minimal contracts.

## Outcome

The MVP reaches visual parity and fluidity in most scenarios, with toggles and profiles to adapt to different device capabilities. The code is a base for creative research and new effects.
