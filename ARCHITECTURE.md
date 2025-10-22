# 🏗️ Creative Technology Architecture

> **Enterprise-Grade 3D Framework Design** by Kevin Parra Lopez  
> _Demonstrating Creative Tech Lead expertise in scalable immersive experiences_

## 🎯 Architectural Philosophy

This project showcases **advanced Creative Technology Leadership** through a sophisticated architecture that combines:

- **Clean Architecture Principles** - Separation of concerns for maintainability
- **SOLID Design Patterns** - Professional OOP practices
- **Performance-First Engineering** - Optimized for 60fps+ real-time rendering
- **Scalable Component Design** - Enterprise-ready modular structure

---

## 🔎 Project-specific architecture: creativedev.particles (Oct 2025)

This repository is a modernized GPU particles lab with an explicit goal of reaching visual parity with a legacy reference while adopting a maintainable, scalable stack.

### Scene wiring

- Entry: `src/ui/components/R3FCanva.tsx` creates the `<Canvas>`, sets fog/clear color, and mounts `ModernCore`.
- Scene: `src/ui/scenes/ModernCore.tsx` composes lights, floor, `ControlsPanel` (Leva), and `AdaptiveParticles`.
- PostFX: `PostProcessingFx` mounts the legacy‑compatible postprocessing pipeline (FXAA, Bloom, Motion Blur) under `src/assets/postprocessing/**`.

### GPU FBO pipeline

- Component: `src/ui/components/particles/FboParticles.tsx`.
- Simulation: offscreen ping‑pong FBO with `OrthographicCamera(-1..1)` and a fullscreen quad. Shaders live in `src/glsl/glsl3/simulationShaders.ts`.
- Initialization: GLSL3 seeding of a Fibonacci sphere + life into a default texture.
- Uniforms (sim): `resolution`, `texturePosition`, `textureDefaultPosition`, `time`, `speed`, `dieSpeed`, `radius`, `curlSize`, `attraction`, `initAnimation`, `mouse3d`, `followMouse`.
- Draw: points or triangles. Point path samples the sim texture in the vertex shader; triangle path morphs orientations via `flipRatio` with attributes `position`, `positionFlip`, and `fboUV`.
- Motion blur: particles attach a `motionMaterial` exposing `texturePosition`, `texturePrevPosition`, and `u_prevModelViewMatrix` for the Motion Blur effect’s velocity pass.

### CPU fallback

- Component: `src/ui/components/particles/CpuParticles.tsx`.
- Behavior: generates sphere positions once and attracts them to a z=0 projected mouse point.
- Selection: `AdaptiveParticles` chooses CPU when WebGL2 is missing/risky (see `utils/capabilities.ts`).

### Post‑processing (legacy parity)

- Composer/effects under `src/assets/postprocessing/**`.
- FXAA: GLSL3 self‑contained shader (no glslify) to avoid pragma/precision compile issues.
- Bloom: legacy‑accurate 2‑pass separable blur with threshold/smoothing/weights parity.
- Motion Blur: velocity pass (reading per‑object motion material), then lines/sampling pass with quality scaling.
- Safety: the composer avoids feedback loops when a pass samples from the target it renders to.

### Settings and controls

- Zustand store mirrors legacy toggles: amount (cols/rows/radius), speed, dieSpeed, curlSize, attraction, followMouse, triangle size/flip, and post‑fx toggles/quality.
- Leva UI updates values live; amount changes trigger a page reload to resize buffers safely.

---

## 🔬 Technical Leadership Approach

### **Strategic Technology Decisions**

```typescript
// Creative Tech Lead Decision Matrix
interface TechDecision {
  performance: "critical" | "important" | "nice-to-have";
  scalability: "enterprise" | "team" | "personal";
  maintainability: "long-term" | "medium-term" | "short-term";
  innovation: "cutting-edge" | "proven" | "stable";
}
```

### **Architecture Layers with Purpose**

```
🎨 PRESENTATION LAYER
├── React Three Fiber Components    # Declarative 3D rendering
├── Custom Hooks for 3D Logic      # Reusable stateful behavior
├── Styled Components + Themes     # Design system consistency
└── Performance Monitoring UI      # Real-time metrics display

🧠 APPLICATION LAYER
├── Zustand State Management       # Predictable state updates
├── Use Case Orchestration         # Business logic coordination
├── Event System                   # Decoupled component communication
└── Performance Analytics          # Data-driven optimization

💎 DOMAIN LAYER
├── Particle System Entities       # Core business objects
├── Physics & Animation Services   # Computational logic
├── Scene Management               # 3D world coordination
└── Repository Interfaces          # Data access contracts

🔌 INFRASTRUCTURE LAYER
├── Three.js WebGL Integration     # Low-level 3D rendering
├── Shader & Material Systems      # GPU programming
├── Asset Loading & Caching        # Resource management
└── External API Adapters          # Third-party integrations
```

│ │ ├── ParticleService.ts # Lógica de partículas
│ │ ├── PhysicsService.ts # Lógica de física
│ │ └── AnimationService.ts # Lógica de animaciones
│ └── repositories/ # Interfaces de repositorios
│ └── ISceneRepository.ts
│
├── infrastructure/ # Infrastructure Layer
│ ├── three/ # Implementaciones Three.js
│ │ ├── loaders/ # Carga de assets 3D
│ │ ├── materials/ # Materiales y shaders
│ │ ├── geometries/ # Geometrías custom
│ │ └── renderers/ # Configuraciones de renderer
│ ├── repositories/ # Implementaciones de repositorios
│ └── external/ # APIs externas, archivos
│
├── presentation/ # UI Layer (React)
│ ├── components/ # Componentes React
│ │ ├── ui/ # Componentes UI puros
│ │ ├── experience/ # Componentes de experiencia 3D
│ │ │ ├── Scene.tsx # Componente escena principal
│ │ │ ├── Camera.tsx # Componente cámara
│ │ │ └── Effects.tsx # Post-processing effects
│ │ └── particles/ # Componentes específicos de partículas
│ ├── hooks/ # Custom hooks
│ │ ├── useParticles.ts # Hook para partículas
│ │ ├── useScene3D.ts # Hook para escena
│ │ └── usePhysics.ts # Hook para física
│ └── layouts/ # Layouts de la aplicación
│
├── shared/ # Código compartido
│ ├── constants/ # Constantes del proyecto
│ ├── types/ # Tipos TypeScript
│ ├── utils/ # Utilidades puras
│ └── config/ # Configuraciones
│
└── assets/ # Recursos estáticos
├── models/ # Modelos 3D (.gltf, .fbx)
├── textures/ # Texturas
├── shaders/ # Shaders GLSL
└── audio/ # Archivos de audio

````

## Patrones de Diseño Implementados

### 1. **Repository Pattern**

```typescript
// domain/repositories/ISceneRepository.ts
interface ISceneRepository {
  loadScene(id: string): Promise<Scene3D>;
  saveScene(scene: Scene3D): Promise<void>;
  getSceneMetadata(id: string): Promise<SceneMetadata>;
}
````

### 2. **Factory Pattern**

```typescript
// domain/factories/ParticleSystemFactory.ts
export class ParticleSystemFactory {
  static createFireworks(): ParticleSystem {
    return new ParticleSystem({
      type: "fireworks",
      count: 1000,
      behavior: new FireworksBehavior(),
    });
  }
}
```

### 3. **Observer Pattern**

```typescript
// domain/services/ParticleService.ts
export class ParticleService {
  private observers: ParticleObserver[] = [];

  subscribe(observer: ParticleObserver): void {
    this.observers.push(observer);
  }

  notify(event: ParticleEvent): void {
    this.observers.forEach((o) => o.update(event));
  }
}
```

### 4. **Strategy Pattern**

```typescript
// domain/strategies/AnimationStrategy.ts
interface AnimationStrategy {
  animate(target: Object3D, delta: number): void;
}

export class OrbitAnimationStrategy implements AnimationStrategy {
  animate(target: Object3D, delta: number): void {
    target.rotation.y += delta * 0.5;
  }
}
```

## Gestión de Estado

### Zustand Stores (Application Layer)

```typescript
// app/stores/scene.store.ts
interface SceneState {
  // Estado
  currentScene: Scene3D | null;
  isLoading: boolean;

  // Acciones
  loadScene: (id: string) => Promise<void>;
  updateScene: (updates: Partial<Scene3D>) => void;
  resetScene: () => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: null,
  isLoading: false,

  loadScene: async (id: string) => {
    set({ isLoading: true });
    const scene = await sceneRepository.loadScene(id);
    set({ currentScene: scene, isLoading: false });
  },

  updateScene: (updates) => {
    const current = get().currentScene;
    if (current) {
      set({ currentScene: { ...current, ...updates } });
    }
  },

  resetScene: () => set({ currentScene: null }),
}));
```

## Componentes React Three Fiber

### Composición de Componentes

```typescript
// presentation/components/experience/Scene.tsx
export const Scene: FC<SceneProps> = ({ children, ...props }) => {
  const { scene, camera } = useScene3D()

  return (
    <Canvas {...props}>
      <Suspense fallback={<Loader />}>
        <Environment preset="city" />
        <CameraController camera={camera} />
        <EffectsComposer>
          <PostProcessingEffects />
        </EffectsComposer>
        {children}
      </Suspense>
    </Canvas>
  )
}
```

### Custom Hooks

```typescript
// presentation/hooks/useParticles.ts
export const useParticles = (config: ParticleConfig) => {
  const particleService = useMemo(() => new ParticleService(config), [config]);

  const [particles, setParticles] = useState<Particle[]>([]);

  useFrame((_, delta) => {
    const updated = particleService.update(delta);
    setParticles(updated);
  });

  return { particles, particleService };
};
```

## Optimización de Rendimiento

### 1. **Instancing para Muchos Objetos**

```typescript
// infrastructure/three/InstancedParticles.ts
export class InstancedParticles extends InstancedMesh {
  constructor(count: number) {
    super(new SphereGeometry(0.1), new MeshBasicMaterial(), count);
  }

  updateParticle(index: number, position: Vector3): void {
    this.setMatrixAt(index, new Matrix4().setPosition(position));
    this.instanceMatrix.needsUpdate = true;
  }
}
```

### 2. **Pooling de Objetos**

```typescript
// shared/utils/ObjectPool.ts
export class ObjectPool<T> {
  private available: T[] = [];
  private createFn: () => T;

  constructor(createFn: () => T, initialSize = 10) {
    this.createFn = createFn;
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }

  acquire(): T {
    return this.available.pop() || this.createFn();
  }

  release(obj: T): void {
    this.available.push(obj);
  }
}
```

### 3. **LOD (Level of Detail)**

```typescript
// domain/services/LODService.ts
export class LODService {
  static getDetailLevel(distance: number): DetailLevel {
    if (distance < 10) return "high";
    if (distance < 50) return "medium";
    return "low";
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/domain/services/ParticleService.test.ts
describe("ParticleService", () => {
  it("should create particles with correct properties", () => {
    const service = new ParticleService();
    const particles = service.createParticles(100);

    expect(particles).toHaveLength(100);
    expect(particles[0]).toHaveProperty("position");
    expect(particles[0]).toHaveProperty("velocity");
  });
});
```

### Integration Tests

```typescript
// __tests__/presentation/hooks/useParticles.test.tsx
describe("useParticles", () => {
  it("should update particle positions on frame", () => {
    const { result } = renderHook(() => useParticles({ count: 10 }));

    act(() => {
      // Simulate frame update
      jest.advanceTimersByTime(16); // 60fps
    });

    expect(result.current.particles[0].position).not.toEqual(
      new Vector3(0, 0, 0)
    );
  });
});
```

## Configuración de Desarrollo

### Package.json Dependencies

```json
{
  "dependencies": {
    "@react-three/fiber": "^8.15.12",
    "@react-three/drei": "^9.92.7",
    "@react-three/postprocessing": "^2.15.11",
    "@react-spring/three": "^9.7.3",
    "three": "^0.159.0",
    "zustand": "^4.4.7",
    "framer-motion-3d": "^10.16.16"
  },
  "devDependencies": {
    "@types/three": "^0.159.0",
    "vite-plugin-glsl": "^1.1.2"
  }
}
```

Esta arquitectura te proporciona:

- **Escalabilidad**: Fácil agregar nuevas experiencias 3D
- **Mantenibilidad**: Separación clara de responsabilidades
- **Testabilidad**: Cada capa puede testearse independientemente
- **Performance**: Optimizaciones específicas para 3D
- **Type Safety**: TypeScript en toda la aplicación
- **Reutilización**: Componentes y hooks reutilizables

¿Te gustaría que profundice en algún aspecto específico de esta arquitectura?
