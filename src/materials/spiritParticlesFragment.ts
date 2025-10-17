export const spiritParticlesFragment = `
precision mediump float;

varying float vLife;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
  vec3 color = mix(uColor2, uColor1, smoothstep(0.0, 0.7, vLife));
  // Soft circular alpha for point sprite
  vec2 d = gl_PointCoord - 0.5;
  float alpha = 1.0 - smoothstep(0.2, 0.5, length(d));
  gl_FragColor = vec4(color, alpha);
}
`;
