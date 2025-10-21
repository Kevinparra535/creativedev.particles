/**
 * @fileoverview Performance Optimization Hook
 * @author Kevin Parra Lopez - Creative Tech Lead
 * 
 * Demonstrates:
 * - Adaptive quality management
 * - Real-time performance monitoring
 * - Dynamic LOD (Level of Detail) system
 * - Memory optimization patterns
 * - FPS targeting and stabilization
 */

import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'

interface PerformanceConfig {
  targetFps: number
  minFps: number
  maxParticles: number
  minParticles: number
  qualityLevels: QualityLevel[]
  adaptiveQuality: boolean
  memoryLimit: number // MB
}

interface QualityLevel {
  name: string
  particleCount: number
  updateRate: number
  shaderComplexity: 'low' | 'medium' | 'high'
  postProcessing: boolean
}

interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  gpuMemory: number
  particleCount: number
  drawCalls: number
  currentQuality: string
}

const DEFAULT_QUALITY_LEVELS: QualityLevel[] = [
  {
    name: 'Ultra',
    particleCount: 250000,
    updateRate: 1,
    shaderComplexity: 'high',
    postProcessing: true
  },
  {
    name: 'High',
    particleCount: 100000,
    updateRate: 1,
    shaderComplexity: 'high',
    postProcessing: true
  },
  {
    name: 'Medium',
    particleCount: 50000,
    updateRate: 2,
    shaderComplexity: 'medium',
    postProcessing: false
  },
  {
    name: 'Low',
    particleCount: 25000,
    updateRate: 3,
    shaderComplexity: 'low',
    postProcessing: false
  },
  {
    name: 'Potato',
    particleCount: 10000,
    updateRate: 4,
    shaderComplexity: 'low',
    postProcessing: false
  }
]

/**
 * Advanced Performance Optimization Hook
 * Automatically adjusts quality to maintain target FPS
 */
export const usePerformanceOptimization = (config?: Partial<PerformanceConfig>) => {
  const { gl } = useThree()
  
  const fullConfig: PerformanceConfig = useMemo(() => ({
    targetFps: 60,
    minFps: 45,
    maxParticles: 250000,
    minParticles: 10000,
    qualityLevels: DEFAULT_QUALITY_LEVELS,
    adaptiveQuality: true,
    memoryLimit: 200,
    ...config
  }), [config])

  const [currentQualityIndex, setCurrentQualityIndex] = useState(1) // Start at 'High'
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    gpuMemory: 0,
    particleCount: fullConfig.qualityLevels[1].particleCount,
    drawCalls: 0,
    currentQuality: fullConfig.qualityLevels[1].name
  })

  // Performance monitoring refs
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsHistory = useRef<number[]>([])
  const adjustmentCooldown = useRef(0)
  const memoryCheckInterval = useRef(0)
  
  // GPU memory estimation
  const estimateGPUMemory = useCallback(() => {
    const info = gl.info
    // Estimate based on textures and geometries
    return (info.memory?.geometries || 0) + (info.memory?.textures || 0)
  }, [gl])

  // Get browser memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if ("memory" in performance) {
      // @ts-expect-error - performance.memory is not in all TypeScript definitions
      return performance.memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }, [])

  // Adaptive quality adjustment
  const adjustQuality = useCallback((targetDirection: 'up' | 'down') => {
    if (!fullConfig.adaptiveQuality) return

    setCurrentQualityIndex(prev => {
      const newIndex = targetDirection === 'up' 
        ? Math.max(0, prev - 1)
        : Math.min(fullConfig.qualityLevels.length - 1, prev + 1)
      
      console.log(`🎯 Quality adjusted: ${fullConfig.qualityLevels[prev].name} → ${fullConfig.qualityLevels[newIndex].name}`)
      return newIndex
    })
  }, [fullConfig])

  // Performance monitoring frame
  useFrame(() => {
    const now = performance.now()
    frameCount.current++

    // Calculate FPS every 30 frames
    if (frameCount.current % 30 === 0) {
      const fps = Math.round(30000 / (now - lastTime.current))
      lastTime.current = now

      // Update FPS history (keep last 10 measurements)
      fpsHistory.current.push(fps)
      if (fpsHistory.current.length > 10) {
        fpsHistory.current.shift()
      }

      // Calculate average FPS
      const avgFps = fpsHistory.current.reduce((sum, f) => sum + f, 0) / fpsHistory.current.length

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        fps: avgFps,
        frameTime: 1000 / avgFps,
        currentQuality: fullConfig.qualityLevels[currentQualityIndex].name,
        particleCount: fullConfig.qualityLevels[currentQualityIndex].particleCount
      }))

      // Adaptive quality adjustment (with cooldown)
      if (adjustmentCooldown.current <= 0) {
        if (avgFps < fullConfig.minFps && currentQualityIndex < fullConfig.qualityLevels.length - 1) {
          adjustQuality('down')
          adjustmentCooldown.current = 180 // 3 seconds at 60fps
        } else if (avgFps > fullConfig.targetFps + 5 && currentQualityIndex > 0) {
          adjustQuality('up')
          adjustmentCooldown.current = 300 // 5 seconds at 60fps
        }
      } else {
        adjustmentCooldown.current--
      }
    }

    // Memory check every 5 seconds
    memoryCheckInterval.current++
    if (memoryCheckInterval.current >= 300) { // 5 seconds at 60fps
      const memUsage = getMemoryUsage()
      const gpuMemory = estimateGPUMemory()
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memUsage,
        gpuMemory: gpuMemory,
        drawCalls: gl.info.render.calls
      }))

      // Memory-based quality adjustment
      if (memUsage > fullConfig.memoryLimit && currentQualityIndex < fullConfig.qualityLevels.length - 1) {
        console.warn(`⚠️ Memory limit exceeded (${memUsage.toFixed(1)}MB), reducing quality`)
        adjustQuality('down')
      }

      memoryCheckInterval.current = 0
    }
  })

  // Get current quality settings
  const currentQuality = useMemo(() => 
    fullConfig.qualityLevels[currentQualityIndex], 
    [currentQualityIndex, fullConfig.qualityLevels]
  )

  // Manual quality control
  const setQuality = useCallback((qualityName: string) => {
    const index = fullConfig.qualityLevels.findIndex(q => q.name === qualityName)
    if (index !== -1) {
      setCurrentQualityIndex(index)
    }
  }, [fullConfig.qualityLevels])

  // Performance optimization utilities
  const optimizations = useMemo(() => ({
    // Frustum culling helper
    enableFrustumCulling: (object: THREE.Object3D) => {
      object.frustumCulled = true
    },

    // Automatic LOD setup
    setupLOD: (highDetail: THREE.Object3D, mediumDetail: THREE.Object3D, lowDetail: THREE.Object3D) => {
      const lod = new THREE.LOD()
      lod.addLevel(highDetail, 0)
      lod.addLevel(mediumDetail, 50)
      lod.addLevel(lowDetail, 100)
      return lod
    },

    // Dispose geometry/material helper
    dispose: (object: THREE.Object3D) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              for (const material of child.material) {
                material.dispose()
              }
            } else {
              child.material.dispose()
            }
          }
        }
      })
    },

    // GPU instancing helper
    createInstancedMesh: (geometry: THREE.BufferGeometry, material: THREE.Material, count: number) => {
      const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      return instancedMesh
    }
  }), [])

  return {
    metrics,
    currentQuality,
    setQuality,
    adjustQuality,
    optimizations,
    config: fullConfig
  }
}