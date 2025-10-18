import glsl from "glslify";
import * as THREE from "three";

// Complete FBO helper inspired by legacy fboHelper with all functionality

export type FBOOptions = Partial<
  Pick<
    THREE.RenderTargetOptions,
    | "wrapS"
    | "wrapT"
    | "minFilter"
    | "magFilter"
    | "format"
    | "type"
    | "depthBuffer"
    | "stencilBuffer"
  >
>;

export interface ColorState {
  autoClearColor: boolean;
  clearColor: number;
  clearAlpha: number;
}

// Global state (legacy pattern)
let _renderer: THREE.WebGLRenderer | null = null;
let _scene: THREE.Scene | null = null;
let _camera: THREE.Camera | null = null;
let _mesh: THREE.Mesh | null = null;
let _copyMaterial: THREE.RawShaderMaterial | null = null;

// Legacy-compatible global variables that get exported
let _rawShaderPrefix: string = "";
let _vertexShader: string = "";

// Legacy exports (mutable globals like in legacy)
export let rawShaderPrefix: string = "";
export let vertexShader: string = "";
export let copyMaterial = (): THREE.RawShaderMaterial | null => _copyMaterial;

/**
 * Initialize FBO helper with renderer (legacy pattern)
 * @param renderer WebGL renderer instance
 */
export function init(renderer: THREE.WebGLRenderer): void {
  // Ensure it won't be initialized twice (exact legacy check)
  if (_renderer) return;

  _renderer = renderer;

  _scene = new THREE.Scene();
  _camera = new THREE.Camera();
  _camera.position.z = 1;

  // Create vertex shader with prefix like legacy (using glslify like legacy)
  _vertexShader = glsl`
        precision highp float;

        in vec3 position;
        in vec2 uv;

        out vec2 v_uv;

        void main() {
          v_uv = uv;
          gl_Position = vec4(position, 1.0);
        }
  `;

  // Create fragment shader with prefix like legacy (using glslify like legacy)
  const fragmentShader = glsl`
      precision highp float;

      uniform sampler2D u_texture;
      in vec2 v_uv;

      out vec4 outColor;

      void main() {
        outColor = texture(u_texture, v_uv);
      }

  `;

  _copyMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      u_texture: { value: null as unknown as THREE.Texture },
    },
    vertexShader: _vertexShader,
    fragmentShader: fragmentShader,
    glslVersion: THREE.GLSL3,
  });

  // Export copyMaterial like legacy
  copyMaterial = _copyMaterial;

  _mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), _copyMaterial);
  _scene.add(_mesh);
}

/**
 * Copy texture from input to output render target (exact legacy signature)
 * @param inputTexture Source texture
 * @param ouputTexture Target render target (legacy typo preserved for compatibility)
 */
export function copy(
  inputTexture: THREE.Texture,
  ouputTexture?: THREE.WebGLRenderTarget
): void {
  if (!_mesh || !_copyMaterial) return;

  _mesh.material = _copyMaterial;
  _copyMaterial.uniforms.u_texture.value = inputTexture;

  if (ouputTexture) {
    _renderer!.setRenderTarget(ouputTexture);
    _renderer!.render(_scene!, _camera!);
    _renderer!.setRenderTarget(null);
  } else {
    _renderer!.render(_scene!, _camera!);
  }
}

/**
 * Render with custom material to render target (exact legacy signature)
 * @param material Custom material to use
 * @param renderTarget Target render target (optional, renders to screen if null)
 */
export function render(
  material: THREE.Material,
  renderTarget?: THREE.WebGLRenderTarget
): void {
  if (!_mesh) return;

  _mesh.material = material;

  if (renderTarget) {
    _renderer!.setRenderTarget(renderTarget);
    _renderer!.render(_scene!, _camera!);
    _renderer!.setRenderTarget(null);
  } else {
    _renderer!.render(_scene!, _camera!);
  }
}

/**
 * Get current renderer color state (exact legacy implementation)
 * @returns Color state object
 */
export function getColorState(): ColorState {
  return {
    autoClearColor: _renderer!.autoClearColor,
    clearColor: _renderer!.getClearColor(new THREE.Color()).getHex(),
    clearAlpha: _renderer!.getClearAlpha(),
  };
}

/**
 * Set renderer color state (exact legacy implementation)
 * @param state Color state to apply
 */
export function setColorState(state: ColorState): void {
  _renderer!.setClearColor(state.clearColor, state.clearAlpha);
  _renderer!.autoClearColor = state.autoClearColor;
}

/**
 * Get raw shader prefix (precision directive)
 * @returns Shader prefix string
 */
export function getRawShaderPrefix(): string {
  return _rawShaderPrefix;
}

/**
 * Get copy material vertex shader
 * @returns Vertex shader source
 */
export function getVertexShader(): string {
  return _vertexShader;
}

/**
 * Get copy material instance
 * @returns Copy material
 */
export function getCopyMaterial(): THREE.RawShaderMaterial | null {
  return _copyMaterial;
}

/**
 * Create render target with legacy-compatible signature
 * @param width Width (default: 1)
 * @param height Height (default: 1)
 * @param format Format (default: RGBFormat)
 * @param type Type (default: UnsignedByteType)
 * @param minFilter Min filter (default: LinearFilter)
 * @param magFilter Mag filter (default: LinearFilter)
 * @returns WebGLRenderTarget
 */
export function createRenderTarget(
  width?: number,
  height?: number,
  format?: THREE.PixelFormat,
  type?: THREE.TextureDataType,
  minFilter?: THREE.MinificationTextureFilter,
  magFilter?: THREE.MagnificationTextureFilter
): THREE.WebGLRenderTarget {
  const renderTarget = new THREE.WebGLRenderTarget(width || 1, height || 1, {
    format: format || THREE.RGBFormat,
    type: type || THREE.UnsignedByteType,
    minFilter: minFilter || THREE.LinearFilter,
    magFilter: magFilter || THREE.LinearFilter,
    // depthBuffer: false,
    // stencilBuffer: false
  });

  // Exact legacy behavior: disable mipmap generation
  renderTarget.texture.generateMipmaps = false;

  return renderTarget;
}

/**
 * Create render target with modern options interface
 * @param width Width
 * @param height Height
 * @param options Render target options
 * @returns WebGLRenderTarget
 */
export function createRenderTargetWithOptions(
  width: number,
  height: number,
  options: FBOOptions = {}
): THREE.WebGLRenderTarget {
  const rt = new THREE.WebGLRenderTarget(width, height, {
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    depthBuffer: false,
    stencilBuffer: false,
    ...options,
  });
  return rt;
}

export function createPingPong(
  width: number,
  height: number,
  options: FBOOptions = {}
) {
  const a = createRenderTargetWithOptions(width, height, options);
  const b = createRenderTargetWithOptions(width, height, options);

  let read = a;
  let write = b;

  function swap() {
    const tmp = read;
    read = write;
    write = tmp;
  }

  function resize(w: number, h: number) {
    a.setSize(w, h);
    b.setSize(w, h);
  }

  function dispose() {
    a.dispose();
    b.dispose();
  }

  return { read: () => read, write: () => write, swap, resize, dispose };
}
