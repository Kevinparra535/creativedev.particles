export const trianglesVertex = `
uniform sampler2D texturePosition;

varying float vLife;
attribute vec3 positionFlip;
attribute vec2 fboUV;

uniform float flipRatio;

void main() {
  vec4 positionInfo = texture2D(texturePosition, fboUV);
  vec3 pos = positionInfo.xyz;
  vLife = positionInfo.w;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  // Add small triangle offset that grows with life onset
  mvPosition += vec4((position + (positionFlip - position) * flipRatio) * smoothstep(0.0, 0.2, positionInfo.w), 0.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;
