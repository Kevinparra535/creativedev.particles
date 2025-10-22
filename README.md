# creativedev.particles

A GPU particle systems lab exploring high‑performance rendering with Three.js + React Three Fiber, designed as the practical kickoff of my journey as a Creative Tech Lead. It documents the technology choices, experiments, and leadership decisions behind building a modern, scalable visual system.

## Vision

- Build an expressive, fast particle simulator that scales to dense counts while staying responsive and beautiful.
- Treat the codebase as a lab: iterate, measure, and document decisions (what stayed, what changed, why).
- Use this as a leadership canvas to demonstrate clarity, technical depth, and delivery focus.

## What this lab is

- A side‑by‑side of a legacy reference (The-Spirit-master) and a modern stack (React 19 + Vite + R3F), with deliberate parity for visuals and behavior.
- A GPU FBO pipeline for positions + a CPU fallback, with consistent controls and postprocessing (FXAA, Bloom, Motion Blur).
- A place to test assumptions, tune performance, and codify good engineering patterns for creative projects.

## Stack

- React 19 + TypeScript + Vite 7
- Three.js via React Three Fiber (@react-three/fiber, @react-three/drei)
- Legacy‑parity postprocessing pipeline (FXAA, Bloom, Motion Blur)
- Zustand settings store; Leva controls

## Architecture (project‑specific)

- Entry: `src/ui/components/R3FCanva.tsx` mounts the Canvas and `ModernCore` scene.
- Scene: `src/ui/scenes/ModernCore.tsx` composes lights, floor, controls, and `AdaptiveParticles`.
- Particles:
  - GPU path: `src/ui/components/particles/FboParticles.tsx` with ping‑pong FBO sim and GLSL3 shaders (`src/glsl/glsl3`).
  - CPU fallback: `src/ui/components/particles/CpuParticles.tsx` for WebGL2‑limited devices.
- Postprocessing: legacy‑compatible pipeline under `src/assets/postprocessing/**`, mounted via `PostProcessingFx` and controlled by the settings store (FXAA, Bloom, Motion Blur).

See `ARCHITECTURE.md` for a deeper breakdown.

## Controls & settings

- The Leva panel mirrors legacy toggles: amount (cols/rows), speed, dieSpeed, curlSize, attraction, followMouse, colors, triangle size/flip, and post‑fx toggles.
- Motion Blur uses a per‑object motion material (attached by the particle renderer) to render a velocity pass before lines/sampling.

## Quick start

- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

If you see a security warning about `define.process.env`, it’s a Vite heads‑up to avoid exposing the whole env; we’ll keep only needed keys in future updates.

## Leadership notes

- Chose one postprocessing system (legacy) for completeness and predictability; removed competing stacks.
- Prioritized visual parity first (Bloom threshold/blur parity, Motion Blur trails, FXAA stability), then performance tuning.
- Added safeguards against common runtime failures (e.g., feedback loops in composer, shader precision injection).
- Documented assumptions and left measured, low‑risk next steps (see below).

## Status and next steps

- Build: PASS
- Lint/Typecheck: Lint config migration pending (flat config plugin mapping)
- Runtime: Stable; parity validated for FXAA/Bloom/Motion Blur under the legacy stack.

Next:
- Fix ESLint flat config (map `@eslint/js` properly and re‑add import sorting if desired).
- Tighten Vite define env exposure.
- Optional: WebGPU exploration for next‑gen pipeline.

## Credits

- Legacy reference: `The-Spirit-master/`
- Modern stack and shaders adapted for GLSL3 and R3F.
