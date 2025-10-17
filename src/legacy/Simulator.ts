import * as THREE from "three";
import settings from "../config/settings.config";
import { spiritSimulationFragment } from "../materials/spiritSimulationFragment";

const quadVert = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position,1.0); }
`;

const copyFrag = `
precision highp float;
uniform sampler2D u_texture;
varying vec2 vUv;
void main(){ gl_FragColor = texture2D(u_texture, vUv); }
`;

// (No-op utility; kept minimal fullscreen via PlaneGeometry.)

export class Simulator {
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  amount: number;
  scene: THREE.Scene;
  camera: THREE.Camera;
  quad: THREE.Mesh;
  copyMat: THREE.ShaderMaterial;
  positionMat: THREE.ShaderMaterial;
  defaultSeed: THREE.DataTexture;
  rtA: THREE.WebGLRenderTarget;
  rtB: THREE.WebGLRenderTarget;
  time = 0;
  followPoint = new THREE.Vector3();
  followPointTime = 0;
  initAnimation = 0;

  positionRenderTarget!: THREE.WebGLRenderTarget;
  prevPositionRenderTarget!: THREE.WebGLRenderTarget;

  constructor(renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;
    this.amount = width * height;

    // Setup offscreen scene/camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    (this.camera.position as any).z = 1;

    // Materials
    this.copyMat = new THREE.ShaderMaterial({
      uniforms: { u_texture: { value: null as unknown as THREE.Texture } },
      vertexShader: quadVert,
      fragmentShader: copyFrag,
      depthWrite: false,
      depthTest: false,
    });
    this.positionMat = new THREE.ShaderMaterial({
      uniforms: {
        uResolution: { value: new THREE.Vector2(width, height) },
        positionsA: { value: null as unknown as THREE.Texture },
        positionsB: { value: null as unknown as THREE.Texture },
        uTime: { value: 0 },
        uSpeed: { value: settings.speed },
        uDieSpeed: { value: settings.dieSpeed },
        uRadius: { value: settings.radius },
        uCurlSize: { value: settings.curlSize },
        uAttraction: { value: settings.attraction },
        uInitAnimation: { value: 0 },
        uMouse3d: { value: new THREE.Vector3() },
      },
      vertexShader: quadVert,
      fragmentShader: spiritSimulationFragment,
      blending: THREE.NoBlending,
      transparent: false,
      depthWrite: false,
      depthTest: false,
    });

    // Fullscreen quad
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.copyMat);
    this.scene.add(this.quad);

    // Render targets
    this.rtA = new THREE.WebGLRenderTarget(width, height, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.rtB = this.rtA.clone();

    // Seed positionsB and copy to both RTs
    this.defaultSeed = this.createSeedTexture();
    this.copyTexture(this.defaultSeed, this.rtA);
    this.copyTexture(this.rtA.texture, this.rtB);

    this.positionRenderTarget = this.rtA;
    this.prevPositionRenderTarget = this.rtB;
  }

  private copyTexture(input: THREE.Texture, output: THREE.WebGLRenderTarget) {
    this.quad.material = this.copyMat;
    this.copyMat.uniforms.u_texture.value = input;
    this.renderer.setRenderTarget(output);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  private createSeedTexture() {
    const positions = new Float32Array(this.amount * 4);
    for (let i = 0; i < this.amount; i++) {
      const i4 = i * 4;
      const r = (0.5 + Math.random() * 0.5) * 50;
      const phi = (Math.random() - 0.5) * Math.PI;
      const theta = Math.random() * Math.PI * 2;
      positions[i4 + 0] = r * Math.cos(theta) * Math.cos(phi);
      positions[i4 + 1] = r * Math.sin(phi);
      positions[i4 + 2] = r * Math.sin(theta) * Math.cos(phi);
      positions[i4 + 3] = Math.random();
    }
    const texture = new THREE.DataTexture(
      positions,
      this.width,
      this.height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;
    return texture;
  }

  update(dt: number, mouse3d: THREE.Vector3) {
    if (!(settings.speed || settings.dieSpeed)) {
      return;
    }

    // Scale by dt like legacy (relative to ~16.6667ms)
    const deltaRatio = dt / 16.6667;
    const uniforms = this.positionMat.uniforms;
    uniforms.uSpeed.value = settings.speed * deltaRatio;
    uniforms.uDieSpeed.value = settings.dieSpeed * deltaRatio;
    uniforms.uRadius.value = settings.radius;
    uniforms.uCurlSize.value = settings.curlSize;
    uniforms.uAttraction.value = settings.attraction;
    uniforms.uInitAnimation.value = this.initAnimation;

    if (settings.followMouse) {
      (uniforms.uMouse3d.value as THREE.Vector3).copy(mouse3d);
    } else {
      const isMobile = settings.isMobile;
      const r = isMobile ? 100 : 200;
      const h = isMobile ? 40 : 60;
      this.followPointTime += dt * 0.001 * settings.speed;
      this.followPoint.set(
        Math.cos(this.followPointTime) * r,
  Math.cos(this.followPointTime * 4) * h,
  Math.sin(this.followPointTime * 2) * r
      );
      (uniforms.uMouse3d.value as THREE.Vector3).lerp(this.followPoint, 0.2);
    }

    // Swap
    const tmp = this.rtA;
    this.rtA = this.rtB;
    this.rtB = tmp;

    // Render position shader: read prev (rtB), write to rtA
    this.quad.material = this.positionMat;
    uniforms.positionsB.value = this.defaultSeed;
    uniforms.positionsA.value = this.rtB.texture;
    uniforms.uTime.value = (uniforms.uTime.value as number) + dt * 0.001;
    this.renderer.setRenderTarget(this.rtA);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // Expose like legacy
    this.positionRenderTarget = this.rtA;
    this.prevPositionRenderTarget = this.rtB;
  }
}

export default Simulator;
