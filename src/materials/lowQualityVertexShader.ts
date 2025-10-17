export const lowQualityVertexShader = `
uniform float uTime;
uniform float uRadius;
uniform vec2 uMouse;       // world-space XY at z=0 plane
uniform float uAttract;    // [0..1]
uniform float uPointSize;  // base point size
uniform float uFalloff;    // influence radius (world units)

varying float vDistance;

mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

void main() {
  // Base rotation for subtle motion
  float distFactor = max(0.0, uRadius - distance(position, vec3(0.0)));
  distFactor = pow(distFactor + 0.0001, 1.2);

  vec3 pos = position * rotation3dY(uTime * 0.2 * (0.5 + distFactor));

  // Mouse attraction in world XY with distance-based falloff
  vec2 toMouse = uMouse - pos.xy;
  float d = length(toMouse);
  float f = 1.0 - smoothstep(0.0, uFalloff, d);
  pos.xy += toMouse * uAttract * f;

  vDistance = distFactor;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  float size = uPointSize * (0.6 + distFactor);
  gl_PointSize = size;
  gl_PointSize *= (1.0 / -viewPosition.z); // attenuation
}
`;