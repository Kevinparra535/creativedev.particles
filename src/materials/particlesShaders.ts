// Legacy-inspired particle shaders for points and triangles

export const pointsVertexShader = /* glsl */ `
precision highp float;
uniform sampler2D texturePosition;
varying float vLife;
void main(){
  vec2 uv = position.xy;
  vec4 info = texture2D(texturePosition, uv);
  vLife = info.w;
  vec4 modelPosition = modelMatrix * vec4(info.xyz, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
  float d = length(viewPosition.xyz);
  gl_PointSize = 1300.0 / max(0.0001, d) * smoothstep(0.0, 0.2, vLife);
}
`;

export const particlesFragmentShader = /* glsl */ `
precision highp float;
varying float vLife;
uniform vec3 color1; uniform vec3 color2;
void main(){
  vec3 col = mix(color2, color1, smoothstep(0.0, 0.7, vLife));
  vec2 d = gl_PointCoord - 0.5;
  float alpha = 1.0 - smoothstep(0.2, 0.5, length(d));
  gl_FragColor = vec4(col, alpha);
}
`;

// Triangles: billboarded in view space, with flipRatio alternating orientation
export const trianglesVertexShader = /* glsl */ `
precision highp float;
uniform sampler2D texturePosition;
uniform float flipRatio; // 0 or 1 toggled per frame
uniform float size;
attribute vec3 positionFlip; // alternate triangle orientation
attribute vec2 fboUV; // lookup uv for particle position
varying float vLife;
void main(){
  // choose base triangle in object space (treated as view-space offsets)
  vec3 base = mix(position, positionFlip, step(0.5, mod(flipRatio, 2.0)));
  vec4 info = texture2D(texturePosition, fboUV);
  vLife = info.w;
  // center of the particle in view space
  vec4 centerView = viewMatrix * modelMatrix * vec4(info.xyz, 1.0);
  // add triangle offset in view space (billboard)
  vec4 viewPos = centerView + vec4(base.xy * size, 0.0, 0.0);
  gl_Position = projectionMatrix * viewPos;
}
`;

export const trianglesFragmentShader = /* glsl */ `
precision highp float;
varying float vLife;
uniform vec3 color1; uniform vec3 color2;
void main(){
  vec3 col = mix(color2, color1, smoothstep(0.0, 0.7, vLife));
  gl_FragColor = vec4(col, 1.0);
}
`;
