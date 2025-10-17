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
# Copilot instructions for creativedev.particles

These notes make AI agents productive quickly in this codebase. Keep guidance concrete, code-aware, and aligned with files that exist here.

## What this repo is
- React 19 + TypeScript + Vite 7
- Three.js via React Three Fiber (R3F) with @react-three/drei and @react-three/postprocessing
- Focus: GPU particle simulation via offscreen FBO and custom shaders; performance-first patterns

## Architecture: how things are wired
- Entry scene: `src/ui/components/R3FCanva.tsx`
  - Creates a `<Canvas>` with post-processing (`DepthOfField`, `Bloom`, `Noise`, `Vignette`)
  - Currently renders a simple `<points>` cloud (`CustomGeometryParticles`) using `vertexShader.ts` + `fragmentShader.ts`
- FBO simulation (offscreen): `src/ui/components/FBOParticles.tsx`
  - Builds a tiny offscreen scene + `OrthographicCamera`; renders each frame to a `useFBO(size, size)` target
  - Simulation material: `src/materials/SimulationMaterial.ts` using `simulationVertexShader.ts` + `simulationFragmentShader.ts`
  - Feeds the draw pass by assigning `uPositions = renderTarget.texture` and updating `uTime`
- Draw pass (on-screen): `<points>` in `FBOParticles.tsx` uses `vertexShader.ts` + `fragmentShader.ts` with additive blending
- Performance utilities: `src/core/presentation/usePerformanceOptimization.ts` (adaptive quality, FPS/memory tracking)

Tip: To switch to the full FBO pipeline in the scene, import and render `<FBOParticles />` inside `R3FCanva` instead of `CustomGeometryParticles`.

## Conventions and patterns
- Materials and GLSL live in `src/materials/`; scene components in `src/ui/components/`
- Simulation loop (see `FBOParticles.tsx` `useFrame`):
  1) gl.setRenderTarget(FBO) → gl.render(simulationScene, orthoCamera)
  2) gl.setRenderTarget(null)
  3) points.material.uniforms.uPositions.value = FBO.texture; simulationMaterial.uniforms.uTime = clock.elapsedTime
- Use `NearestFilter` on FBO textures to avoid sampling artifacts and keep speed
- Generate `[u, v]` lookup pairs via `useMemo` for a `size x size` texture; store in one Float32Array
- Keep draw shaders lightweight; use additive blending and small point size by default
- Extra shaders: `positionBasedFragmentShader.ts` and `performanceShaders.ts` provide alternative looks/optimized paths

## Developer workflow
- `npm run dev` — Vite dev server (HMR)
- `npm run build` — `tsc -b` then `vite build`
- `npm run lint` — ESLint 9 flat config
- `npm run preview` — Preview the production build

## File map to start fast
- Scene + post: `src/ui/components/R3FCanva.tsx`
- FBO pipeline: `src/ui/components/FBOParticles.tsx`
- Simulation material/GLSL: `src/materials/SimulationMaterial.ts`, `simulationVertexShader.ts`, `simulationFragmentShader.ts`
- Draw shaders: `src/materials/vertexShader.ts`, `fragmentShader.ts` (alt: `positionBasedFragmentShader.ts`)
- Perf tools: `src/core/presentation/usePerformanceOptimization.ts`, `src/utils/performanceTest.ts`
- Styles/types: `src/ui/styles/`, `src/shared/types/`

## Using the performance hook (example)
```ts
const { metrics, currentQuality, adjustQuality } = usePerformanceOptimization({ targetFps: 60 })
// Drive particle count or toggle post-processing via currentQuality and metrics
```

## When adding features
- New particle behavior → add uniforms/logic in `SimulationMaterial` or its shaders; thread values from the component that owns the sim (`FBOParticles` or `R3FCanva`)
- New look → add shader files under `src/materials/` and swap the `<shaderMaterial>` in the draw pass
- Keep changes measurable → surface a small config (count/speed/colors) and observe `metrics.fps`

Notes
- `extend({ SimulationMaterial })` registers the intrinsic `<simulationMaterial />` element; see `FBOParticles.tsx` usage
- Offscreen ortho camera near value uses a very small epsilon (1/2^53) to ensure correct depth in the sim pass
