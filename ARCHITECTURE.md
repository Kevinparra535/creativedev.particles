# Arquitectura del Proyecto - creativedev.particles

## Visión General

Arquitectura basada en Clean Architecture + SOLID para experiencias 3D inmersivas con React Three Fiber.

## Principios Arquitectónicos

### 1. **Clean Architecture Layers**

```
┌─────────────────────────────────────┐
│           UI Layer (React)          │  ← Components, Hooks
├─────────────────────────────────────┤
│        Application Layer            │  ← Use Cases, Stores
├─────────────────────────────────────┤
│         Domain Layer                │  ← Entities, Services
├─────────────────────────────────────┤
│      Infrastructure Layer           │  ← Three.js, APIs
└─────────────────────────────────────┘
```

### 2. **SOLID Principles Application**

- **S**ingle Responsibility: Cada componente 3D tiene una responsabilidad específica
- **O**pen/Closed: Extensible vía composición de componentes
- **L**iskov Substitution: Interfaces consistentes para objetos 3D
- **I**nterface Segregation: Hooks específicos por funcionalidad
- **D**ependency Inversion: Abstracciones sobre implementaciones concretas

## Estructura de Carpetas Propuesta

```
src/
├── app/                          # Application Layer
│   ├── stores/                   # Estado global (Zustand)
│   │   ├── scene.store.ts       # Estado de la escena 3D
│   │   ├── camera.store.ts      # Control de cámara
│   │   └── performance.store.ts # Métricas de rendimiento
│   └── use-cases/               # Casos de uso de la aplicación
│       ├── scene-management/
│       ├── particle-control/
│       └── camera-control/
│
├── domain/                      # Domain Layer
│   ├── entities/               # Entidades del dominio
│   │   ├── ParticleSystem.ts   # Entidad sistema de partículas
│   │   ├── Scene3D.ts          # Entidad escena 3D
│   │   └── Camera.ts           # Entidad cámara
│   ├── services/               # Servicios del dominio
│   │   ├── ParticleService.ts  # Lógica de partículas
│   │   ├── PhysicsService.ts   # Lógica de física
│   │   └── AnimationService.ts # Lógica de animaciones
│   └── repositories/           # Interfaces de repositorios
│       └── ISceneRepository.ts
│
├── infrastructure/             # Infrastructure Layer
│   ├── three/                 # Implementaciones Three.js
│   │   ├── loaders/          # Carga de assets 3D
│   │   ├── materials/        # Materiales y shaders
│   │   ├── geometries/       # Geometrías custom
│   │   └── renderers/        # Configuraciones de renderer
│   ├── repositories/         # Implementaciones de repositorios
│   └── external/            # APIs externas, archivos
│
├── presentation/              # UI Layer (React)
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes UI puros
│   │   ├── experience/      # Componentes de experiencia 3D
│   │   │   ├── Scene.tsx    # Componente escena principal
│   │   │   ├── Camera.tsx   # Componente cámara
│   │   │   └── Effects.tsx  # Post-processing effects
│   │   └── particles/       # Componentes específicos de partículas
│   ├── hooks/              # Custom hooks
│   │   ├── useParticles.ts # Hook para partículas
│   │   ├── useScene3D.ts   # Hook para escena
│   │   └── usePhysics.ts   # Hook para física
│   └── layouts/            # Layouts de la aplicación
│
├── shared/                   # Código compartido
│   ├── constants/           # Constantes del proyecto
│   ├── types/              # Tipos TypeScript
│   ├── utils/              # Utilidades puras
│   └── config/             # Configuraciones
│
└── assets/                  # Recursos estáticos
    ├── models/             # Modelos 3D (.gltf, .fbx)
    ├── textures/           # Texturas
    ├── shaders/            # Shaders GLSL
    └── audio/              # Archivos de audio
```

## Patrones de Diseño Implementados

### 1. **Repository Pattern**

```typescript
// domain/repositories/ISceneRepository.ts
interface ISceneRepository {
  loadScene(id: string): Promise<Scene3D>;
  saveScene(scene: Scene3D): Promise<void>;
  getSceneMetadata(id: string): Promise<SceneMetadata>;
}
```

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
