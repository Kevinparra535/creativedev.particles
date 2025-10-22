# Creative process

We approached the project as a lab with short cycles: hypothesis → test → evaluate → document.

## Key milestones

1. Legacy parity
   - Chose a single post‑processing stack (FXAA, Bloom, Motion Blur) for stability.
   - Tuned Bloom (kernel/threshold/blur) and Motion Blur (vectors/prev textures).
2. GLSL3 migration
   - Removed glslify and consolidated precision/defines.
   - Rewrote FXAA as a self‑contained shader.
3. GPU simulation with fallback
   - FBO ping‑pong with a "Fibonacci sphere" initializer.
   - Prev/current textures exposed as getters to avoid stale references.
4. UI and experience
   - Leva for live controls.
   - Styled‑components + tokens/themes for visual consistency.

## Leadership decisions

- Prioritize a complete and stable path over multiple mediocre alternatives.
- Document trade‑offs (why legacy post‑fx) and keep improvements scoped and measurable.

## Learnings

- Centralizing precision/uniforms reduces shader fragility.
- A defensive composer avoids feedback loops when toggling effects.
/- Keeping clear contracts between simulation and render simplifies future changes.
