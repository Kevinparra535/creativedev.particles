import * as THREE from "three";

// Imports nativos de Vite con ?raw (sin plugins)

// import shaderParse from "../utils/shaderParse"; // Temporarily disabled
import DefaultSettings from "../config/settings.config";
import { positionFrag, quadVert, throughFrag } from "../glsl/simulationShaders";

export class Simulator {
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  amount: number;
  scene: THREE.Scene;
  camera: THREE.Camera;
  quad: THREE.Mesh;
  copyMat: THREE.RawShaderMaterial;
  positionMat: THREE.RawShaderMaterial;
  defaultSeed: THREE.DataTexture;
  rtA: THREE.WebGLRenderTarget;
  rtB: THREE.WebGLRenderTarget;
  time = 0;
  followPoint = new THREE.Vector3();
  followPointTime = 0;
  initAnimation = 0;
  rawShaderPrefix: string;
  positionRenderTarget!: THREE.WebGLRenderTarget;
  prevPositionRenderTarget!: THREE.WebGLRenderTarget;

  constructor(renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;
    this.amount = width * height;

    // Offscreen scene/camera + full-screen quad
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    (this.camera.position as any).z = 1;

    this.rawShaderPrefix = `precision ${renderer.capabilities.precision} float;\n`;

    this.copyMat = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: null as unknown as THREE.Texture },
        resolution: { value: new THREE.Vector2(width, height) },
      },
      vertexShader: quadVert,
      fragmentShader: throughFrag,
      depthWrite: false,
      glslVersion: THREE.GLSL3,
      depthTest: false,
      blending: THREE.NoBlending,
      transparent: false,
    });

    this.positionMat = new THREE.RawShaderMaterial({
      uniforms: {
        resolution: { value: new THREE.Vector2(width, height) },
        texturePosition: { value: null as unknown as THREE.Texture },
        textureDefaultPosition: { value: null as unknown as THREE.Texture },
        mouse3d: { value: new THREE.Vector3() },
        speed: { value: DefaultSettings.speed },
        dieSpeed: { value: DefaultSettings.dieSpeed },
        radius: { value: DefaultSettings.radius },
        curlSize: { value: DefaultSettings.curlSize },
        attraction: { value: DefaultSettings.attraction },
        time: { value: 0 },
        initAnimation: { value: 0 },
      },
      vertexShader: quadVert,
      fragmentShader: positionFrag,
      blending: THREE.NoBlending,
      transparent: false,
      depthWrite: false,
      depthTest: false,
      glslVersion: THREE.GLSL3,
    });

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.copyMat);
    this.scene.add(this.quad);

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

    // Seed once and copy to both RTs
    this.defaultSeed = this.createSeedTexture();
    this.copyTexture(this.defaultSeed, this.rtA);
    this.copyTexture(this.rtA.texture, this.rtB);

    this.positionRenderTarget = this.rtA;
    this.prevPositionRenderTarget = this.rtB;
  }

  private copyTexture(input: THREE.Texture, output: THREE.WebGLRenderTarget) {
    this.quad.material = this.copyMat;
    this.copyMat.uniforms.uTexture.value = input; // ← ahora existe
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
      positions[i4 + 3] = Math.random(); // life seed
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

  recreate(width: number, height: number) {
    this.rtA.dispose();
    this.rtB.dispose();

    this.width = width;
    this.height = height;
    this.amount = width * height;

    // Update uniform (legacy name)
    (this.positionMat.uniforms.resolution.value as THREE.Vector2).set(
      width,
      height
    );

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

    this.defaultSeed = this.createSeedTexture();
    this.copyTexture(this.defaultSeed, this.rtA);
    this.copyTexture(this.rtA.texture, this.rtB);

    this.positionRenderTarget = this.rtA;
    this.prevPositionRenderTarget = this.rtB;
  }

  dispose() {
    this.rtA.dispose();
    this.rtB.dispose();
    this.copyMat.dispose();
    this.positionMat.dispose();
    this.defaultSeed.dispose();
  }

  update(dt: number, mouse3d: THREE.Vector3) {
    // Legacy: desactivar autoClearColor para no borrar el RT durante ping-pong
    const autoClearColor = this.renderer.autoClearColor;
    this.renderer.autoClearColor = false;

    // Scale by dt like legacy (relative to 16.6667ms)
    const deltaRatio = dt / 16.6667;
    const u = this.positionMat.uniforms;

    // Match shader uniform names (no 'u' prefix)
    u.speed.value = DefaultSettings.speed * deltaRatio;
    u.dieSpeed.value = DefaultSettings.dieSpeed * deltaRatio;
    u.radius.value = DefaultSettings.radius;
    u.curlSize.value = DefaultSettings.curlSize;
    u.attraction.value = DefaultSettings.attraction;
    u.initAnimation.value = this.initAnimation;
    (u.time.value as number) = (u.time.value as number) + dt * 0.001;

    if (DefaultSettings.followMouse) {
      (u.mouse3d.value as THREE.Vector3).copy(mouse3d);
    } else {
      const r = DefaultSettings.isMobile ? 100 : 200;
      const h = DefaultSettings.isMobile ? 40 : 60;
      this.followPointTime += dt * 0.001 * DefaultSettings.speed;
      this.followPoint.set(
        Math.cos(this.followPointTime) * r,
        Math.cos(this.followPointTime * 4) * h,
        Math.sin(this.followPointTime * 2) * r
      );
      (u.mouse3d.value as THREE.Vector3).lerp(this.followPoint, 0.2);
    }

    // Swap RTs (read = rtB, write = rtA)
    const tmp = this.rtA;
    this.rtA = this.rtB;
    this.rtB = tmp;

    // Bind correct inputs for the sim shader like legacy
    u.textureDefaultPosition.value = this.defaultSeed;
    u.texturePosition.value = this.rtB.texture;

    this.quad.material = this.positionMat;
    this.renderer.setRenderTarget(this.rtA);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);

    // Legacy: restaurar autoClearColor
    this.renderer.autoClearColor = autoClearColor;

    this.positionRenderTarget = this.rtA;
    this.prevPositionRenderTarget = this.rtB;
  }
}

export default Simulator;

// console.debug('quadVert len', quadVert.length);
// console.debug('throughFrag len', throughFrag.length);
// console.debug('positionFrag len', positionFrag.length);
