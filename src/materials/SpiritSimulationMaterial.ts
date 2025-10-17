import * as THREE from "three";
import { simulationVertexShader } from "./simulationVertexShader";
import { spiritSimulationFragment } from "./spiritSimulationFragment";

const getRandomDataSphere = (width: number, height: number) => {
  const length = width * height * 4;
  const data = new Float32Array(length);
  for (let i = 0; i < width * height; i++) {
    const stride = i * 4;
    const distance = Math.sqrt(Math.random()) * 2;
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);
    data[stride] = distance * Math.sin(theta) * Math.cos(phi);
    data[stride + 1] = distance * Math.sin(theta) * Math.sin(phi);
    data[stride + 2] = distance * Math.cos(theta);
    data[stride + 3] = Math.random(); // seed for life
  }
  return data;
};

const getRandomDataBox = (width: number, height: number) => {
  const data = new Float32Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const stride = i * 4;
    data[stride] = (Math.random() - 0.5) * 2;
    data[stride + 1] = (Math.random() - 0.5) * 2;
    data[stride + 2] = (Math.random() - 0.5) * 2;
    data[stride + 3] = Math.random();
  }
  return data;
};

class SpiritSimulationMaterial extends THREE.ShaderMaterial {
  constructor(size: number) {
    const positionsTextureA = new THREE.DataTexture(
      getRandomDataSphere(size, size),
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positionsTextureA.needsUpdate = true;

    const positionsTextureB = new THREE.DataTexture(
      getRandomDataBox(size, size),
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positionsTextureB.needsUpdate = true;

    const simulationUniforms = {
      uResolution: { value: new THREE.Vector2(size, size) },
      positionsA: { value: positionsTextureA },
      positionsB: { value: positionsTextureB },
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uDieSpeed: { value: 0.002 },
      uRadius: { value: 1 },
      uCurlSize: { value: 0.002 },
      uAttraction: { value: 1 },
      uInitAnimation: { value: 1 },
      uMouse3d: { value: new THREE.Vector3(0, 0, 0) },
    } as const;

    super({
      uniforms: simulationUniforms as unknown as {
        [k: string]: THREE.IUniform;
      },
      vertexShader: simulationVertexShader,
      fragmentShader: spiritSimulationFragment,
    });
  }
}

export default SpiritSimulationMaterial;
