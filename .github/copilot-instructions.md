# Copilot instructions for creativedev.particles

These notes make AI agents productive quickly in this codebase. Keep answers concrete, code-aware, and aligned with the files that exist here.

## What this repo is
- React 19 + TypeScript + Vite 7
- Three.js via React Three Fiber (R3F) with @react-three/drei and @react-three/postprocessing
- Focus: high-performance GPU particle simulation using an offscreen FBO pass and custom shaders

## How things are wired (big picture)
- Entry scene: `src/ui/components/R3FCanva.tsx`
	- Creates a `<Canvas>` with post-processing (`DepthOfField`, `Bloom`, `Noise`, `Vignette`)
	- Defines and renders an inline `FBOParticles` component (simulation + draw pass)
- Simulation pass: `src/materials/SimulationMaterial.ts` + `simulationVertexShader.ts` + `simulationFragmentShader.ts`
	- Builds a DataTexture of initial positions and a `THREE.ShaderMaterial`
	- In `R3FCanva.tsx`, a small offscreen scene + ortho camera render to a `useFBO(...)` render target each frame
	- The resulting texture (uniform `uPositions`) feeds the draw pass
- Draw pass: `vertexShader.ts` + `dynamicFragmentShader.ts`
	- A `<points>` geometry samples `uPositions` in the vertex shader and renders with additive blending
- Performance: `src/core/presentation/usePerformanceOptimization.ts`
	- Hook that tracks FPS/memory and optionally adjusts “quality” (particle count/update rate/post) over time

## Project conventions
- Place GLSL and material logic under `src/materials/`; keep scene components under `src/ui/components/`
- Simulation runs in `useFrame`: render simulation scene to FBO, then set `uPositions` and `uTime` on materials
- Use `useMemo` for large buffers (particle attributes), and dispose geometries/materials when unmounting
- Favor `NearestFilter` for FBO textures in simulation to avoid sampling artifacts and improve speed
- Post effects live under `<EffectComposer>`; keep effect props conservative to maintain FPS
- TypeScript is strict; rely on `THREE.*` types for uniforms and materials

## Developer workflow (commands from package.json)
- `npm run dev` — Vite dev server with HMR
- `npm run build` — `tsc -b` then `vite build`
- `npm run lint` — ESLint 9 flat config
- `npm run preview` — Preview production build

## Practical patterns (with repo examples)
- FBO simulation loop (see `R3FCanva.tsx`):
	1) setRenderTarget(FBO) → render(simulationScene, orthoCamera)
	2) reset to default target
	3) assign `material.uniforms.uPositions.value = FBO.texture` and update `uTime`
- Particle attributes: generate `[u, v]` pairs for `size x size` texture lookups; store in a single Float32Array via `useMemo`
- Shaders: keep draw pass lightweight; additive blending + small point size is the default look
- Performance hook usage:
	```ts
	const { metrics, currentQuality, adjustQuality } = usePerformanceOptimization({ targetFps: 60 })
	// Use currentQuality.particleCount or toggle post-processing based on metrics
	```

## Key files to reference
- Scene + simulation wiring: `src/ui/components/R3FCanva.tsx`
- Simulation material and GLSL: `src/materials/SimulationMaterial.ts`, `simulationVertexShader.ts`, `simulationFragmentShader.ts`
- Draw pass shaders: `src/materials/vertexShader.ts`, `dynamicFragmentShader.ts`
- Perf utilities: `src/core/presentation/usePerformanceOptimization.ts`, `src/utils/performanceTest.ts`
- Types and theming: `src/shared/types/`, `src/ui/styles/`

## When adding features
- New particle behaviors: add uniforms/logic in `SimulationMaterial` or its shaders; thread new uniforms from `R3FCanva.tsx`
- New visual looks: add fragment/vertex shader files under `src/materials/` and swap in the `<shaderMaterial>` in the draw pass
- Keep changes measurable: expose a simple config (count/speed/colors) and verify with `metrics.fps`

If anything is unclear or you need deeper examples (e.g., adding instancing or LOD), ask and reference the exact files above.
