import glsl from "glslify";
import * as THREE from "three";

// === Tipos (igual que tu versión) ===
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

// === Estado global (legacy pattern) ===
let _renderer: THREE.WebGLRenderer | null = null;
let _scene: THREE.Scene | null = null;
let _camera: THREE.Camera | null = null;
let _mesh: THREE.Mesh | null = null;
let _copyMaterial: THREE.RawShaderMaterial | null = null;

// Mantengo estas dos por compatibilidad (aunque ya no se usan para prefijar)
const _rawShaderPrefix = "";
let _vertexShader = "";

// === Exposed accessors (legacy names via getters) ===
let _rawPrefixPublic = "";
let _vertexShaderPublic = "";
let _copyMaterialPublic: THREE.RawShaderMaterial | null = null;

export const rawShaderPrefix = (() => _rawPrefixPublic)();
export const vertexShader = (() => _vertexShaderPublic)();
export function getCopyMaterialPublic() {
  return _copyMaterialPublic;
}

/**
 * Init (legacy signature)
 */
export function init(renderer: THREE.WebGLRenderer): void {
  if (_renderer) return;

  _renderer = renderer;

  _rawPrefixPublic =
    "precision " + _renderer.capabilities.precision + " float;\n";

  _scene = new THREE.Scene();
  _camera = new THREE.Camera();
  _camera.position.setZ(1);

  // === Shaders GLSL3 (sin #version: Three la inyecta al compilar con glslVersion: THREE.GLSL3) ===
  const COPY_VERT_GLSL3 = glsl`
precision highp float;

in vec3 position;
in vec2 uv;

out vec2 v_uv;

void main() {
    v_uv = uv;
    gl_Position = vec4(position, 1.0);
}

  `;

  const COPY_FRAG_GLSL3 = glsl`
precision highp float;

uniform sampler2D u_texture;

in vec2 v_uv;        // reemplaza 'varying' → 'in'
out vec4 outColor;   // reemplaza gl_FragColor → outColor

void main() {
    outColor = texture(u_texture, v_uv); // reemplaza texture2D → texture
}

  `;

  // Guardamos para getVertexShader() / legacy
  _vertexShader = COPY_VERT_GLSL3;
  _vertexShaderPublic = COPY_VERT_GLSL3;

  _copyMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      u_texture: { value: null as unknown as THREE.Texture },
    },
    vertexShader: COPY_VERT_GLSL3,
    fragmentShader: COPY_FRAG_GLSL3,
    glslVersion: THREE.GLSL3, // 👈 importante para GLSL3
    depthWrite: false,
    depthTest: false,
    blending: THREE.NoBlending,
    transparent: false,
  });
  _copyMaterialPublic = _copyMaterial;

  _mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), _copyMaterial);
  _scene.add(_mesh);

  // (Opcional) Aviso si no es WebGL2:
  if (!_renderer.capabilities.isWebGL2) {
    console.warn(
      "[FBO Helper] WebGL2 no detectado: GLSL3 requerirá un contexto webgl2."
    );
  }
}

/**
 * Copia de textura (legacy signature)
 */
export function copy(
  inputTexture: THREE.Texture,
  ouputTexture?: THREE.WebGLRenderTarget
): void {
  if (!_renderer || !_scene || !_camera || !_copyMaterial || !_mesh) return;
  _mesh.material = _copyMaterial;
  _copyMaterial.uniforms.u_texture.value = inputTexture;

  if (ouputTexture) {
    _renderer.setRenderTarget(ouputTexture);
    _renderer.render(_scene, _camera);
    _renderer.setRenderTarget(null);
  } else {
    _renderer.render(_scene, _camera);
  }
}

/**
 * Render con material custom (legacy signature)
 */
export function render(
  material: THREE.Material,
  renderTarget?: THREE.WebGLRenderTarget
): void {
  if (!_renderer || !_scene || !_camera || !_mesh) return;
  _mesh.material = material;

  if (renderTarget) {
    _renderer.setRenderTarget(renderTarget);
    _renderer.render(_scene, _camera);
    _renderer.setRenderTarget(null);
  } else {
    _renderer.render(_scene, _camera);
  }
}

/**
 * Estado de color (legacy)
 */
export function getColorState(): ColorState {
  const color = new THREE.Color();
  return {
    autoClearColor: _renderer!.autoClearColor,
    clearColor: _renderer!.getClearColor(color).getHex(),
    clearAlpha: _renderer!.getClearAlpha(),
  };
}

/**
 * Set estado de color (legacy)
 */
export function setColorState(state: ColorState): void {
  if (!_renderer) return;
  _renderer.setClearColor(state.clearColor, state.clearAlpha);
  _renderer.autoClearColor = state.autoClearColor;
}

/** Legacy getters */
export function getRawShaderPrefix(): string {
  return _rawShaderPrefix;
}

export function getVertexShader(): string {
  return _vertexShader;
}

export function getCopyMaterial(): THREE.RawShaderMaterial | null {
  return _copyMaterial;
}

/**
 * Crear RT (legacy signature)
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
    format: format ?? THREE.RGBFormat,
    type: type ?? THREE.UnsignedByteType,
    minFilter: minFilter ?? THREE.LinearFilter,
    magFilter: magFilter ?? THREE.LinearFilter,
    // depthBuffer: false,
    // stencilBuffer: false,
  });
  renderTarget.texture.generateMipmaps = false;
  return renderTarget;
}

/**
 * Crear RT con opciones modernas
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
  // disable mipmaps por defecto (como legacy)
  rt.texture.generateMipmaps = false;
  return rt;
}

/**
 * Ping-pong helper
 */
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
