export const spiritSimulationFragment = `
uniform vec2 uResolution;
uniform sampler2D positionsA; // current positions (xyz) and life (w)
uniform sampler2D positionsB; // default positions seed
uniform float uTime;
uniform float uSpeed;
uniform float uDieSpeed;
uniform float uRadius;
uniform float uCurlSize;
uniform float uAttraction;
uniform float uInitAnimation; // 0..1
uniform vec3 uMouse3d;

// Simple curl noise placeholder (can be replaced with a real curl function)
vec3 curl(vec3 p, float t, float s) {
  float x = sin(p.y + t) * cos(p.z * s);
  float y = sin(p.z + t) * cos(p.x * s);
  float z = sin(p.x + t) * cos(p.y * s);
  return vec3(x, y, z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 positionInfo = texture2D(positionsA, uv);
  vec3 position = mix(vec3(0.0, -200.0, 0.0), positionInfo.xyz, smoothstep(0.0, 0.3, uInitAnimation));
  float life = positionInfo.w - uDieSpeed;

  vec3 followPosition = mix(vec3(0.0, -(1.0 - uInitAnimation) * 200.0, 0.0), uMouse3d, smoothstep(0.2, 0.7, uInitAnimation));

  if (life < 0.0) {
    vec4 seed = texture2D(positionsB, uv);
    position = seed.xyz * (1.0 + sin(uTime * 15.0) * 0.2 + (1.0 - uInitAnimation)) * 0.4 * uRadius;
    position += followPosition;
    life = 0.5 + fract(seed.w * 21.4131 + uTime);
  } else {
    vec3 delta = followPosition - position;
    float dist = length(delta);
    position += delta * (0.005 + life * 0.01) * uAttraction * (1.0 - smoothstep(50.0, 350.0, dist)) * uSpeed;
    position += curl(position * uCurlSize, uTime, 0.1 + (1.0 - life) * 0.1) * uSpeed;
  }

  gl_FragColor = vec4(position, life);
}
`;
