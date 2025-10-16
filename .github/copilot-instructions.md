# Copilot Instructions for creativedev.particles

## Creative Tech Lead Project Overview

This is a **Creative Technology Leadership portfolio project** showcasing enterprise-grade 3D immersive experiences. Built with React Three Fiber, Three.js, and TypeScript to demonstrate advanced technical architecture, performance optimization, and creative coding excellence.

**Project Purpose**: Demonstrate Creative Tech Lead competencies in scalable, high-performance creative applications.

## Architecture Philosophy - Creative Tech Excellence

- **Performance-First Design**: Every decision optimized for 60fps+ real-time rendering
- **Enterprise Scalability**: Clean Architecture + SOLID principles for team collaboration
- **Creative Innovation**: Cutting-edge web technologies enabling ambitious visual experiences
- **User Experience Focus**: Immersive interactions that feel effortless and magical

## Tech Stack - Creative Technology Leadership

- **3D Engine**: Three.js with React Three Fiber (@react-three/fiber)
- **Frontend Framework**: React 19 with TypeScript (strict mode)
- **Build System**: Vite 7 with optimized React plugin
- **3D Ecosystem**: @react-three/drei, @react-three/postprocessing
- **State Management**: Zustand (optimized for complex 3D state)
- **Animation Engine**: @react-spring/three, Framer Motion 3D
- **Physics Simulation**: @react-three/cannon or @react-three/rapier
- **Styling System**: Styled Components with glassmorphism design
- **Performance**: GPU acceleration, instancing, LOD, memory pooling

## Creative Tech Lead Patterns

- **Component-Driven Architecture**: Reusable 3D components with clear interfaces
- **Performance Optimization**: useMemo, useCallback, React.memo for 3D rendering
- **Type Safety Excellence**: Full TypeScript coverage for Three.js objects
- **Clean Code Standards**: Self-documenting code with creative intent
- **Cross-functional Collaboration**: Designer-developer friendly component APIs

## Project Structure - Enterprise Grade

```
src/
├── app/                     # Application Layer (Zustand stores, use cases)
├── domain/                  # Domain Layer (entities, services, repositories)
├── infrastructure/          # Infrastructure Layer (Three.js, WebGL, shaders)
├── presentation/            # Presentation Layer (React components, hooks)
│   ├── components/
│   │   ├── ui/             # UI components with glassmorphism design
│   │   ├── experience/     # 3D scene components
│   │   └── particles/      # Particle system components
│   ├── hooks/              # Custom 3D hooks (useParticles, useScene3D)
│   └── styles/             # Styled components + theme system
└── shared/                  # Shared utilities, types, constants
```

## Development Excellence Standards

- **Code Quality**: ESLint 9 flat config, strict TypeScript, no unused variables
- **Performance Monitoring**: Real-time FPS, memory usage, triangle count tracking
- **Creative Workflow**: HMR-optimized development with instant visual feedback
- **Production Ready**: Optimized builds with asset optimization and code splitting

## Creative Technology Best Practices

- **GPU Optimization**: Prefer instancing over individual objects for performance
- **Memory Management**: Implement object pooling for particle systems
- **Visual Quality**: Use post-processing effects for professional polish
- **Responsive Design**: Adaptive quality based on device capabilities
- **Accessibility**: Ensure immersive experiences are inclusive

## Performance Excellence Targets

- **Frame Rate**: Sustained 60fps+ on target devices
- **Memory Usage**: <200MB for complex particle systems
- **Load Times**: <3s initial load, <1s scene transitions
- **GPU Efficiency**: <80% GPU utilization on mid-range hardware

When contributing to this project, prioritize creative innovation balanced with technical excellence. This codebase demonstrates Creative Tech Lead capabilities for enterprise creative technology teams.
│ ├── systems/ # Particle systems, physics, etc.
│ └── materials/ # Custom shaders and materials
├── hooks/ # Custom React hooks
├── stores/ # State management (Zustand)
├── utils/ # Pure functions and helpers
└── types/ # TypeScript definitions

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
```
