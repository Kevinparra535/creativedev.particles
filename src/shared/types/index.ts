import { Vector3, Color, Object3D } from 'three'

// =====================================
// Domain Types
// =====================================

export interface Particle {
  id: string
  position: Vector3
  velocity: Vector3
  acceleration: Vector3
  life: number
  maxLife: number
  size: number
  color: Color
  mass: number
}

export interface ParticleSystemConfig {
  count: number
  emissionRate: number
  lifetime: number
  startSize: number
  endSize: number
  startColor: Color
  endColor: Color
  gravity: Vector3
  spread: number
  force: number
}

export interface Scene3DConfig {
  backgroundColor: string
  fog?: {
    color: string
    near: number
    far: number
  }
  lighting: {
    ambient: {
      color: string
      intensity: number
    }
    directional: {
      color: string
      intensity: number
      position: Vector3
    }
  }
}

// =====================================
// Application Types
// =====================================

export interface SceneState {
  currentScene: Object3D | null
  isLoading: boolean
  error: string | null
  performance: {
    fps: number
    memory: number
    triangles: number
  }
}

export interface CameraState {
  position: Vector3
  target: Vector3
  fov: number
  near: number
  far: number
  isOrbiting: boolean
}

// =====================================
// UI Types
// =====================================

export interface ParticleControlsProps {
  onConfigChange: (config: Partial<ParticleSystemConfig>) => void
  initialConfig: ParticleSystemConfig
}

export interface SceneProps {
  children?: React.ReactNode
  config?: Scene3DConfig
  onSceneReady?: (scene: Object3D) => void
}

// =====================================
// Animation Types
// =====================================

export type EasingFunction = (t: number) => number

export interface AnimationConfig {
  duration: number
  easing: EasingFunction
  loop: boolean
  pingPong: boolean
}

export interface AnimationTarget {
  object: Object3D
  property: string
  from: number | Vector3
  to: number | Vector3
}

// =====================================
// Performance Types
// =====================================

export type DetailLevel = 'low' | 'medium' | 'high'

export interface LODConfig {
  distances: [number, number] // [medium, low] thresholds
  geometries: {
    high: THREE.BufferGeometry
    medium: THREE.BufferGeometry
    low: THREE.BufferGeometry
  }
}

// =====================================
// Event Types
// =====================================

export interface ParticleEvent {
  type: 'created' | 'updated' | 'destroyed'
  particleId: string
  timestamp: number
}

export interface SceneEvent {
  type: 'loaded' | 'updated' | 'error'
  sceneId?: string
  data?: any
  timestamp: number
}

// =====================================
// Utility Types
// =====================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>