# Copilot instructions for creativedev.particles

Purpose: make AI agents productive fast in this GPU particles codebase. Keep answers concrete and aligned to files that exist here.

## Stack and intent
- React 19 + TypeScript + Vite 7
- Three.js via React Three Fiber (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- Goal: high‑performance particle systems. Two paths exist: a GPU FBO pipeline and a lightweight CPU fallback.

## Current scene wiring (Oct 2025)
- Entry: `src/ui/components/R3FCanva.tsx` creates `<Canvas>` and renders `src/ui/scenes/lowQuality/Scene1.tsx`.
- `Scene1` drives `LowQualityParticles` (additive `<points>` cloud) with Leva controls; post‑processing in `R3FCanva` is present but commented.

## GPU FBO pipeline (recommended for dense particles)
- Component: `src/ui/components/particles/FboParticles.tsx`.
- Offscreen sim: tiny scene + `OrthographicCamera(-1..1, near≈1/2^53)` rendered each frame to `useFBO(size,size,{ NearestFilter, FloatType, RGBAFormat, no depth/stencil })`.
- Simulation material: `src/materials/SpiritSimulationMaterial.ts` using `simulationVertexShader.ts` + `spiritSimulationFragment.ts` and uniforms like `uMouse3d`, `uAttraction`, `uCurlSize`.
- Draw pass: `<points>` with `spiritParticlesVertex.ts` + `spiritParticlesFragment.ts`; the position attribute stores lookup UVs as `[u,v,0]` and samples `uPositions` in VS.
- Frame loop (see FboParticles `useFrame`):
	1) gl.setRenderTarget(FBO) → gl.render(simScene, orthoCam)
	2) gl.setRenderTarget(null)
	3) points.material.uniforms.uPositions = FBO.texture; update `uTime`; update sim uniforms (mouse projected to z=0 plane).
- Register intrinsic for the sim material once: `extend({ SpiritSimulationMaterial })`, then use `<spiritSimulationMaterial args={[size]} />`.

## CPU/fallback particles
- `src/ui/components/particles/LowQualityParticles.tsx`: generates sphere positions via `useMemo`, simple VS with mouse attraction in world XY and distance falloff; FS from `materials/fragmentShader.ts`.
- Controlled via Leva in `Scene1` (count, radius, pointSize, attract, falloff). Good for quick demos and lower‑end devices.

## Conventions and patterns
- Materials/GLSL in `src/materials/`; scene components in `src/ui/components/**` and `src/ui/scenes/**`.
- Prefer `NearestFilter` for FBO textures; additive blending for points; keep draw shaders lightweight.
- Use `useMemo` for large buffers; don’t recreate arrays per frame; dispose geometries/materials on unmount.
- The `The-Spirit-master/` folder is legacy reference code—do not import from it.

## Performance utilities
- `src/core/presentation/usePerformanceOptimization.ts`: adaptive quality (FPS/memory), exposes `{ metrics, currentQuality, adjustQuality }`.
- Example: drive particle count/post effects from `currentQuality`; read `gl.info` via `metrics`.

## Dev workflow (package.json)
- `npm run dev` (Vite + HMR)
- `npm run build` (tsc -b → vite build)
- `npm run lint` (ESLint 9 flat config)
- `npm run preview`

## Quick start for GPU path
- In `R3FCanva.tsx`, render `<FboParticles size={128} pointSize={3} />` under the camera; `size×size` = particle count (128→16,384).
- Post‑processing lives in `R3FCanva` under `<EffectComposer>`; keep effect props conservative to maintain FPS.
