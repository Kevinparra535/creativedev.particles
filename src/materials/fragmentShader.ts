export const fragmentShader = `
precision mediump float;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = 1.0 - smoothstep(0.2, 0.5, d);
  vec3 color = vec3(1.0);
  gl_FragColor = vec4(color, alpha);
}
`;
