import * as THREE from "three";
import * as fboHelper from "../utils/fboHelper";
import Effect from "./Effect";

/**
 * Legacy-compatible Effect Composer for postprocessing pipeline
 */
class EffectComposer {
  queue: Effect[] = [];
  fromRenderTarget?: THREE.WebGLRenderTarget;
  toRenderTarget?: THREE.WebGLRenderTarget;
  resolution: THREE.Vector2 = new THREE.Vector2();
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
  camera?: THREE.Camera;

  private renderTargetLists: Record<string, THREE.WebGLRenderTarget[]> = {};
  private renderTargetCounts: Record<string, number> = {};
  private renderTargetDefaultState = {
    depthBuffer: false,
    texture: {
      generateMipmaps: false,
    },
  };

  /**
   * Initialize effect composer
   * @param renderer WebGL renderer
   * @param scene Scene to render
   * @param camera Camera to use
   */
  init(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.fromRenderTarget = fboHelper.createRenderTarget();
    this.toRenderTarget = fboHelper.createRenderTarget();

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }

  /**
   * Resize all render targets and effects
   * @param width New width
   * @param height New height
   */
  resize(width: number, height: number) {
    this.resolution.set(width, height);

    if (this.fromRenderTarget) {
      this.fromRenderTarget.setSize(width, height);
    }
    if (this.toRenderTarget) {
      this.toRenderTarget.setSize(width, height);
    }

    // Legacy behavior: update camera and renderer
    if (this.camera && "aspect" in this.camera) {
      (this.camera as THREE.PerspectiveCamera).aspect = width / height;
      (this.camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }

    // Resize all render targets in pools
    Object.values(this.renderTargetLists).forEach((list) => {
      list.forEach((rt) => rt.setSize(width, height));
    });

    // Resize all effects
    this.queue.forEach((effect) => effect.resize(width, height));
  }

  /**
   * Render the complete postprocessing queue
   * @param _dt Delta time (not used but matches legacy signature)
   */
  renderQueue(_dt: number) {
    if (!this.renderer || !this.scene || !this.camera) return;

    // Filter enabled effects like legacy
    const renderableQueue = this.queue.filter((effect) => effect.enabled);

    if (renderableQueue.length > 0) {
      // Render scene to toRenderTarget with depth/stencil like legacy
      if (this.toRenderTarget) {
        this.toRenderTarget.depthBuffer = true;
        this.toRenderTarget.stencilBuffer = true;
        this.renderer.setRenderTarget(this.toRenderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
        // Reset depth/stencil for effects
        // this.toRenderTarget.depthBuffer = false;
        // this.toRenderTarget.stencilBuffer = false;
      }

      // Swap to start with scene in fromRenderTarget
      this.swapRenderTarget();

      // Process each enabled effect
      for (let i = 0; i < renderableQueue.length; i++) {
        const effect = renderableQueue[i];
        const isLast = i === renderableQueue.length - 1;

        // Set effect's input texture
        if (effect.uniforms.u_texture && this.fromRenderTarget) {
          effect.uniforms.u_texture.value = this.fromRenderTarget.texture;
        }

        // Render effect with legacy-style flow
        if (isLast) {
          // Last effect renders to screen
          if (effect.material) {
            fboHelper.render(effect.material);
          }
        } else {
          // Intermediate effects render to toRenderTarget, then swap
          if (effect.material && this.toRenderTarget) {
            fboHelper.render(effect.material, this.toRenderTarget);
            this.swapRenderTarget();
          }
        }
      }
    } else {
      // No effects, render scene directly to screen
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Render with material to render target (legacy-compatible)
   * @param material Material to render with
   * @param toScreen Whether to render to screen
   * @returns fromRenderTarget after swap
   */
  render(
    material: THREE.Material,
    toScreen?: boolean
  ): THREE.WebGLRenderTarget | undefined {
    if (toScreen) {
      fboHelper.render(material);
    } else {
      fboHelper.render(material, this.toRenderTarget);
      this.swapRenderTarget();
    }
    return this.fromRenderTarget;
  }

  /**
   * Render scene to render target (legacy-compatible)
   * @param renderTarget Target render target (optional)
   * @param scene Scene to render (optional, uses default)
   * @param camera Camera to use (optional, uses default)
   */
  renderScene(
    renderTarget?: THREE.WebGLRenderTarget,
    scene?: THREE.Scene,
    camera?: THREE.Camera
  ) {
    const sceneToRender = scene || this.scene;
    const cameraToRender = camera || this.camera;

    if (!this.renderer || !sceneToRender || !cameraToRender) return;

    if (renderTarget) {
      this.renderer.setRenderTarget(renderTarget);
      this.renderer.render(sceneToRender, cameraToRender);
      this.renderer.setRenderTarget(null);
    } else {
      this.renderer.render(sceneToRender, cameraToRender);
    }
  }

  /**
   * Swap fromRenderTarget and toRenderTarget
   */
  swapRenderTarget() {
    const temp = this.fromRenderTarget;
    this.fromRenderTarget = this.toRenderTarget;
    this.toRenderTarget = temp;
  }

  /**
   * Get render target from pool (legacy-compatible signature)
   * @param bitShift Bit shift for resolution scaling (0 = full res, 1 = half res, etc.)
   * @param isRGBA Whether to use RGBA format (vs RGB)
   * @returns Render target from pool
   */
  getRenderTarget(
    bitShift: number = 0,
    isRGBA: boolean = false
  ): THREE.WebGLRenderTarget {
    const width = this.resolution.x >> bitShift;
    const height = this.resolution.y >> bitShift;
    const id = `${bitShift}_${isRGBA ? 1 : 0}`;

    let list = this.renderTargetLists[id];
    if (!list) {
      list = this.renderTargetLists[id] = [];
      this.renderTargetCounts[id] = 0;
    }

    let renderTarget: THREE.WebGLRenderTarget;

    if (list.length > 0) {
      // Reuse existing render target from pool
      renderTarget = list.pop()!;
      // Apply default state like legacy
      Object.assign(renderTarget, this.renderTargetDefaultState);
    } else {
      // Create new render target
      const format = isRGBA ? THREE.RGBAFormat : THREE.RGBFormat;
      renderTarget = fboHelper.createRenderTarget(width, height, format);
      (renderTarget as any)._listId = id;
    }

    // Track usage count
    this.renderTargetCounts[id] = (this.renderTargetCounts[id] || 0) + 1;

    // Resize if needed
    if (renderTarget.width !== width || renderTarget.height !== height) {
      renderTarget.setSize(width, height);
    }

    return renderTarget;
  }

  /**
   * Release render target back to pool (legacy-compatible)
   * @param renderTargets Render targets to release
   */
  releaseRenderTarget(...renderTargets: THREE.WebGLRenderTarget[]) {
    for (const renderTarget of renderTargets) {
      const id = (renderTarget as any)._listId;
      if (!id) continue;

      const list = this.renderTargetLists[id];
      if (!list) continue;

      this.renderTargetCounts[id]--;

      // Check if already in pool to avoid duplicates
      if (!list.includes(renderTarget)) {
        list.push(renderTarget);
      }
    }
  }

  /**
   * Modern get render target method (for compatibility)
   * @param key Pool key
   * @param index Index in pool
   * @returns Render target
   */
  getRenderTargetModern(
    key: string,
    index: number = 0
  ): THREE.WebGLRenderTarget {
    if (!this.renderTargetLists[key]) {
      this.renderTargetLists[key] = [];
      this.renderTargetCounts[key] = 0;
    }

    const list = this.renderTargetLists[key];

    if (index >= list.length) {
      // Create new render target
      const rt = fboHelper.createRenderTarget(
        this.resolution.x || 1,
        this.resolution.y || 1
      );

      // Apply default state
      rt.depthBuffer = this.renderTargetDefaultState.depthBuffer;
      rt.texture.generateMipmaps =
        this.renderTargetDefaultState.texture.generateMipmaps;

      list.push(rt);
    }

    this.renderTargetCounts[key] = Math.max(
      this.renderTargetCounts[key],
      index + 1
    );
    return list[index];
  }

  /**
   * Release render target back to pool (modern version)
   * @param key Pool key
   */
  releaseRenderTargetModern(key: string) {
    this.renderTargetCounts[key] = 0;
  }

  /**
   * Add effect to queue
   * @param effect Effect to add
   */
  addEffect(effect: Effect) {
    this.queue.push(effect);
  }

  /**
   * Remove effect from queue
   * @param effect Effect to remove
   */
  removeEffect(effect: Effect) {
    const index = this.queue.indexOf(effect);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Clear all effects
   */
  clear() {
    this.queue.length = 0;
  }

  /**
   * Dispose all resources
   */
  dispose() {
    // Dispose render targets
    this.fromRenderTarget?.dispose();
    this.toRenderTarget?.dispose();

    // Dispose pooled render targets
    Object.values(this.renderTargetLists).forEach((list) => {
      list.forEach((rt) => rt.dispose());
    });

    // Dispose effects
    this.queue.forEach((effect) => effect.dispose());

    this.clear();
  }
}

// Create singleton instance like legacy
const effectComposer = new EffectComposer();
export default effectComposer;
