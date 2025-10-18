import * as THREE from "three";
import * as fboHelper from "../utils/fboHelper";

/**
 * Legacy-compatible Effect Composer - exact replication of effectComposer.js
 */

// Global exports like legacy (mutable variables)
export let resolution: THREE.Vector2;
export let fromRenderTarget: THREE.WebGLRenderTarget;
export let toRenderTarget: THREE.WebGLRenderTarget;
export let queue: any[] = [];

// Private state
let _renderTargetLists: Record<string, THREE.WebGLRenderTarget[]> = {};
let _renderTargetCounts: Record<string, number> = {};
const _renderTargetDefaultState = {
  depthBuffer: false,
  texture: {
    generateMipmaps: false,
  },
};

export let renderer: THREE.WebGLRenderer;
export let scene: THREE.Scene;
export let camera: THREE.Camera;

/**
 * Initialize effect composer (exact legacy signature)
 * @param rendererInstance WebGL renderer
 * @param sceneInstance Scene to render
 * @param cameraInstance Camera to use
 */
export function init(
  rendererInstance: THREE.WebGLRenderer,
  sceneInstance: THREE.Scene,
  cameraInstance: THREE.Camera
): void {
  fromRenderTarget = fboHelper.createRenderTarget();
  toRenderTarget = fboHelper.createRenderTarget();

  resolution = new THREE.Vector2();

  renderer = rendererInstance;
  scene = sceneInstance;
  camera = cameraInstance;
}

/**
 * Resize all render targets and effects (exact legacy signature)
 * @param width New width
 * @param height New height
 */
export function resize(width: number, height: number): void {
  resolution.set(width, height);

  fromRenderTarget.setSize(width, height);
  toRenderTarget.setSize(width, height);

  // Legacy behavior: update camera and renderer
  if ((camera as any).aspect !== undefined) {
    (camera as THREE.PerspectiveCamera).aspect = width / height;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }
  renderer.setSize(width, height);

  // Resize all effects in queue
  for (let i = 0, len = queue.length; i < len; i++) {
    if (queue[i].resize) {
      queue[i].resize(width, height);
    }
  }
}

/**
 * Filter function for enabled effects (exact legacy)
 * @param effect Effect to check
 * @returns Whether effect is enabled
 */
function _filterQueue(effect: any): boolean {
  return effect.enabled;
}

/**
 * Render the complete postprocessing queue (exact legacy signature)
 * @param dt Delta time
 */
export function renderQueue(dt: number): void {
  const renderableQueue = queue.filter(_filterQueue);

  if (renderableQueue.length) {
    // Render scene to toRenderTarget with depth/stencil like legacy
    toRenderTarget.depthBuffer = true;
    toRenderTarget.stencilBuffer = true;
    
    // Legacy used direct render with target
    renderer.setRenderTarget(toRenderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    
    // Legacy commented these but kept behavior
    // toRenderTarget.depthBuffer = false;
    // toRenderTarget.stencilBuffer = false;
    
    swapRenderTarget();

    // Process each effect exactly like legacy
    for (let i = 0, len = renderableQueue.length; i < len; i++) {
      const effect = renderableQueue[i];
      const isLast = i === len - 1;
      
      // Call effect.render with exact legacy signature
      effect.render(dt, fromRenderTarget, isLast);
    }
  } else {
    // No effects, render scene directly to screen
    renderer.render(scene, camera);
  }
}

/**
 * Render scene to render target (exact legacy signature)
 * @param renderTarget Target render target
 * @param sceneInstance Scene (optional, uses global)
 * @param cameraInstance Camera (optional, uses global)
 */
export function renderScene(
  renderTarget?: THREE.WebGLRenderTarget,
  sceneInstance?: THREE.Scene,
  cameraInstance?: THREE.Camera
): void {
  const targetScene = sceneInstance || scene;
  const targetCamera = cameraInstance || camera;
  
  if (renderTarget) {
    renderer.setRenderTarget(renderTarget);
    renderer.render(targetScene, targetCamera);
    renderer.setRenderTarget(null);
  } else {
    renderer.render(targetScene, targetCamera);
  }
}

/**
 * Render with material to render target (exact legacy signature)
 * @param material Material to render with
 * @param toScreen Whether to render to screen (undefined = to render target)
 * @returns fromRenderTarget after swap
 */
export function render(
  material: THREE.Material,
  toScreen?: boolean
): THREE.WebGLRenderTarget {
  fboHelper.render(material, toScreen ? undefined : toRenderTarget);
  swapRenderTarget();
  return fromRenderTarget;
}

/**
 * Swap render targets (exact legacy implementation)
 */
export function swapRenderTarget(): void {
  const tmp = toRenderTarget;
  toRenderTarget = fromRenderTarget;
  fromRenderTarget = tmp;
}

/**
 * Get render target from pool (exact legacy signature)
 * @param bitShift Bit shift for resolution scaling
 * @param isRGBA Whether to use RGBA format
 * @returns Render target from pool
 */
export function getRenderTarget(
  bitShift: number = 0,
  isRGBA: boolean = false
): THREE.WebGLRenderTarget {
  const width = resolution.x >> bitShift;
  const height = resolution.y >> bitShift;
  const isRGBANum = +(isRGBA || false);
  const id = bitShift + '_' + isRGBANum;
  const list = _getRenderTargetList(id);
  
  let renderTarget: THREE.WebGLRenderTarget;
  
  if (list.length) {
    renderTarget = list.pop()!;
    Object.assign(renderTarget, _renderTargetDefaultState);
  } else {
    renderTarget = fboHelper.createRenderTarget(
      width, 
      height, 
      isRGBA ? THREE.RGBAFormat : THREE.RGBFormat
    );
    (renderTarget as any)._listId = id;
    _renderTargetCounts[id] = _renderTargetCounts[id] || 0;
  }
  
  _renderTargetCounts[id]++;

  if ((renderTarget.width !== width) || (renderTarget.height !== height)) {
    renderTarget.setSize(width, height);
  }

  return renderTarget;
}

/**
 * Release render target back to pool (exact legacy signature)
 * @param renderTargets Render targets to release
 */
export function releaseRenderTarget(
  ...renderTargets: THREE.WebGLRenderTarget[]
): void {
  for (let i = 0, len = renderTargets.length; i < len; i++) {
    const renderTarget = renderTargets[i];
    const id = (renderTarget as any)._listId;
    const list = _getRenderTargetList(id);
    let found = false;
    
    _renderTargetCounts[id]--;
    
    for (let j = 0, jlen = list.length; j < jlen; j++) {
      if (list[j] === renderTarget) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      list.push(renderTarget);
    }
  }
}

/**
 * Get render target list by ID (private helper)
 * @param id List ID
 * @returns Render target list
 */
function _getRenderTargetList(id: string): THREE.WebGLRenderTarget[] {
  return _renderTargetLists[id] || (_renderTargetLists[id] = []);
}

/**
 * Dispose all resources
 */
export function dispose(): void {
  // Dispose render targets
  fromRenderTarget?.dispose();
  toRenderTarget?.dispose();

  // Dispose pooled render targets
  Object.values(_renderTargetLists).forEach(list => {
    list.forEach(rt => rt.dispose());
  });

  // Clear state
  queue.length = 0;
  _renderTargetLists = {};
  _renderTargetCounts = {};
}

/**
 * Add effect to queue (legacy function)
 * @param effect Effect to add
 */
export function addEffect(effect: any): void {
  queue.push(effect);
}

// Default export object like legacy with getters for variables
const effectComposer = {
  get queue() { return queue; },
  get resolution() { return resolution; },
  get fromRenderTarget() { return fromRenderTarget; },
  get toRenderTarget() { return toRenderTarget; },
  get renderer() { return renderer; },
  get scene() { return scene; },
  get camera() { return camera; },
  init,
  resize,
  renderQueue,
  renderScene,
  render,
  swapRenderTarget,
  getRenderTarget,
  releaseRenderTarget,
  addEffect,
  dispose
};

export default effectComposer;