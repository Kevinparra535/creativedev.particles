# Copilot instructions for creativedev.particles

Purpose: make AI agents productive fast in this GPU particle system codebase. Keep answers concrete and aligned to files that exist here.

## Stack and intent
- React 19 + TypeScript + Vite 7
- Three.js via React Three Fiber (@react-three/fiber, @react-three/drei)
- Goal: high‑performance particle systems with a GPU FBO pipeline and a CPU fallback.

## Current scene wiring (Oct 2025)
- Entry: `src/ui/components/R3FCanva.tsx` creates `<Canvas>`, sets background/fog, installs a `PerspectiveCamera`, renders `src/ui/scenes/Scene1.tsx`, and always mounts legacy post‑processing via `LegacyPostProcessing`.
- `Scene1` composes: lights, floor, `ControlsPanel` (Leva), and `AdaptiveParticles` which chooses GPU or CPU path based on `utils/capabilities.shouldUseFallback`.

## GPU FBO pipeline (recommended for dense particles)
- Component: `src/ui/components/particles/FboParticles.tsx`.
- Offscreen sim: a tiny scene + `OrthographicCamera(-1..1)` with a fullscreen quad. Shaders live in `src/glsl/simulationShaders.ts` (`quadVert`, `positionFrag`). A GLSL initializer in `FboParticles` seeds a Fibonacci sphere + life into a default RT.
- Ping‑pong: created via `utils/fboHelper.createPingPong(w,h,{ NearestFilter, FloatType, RGBAFormat, depth/stencil: false })`.
- Uniforms (sim): `resolution`, `texturePosition`, `textureDefaultPosition`, `time`, `speed`, `dieSpeed`, `radius`, `curlSize`, `attraction`, `initAnimation`, `mouse3d`, `followMouse`. Mouse is projected to the z=0 plane each frame.
- Draw pass: two modes
  - points: lookup geometry where `position.xy = [u,v]`; VS/FS from `src/glsl/particlesShaders.ts` (`particlesVertexShader`, `particlesFragmentShader`), plus matching distance/motion variants for shadows/motion blur.
  - triangles: geometry built with attributes `position`, `positionFlip`, `fboUV`; VS uses `flipRatio` to morph between orientations.
- Motion blur: a `MeshMotionMaterial` is created and attached to the rendered object via a custom `motionMaterial` property for the legacy MotionBlur effect.

## CPU/fallback particles
- Component: `src/ui/components/particles/CpuParticles.tsx` generates sphere positions once and attracts them to a mouse‑projected point on z=0. Chosen by `AdaptiveParticles` when WebGL2 is missing or risky (`utils/capabilities.ts`).

## Settings, controls, and amounts
- Settings store: `src/ui/hooks/useSceneSettings.ts` (Zustand). Particle “amount” selects `[cols, rows, radius]` from `src/config/settings.config.ts` (`amountMap`).
- Leva panel (`ControlsPanel.tsx`) mirrors the legacy UI. Changing `amount` prompts a page reload and persists as `?amount=65k` etc. Other fields (speed, dieSpeed, curlSize, attraction, followMouse, colors, triangleSize/flipRatio, post toggles) update live.

## Post‑processing (legacy parity)
- Implemented under `src/postprocessing/**` and mounted by `LegacyPostProcessing.tsx`. Toggles (`fxaa`, `bloom`, `motionBlur`) and quality map come from `settings.config.ts`.
- MotionBlur reads the object’s `motionMaterial` and uniforms (`texturePosition`, `texturePrevPosition`, `u_prevModelViewMatrix`, `u_motionMultiplier`). `FboParticles` updates prev/current textures every frame.

## Conventions and patterns
- GLSL is in `src/glsl/**` and composed with glslify. Use `glslVersion: THREE.GLSL3` for Raw/ShaderMaterials.
- FBO textures: prefer Nearest filters, `FloatType`, `RGBAFormat`, and disable mipmaps; render offscreen with `NoBlending`.
- Use `useMemo` for large buffers; dispose geometries/materials on unmount; avoid recreating arrays per frame.
- The `The-Spirit-master/` folder is legacy reference—don’t import from it.

## Dev workflow (package.json)
- `npm run dev` (Vite + HMR)
- `npm run build` (tsc -b → vite build)
- `npm run lint` (ESLint 9 flat config)
- `npm run preview`

## Quick starts
- Default scene already uses `AdaptiveParticles`; tune via the Leva “Simulator/Rendering/Post” folders.
- To mount GPU directly: `<FboParticles cols={256} rows={256} mode="points" radius={300} speed={1} dieSpeed={0.003} curlSize={0.015} attraction={0.6} followMouse />` (particle count = cols×rows).
