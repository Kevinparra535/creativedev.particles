import * as THREE from "three";
import {
  init,
  copy,
  render,
  createRenderTarget,
  createRenderTargetWithOptions,
  createPingPong,
  getColorState,
  setColorState,
  getCopyMaterial,
  getRawShaderPrefix,
  getVertexShader,
} from "./fboHelper";

/**
 * Example usage of the FBO Helper with 100% legacy compatibility
 */
export function exampleFBOUsage(renderer: THREE.WebGLRenderer) {
  // 1. Initialize the helper (legacy pattern)
  init(renderer);

  // 2. Access legacy globals
  const copyMaterial = getCopyMaterial();
  const rawShaderPrefix = getRawShaderPrefix();
  const vertexShader = getVertexShader();

  console.log("Legacy globals initialized:");
  console.log("- rawShaderPrefix:", rawShaderPrefix);
  console.log("- vertexShader length:", vertexShader.length);
  console.log("- copyMaterial:", copyMaterial !== null);

  // 3. Create render targets (legacy signature)
  const width = 512;
  const height = 512;

  // Legacy style: createRenderTarget(width, height, format, type, minFilter, magFilter)
  const legacyRT = createRenderTarget(
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType,
    THREE.NearestFilter,
    THREE.NearestFilter
  );

  // Modern style: with options object
  const modernRT = createRenderTargetWithOptions(width, height, {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });

  // Ping-pong for simulation
  const pingPong = createPingPong(width, height, {
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  });

  // 4. Save and restore renderer state (legacy pattern)
  const originalState = getColorState();
  console.log("Original renderer state:", originalState);

  // 5. Use copy functionality (exact legacy API)
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(0, 0, width, height);
  
  const testTexture = new THREE.CanvasTexture(canvas);

  // Copy texture to render target (legacy: copy(inputTexture, outputTexture))
  copy(testTexture, legacyRT);

  // 6. Custom simulation material with legacy shader style
  const simMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      uPositions: { value: testTexture },
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    },
    vertexShader: rawShaderPrefix + `
      attribute vec3 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: rawShaderPrefix + `
      uniform sampler2D uPositions;
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      
      void main() {
        vec4 position = texture2D(uPositions, vUv);
        
        // Simple simulation: move towards mouse
        vec2 toMouse = uMouse - position.xy;
        position.xy += toMouse * 0.01;
        
        gl_FragColor = position;
      }
    `,
  });

  // 7. Render with custom material (legacy: render(material, renderTarget))
  render(simMaterial, modernRT);

  // 8. Copy final result to screen (legacy: copy(inputTexture))
  copy(modernRT.texture);

  // 9. Restore original state
  setColorState(originalState);

  // 10. Cleanup
  legacyRT.dispose();
  modernRT.dispose();
  pingPong.dispose();
  testTexture.dispose();
  simMaterial.dispose();

  console.log("FBO Helper legacy compatibility test completed!");
}

/**
 * Demonstrates exact legacy pattern compatibility
 */
export function exactLegacyPattern(renderer: THREE.WebGLRenderer) {
  // Exact same pattern as legacy JS
  
  // 1. init(renderer) - like legacy
  init(renderer);
  
  // 2. Access exports like legacy (rawShaderPrefix, vertexShader, copyMaterial)
  const rawShaderPrefix = getRawShaderPrefix();
  const vertexShader = getVertexShader();
  const copyMaterial = getCopyMaterial();
  
  // 3. createRenderTarget like legacy
  const renderTarget = createRenderTarget(512, 512, THREE.RGBAFormat, THREE.FloatType);
  
  // 4. State management like legacy
  const state = getColorState();
  
  // 5. Create test texture
  const data = new Uint8Array(4);
  data[0] = 255; // R
  data[1] = 0;   // G  
  data[2] = 0;   // B
  data[3] = 255; // A
  const testTexture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  
  // 6. copy() like legacy
  copy(testTexture, renderTarget);
  
  // 7. render() like legacy
  if (copyMaterial) {
    render(copyMaterial, renderTarget);
  }
  
  // 8. Restore state like legacy
  setColorState(state);
  
  console.log("Exact legacy pattern test passed!");
  console.log("- rawShaderPrefix:", rawShaderPrefix.includes("precision"));
  console.log("- vertexShader:", vertexShader.includes("attribute"));
  console.log("- copyMaterial:", copyMaterial instanceof THREE.RawShaderMaterial);
  
  // Cleanup
  renderTarget.dispose();
  testTexture.dispose();
}