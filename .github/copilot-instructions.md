# Copilot Instructions for creativedev.particles

## Project Overview
This is an immersive 3D experience project using React Three Fiber, Three.js, and TypeScript. Built on Vite for optimal development experience with modern React 19 patterns. Focuses on particle systems, interactive 3D scenes, and creative visual effects.

## Architecture & Tech Stack
- **3D Engine**: Three.js with React Three Fiber (@react-three/fiber)
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 with React plugin
- **3D Ecosystem**: @react-three/drei, @react-three/postprocessing (recommended)
- **State Management**: Zustand (recommended for 3D apps)
- **Animation**: @react-spring/three, Framer Motion 3D
- **Physics**: @react-three/cannon or @react-three/rapier (if needed)
- **Type System**: Strict TypeScript with Three.js types
- **Linting**: ESLint 9 with React hooks and refresh plugins
- **Module System**: ESM (type: "module" in package.json)

## Key Configuration Files
- `tsconfig.json`: Composite TypeScript setup with separate app and node configs
- `tsconfig.app.json`: Main app configuration with strict linting rules
- `eslint.config.js`: Modern ESLint flat config with React hooks enforcement
- `vite.config.ts`: Basic Vite setup with React plugin

## Development Workflow
- **Start dev server**: `npm run dev` (Vite with HMR)
- **Build production**: `npm run build` (TypeScript compilation + Vite build)
- **Lint code**: `npm run lint` (ESLint with auto-fix capability)
- **Preview build**: `npm run preview` (Local preview of production build)

## Code Patterns & Conventions
- **Component Structure**: Use `src/App.tsx` as main component, follow React function component pattern
- **Asset Imports**: Static assets in `src/assets/`, public assets referenced from `/`
- **TypeScript Strict Mode**: Project uses strict TypeScript with no unused locals/parameters
- **JSX**: Uses `react-jsx` transform, no need for React imports in components
- **Module Resolution**: Bundler mode with import extensions allowed

## Architecture Patterns
- **Domain-Driven Design**: Separate 3D scenes, entities, and systems
- **Component Composition**: Reusable 3D components with props interface
- **Performance First**: Use `useMemo`, `useCallback`, and R3F optimization patterns
- **Clean Separation**: UI components separate from 3D scene logic
- **Type Safety**: Full TypeScript coverage for Three.js objects and scene state

## Project Structure (Recommended)
```
src/
├── components/          # React UI components
├── experience/          # 3D scenes and experiences  
│   ├── scenes/         # Individual 3D scenes
│   ├── objects/        # 3D objects and entities
│   ├── systems/        # Particle systems, physics, etc.
│   └── materials/      # Custom shaders and materials
├── hooks/              # Custom React hooks
├── stores/             # State management (Zustand)
├── utils/              # Pure functions and helpers
└── types/              # TypeScript definitions
```

## Development Notes
- **Performance**: Use `<Suspense>` for loading, `useFrame` carefully, dispose geometries
- **Scene Organization**: Group related 3D objects, use `<group>` for transforms  
- **State Management**: Keep 3D state separate from UI state
- **Hot Reloading**: R3F supports HMR for real-time scene editing
- **Three.js Integration**: Direct Three.js access via `useThree` hook when needed

## Best Practices for 3D Development
- Minimize render calls with `useMemo` for expensive calculations
- Use `useLayoutEffect` for immediate DOM measurements before paint
- Implement proper cleanup in `useEffect` for Three.js resources
- Prefer declarative R3F patterns over imperative Three.js when possible