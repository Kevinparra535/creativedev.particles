export const dynamicFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uSpeed;
  
  void main() {
    // Colores que cambian con el tiempo usando uniforms
    vec3 color1 = uColor1;
    vec3 color2 = uColor2;
    
    // Mezcla suave entre colores usando seno
    float factor = sin(uTime * uSpeed * 0.5) * 0.5 + 0.5;
    vec3 mixedColor = mix(color1, color2, factor);
    
    // Añadir variación adicional
    float factor2 = sin(uTime * uSpeed * 0.3 + 1.57) * 0.5 + 0.5;
    mixedColor = mix(mixedColor, (color1 + color2) * 0.5, factor2 * 0.3);
    
    gl_FragColor = vec4(mixedColor, 1.0);
  }
`;