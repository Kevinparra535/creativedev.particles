# Proof of Concept (PoC)

We validated that the proposed pipeline meets the basic goals with controlled complexity.

## Hypotheses

- An FBO (GPU) ping‑pong simulator can sustain high counts with visual parity against the legacy.
- FXAA, Bloom, and Motion Blur can be ported to GLSL3 and run in a stable effect queue.

## What we implemented

- GPU simulation + CPU fallback.
- FXAA (self‑contained GLSL3), Bloom (separable, equivalent thresholds), Motion Blur (motion material + prev/current textures).
- Safeguards: precision injection, protection against feedback loops in the composer.

## Outcome

- Stable render and live controls via Leva.
- Sufficient parity in Bloom/Motion Blur vs the legacy.
- A ready base to iterate on emitters, forces, and materials.
