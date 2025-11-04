# Creative Labs: Particles [Live demo](https://labs-particles.web.app/)

![["Particles cover"]](docs/readme_cover.png)

![R3F](https://img.shields.io/badge/R3F-React%20Three%20Fiber-black)
![WebGL2](https://img.shields.io/badge/WebGL2-FBO-blue)
![GLSL3](https://img.shields.io/badge/GLSL-3.0-purple)
![License: MIT](https://img.shields.io/badge/License-MIT-green)
Tested @ 1080p · 60FPS (65k)

GPU particle lab with React Three Fiber. This README keeps only the essentials; extended content lives in [docs/](docs/README.md).

## Why this exists

A real‑time laboratory to explore how particle motion can create emotion and narrative with the web as a canvas. It focuses on GPU simulation (FBO ping‑pong) for scale and responsiveness, keeping a CPU fallback for reach. The goal isn’t “optimization for its own sake,” but expressive motion and interaction that feels alive.

## Creative Manifesto

This lab has a creative manifesto → [docs/MANIFESTO.md](docs/MANIFESTO.md)

## Stack (brief)

- React 19 + TypeScript + Vite 7
- Three.js with React Three Fiber (@react-three/fiber, @react-three/drei)
- PostFX (FXAA, Bloom, Motion Blur) with a custom pipeline

## Creative Goals

- Explore dense particle behaviors driven by curl noise and target attraction.
- Convey feelings of calm, curiosity, and “cosmic” motion through subtle forces and color.
- Test hypotheses: GPU FBO vs CPU limits; triangle “glyph” particles vs points; motion blur as a storytelling tool; interactive follow‑mouse as a soft choreographer.

## What I learned

- WebGL2 + GLSL3 unlock a clean sim/draw pipeline; Nearest+Float RGBA FBOs are a reliable base.
- A tiny offscreen scene with a fullscreen quad keeps simulation simple and fast; ping‑pong + “prev texture” is a clean contract for motion blur.
- “Triangles” mode adds character, but motion length needs tuning (u_motionMultiplier) relative to triangleSize.
- Amount presets (4k → 4m) make perf predictable; 65k is a sweet spot for 1080p/60 on mid GPUs.
- CPU fallback works for ~8–16k; beyond that it becomes a teaching tool, not a production path.
- Tooling: Vite warns if you define full process.env; avoid it. Bundle size is big with three + shaders—consider code‑splitting UI/effects.

## Roadmap

- Split code (manualChunks/import()) to reduce initial bundle; lazy‑load Leva and post‑FX.
- More particle “glyphs” (quads/lines), shape presets, and scripted reveals.
- Mobile tuning: adaptive amounts, bloom thresholds, and motion‑blur off by default.
- Optional audio‑reactive mapping (supported for Wallpaper Engine).
- WebGPU exploration when stable in R3F for compute‑style sims.

## Quick start

- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

Note: Vite warns if the full `process.env` is defined. Avoid exposing the entire environment.

## Documentation

- Docs index: `docs/README.md`
- Vision: `docs/VISION.md`
- Creative process: `docs/CREATIVE_PROCESS.md`
- PoC: `docs/POC.md`
- MVP: `docs/MVP.md`
- Architecture: `ARCHITECTURE.md`
- Style guide: `docs/STYLE_GUIDE.md`

## Credits

- Legacy reference: ["The-Spirit by edankwan"](https://github.com/edankwan/The-Spirit)
