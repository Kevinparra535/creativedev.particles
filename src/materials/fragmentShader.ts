export const fragmentShader = `
  void main() {
    // Cambiar este vec3 para diferentes colores base:
    // Azul original: vec3(0.34, 0.53, 0.96)
    // Rojo vibrante: vec3(1.0, 0.2, 0.4)
    // Verde neón: vec3(0.2, 1.0, 0.4)
    // Púrpura: vec3(0.8, 0.2, 1.0)
    // Naranja: vec3(1.0, 0.5, 0.1)
    vec3 color = vec3(1.0, 0.2, 0.4); // Rojo vibrante
    gl_FragColor = vec4(color, 1.0);
  }
`;
