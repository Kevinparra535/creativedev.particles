export const spiritParticlesVertex = `
uniform sampler2D uPositions;
uniform float uPointScale; // e.g., 1300.0

varying float vLife;

void main() {
  vec4 positionInfo = texture2D(uPositions, position.xy);
  vec3 pos = positionInfo.xyz;
  vLife = positionInfo.w;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  float dist = length(viewPosition.xyz);
  float lifeFactor = smoothstep(0.0, 0.2, vLife);
  gl_PointSize = (uPointScale / max(0.0001, dist)) * lifeFactor;
}
`;
