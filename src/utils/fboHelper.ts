import * as THREE from "three";

// Small helper inspired by legacy fboHelper: create ping-pong FBOs and swap.

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

export function createRenderTarget(
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
  const a = createRenderTarget(width, height, options);
  const b = createRenderTarget(width, height, options);

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
