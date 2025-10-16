export const positionBasedFragmentShader = `
  uniform float uTime;
  uniform vec3 uCenterColor;
  uniform vec3 uEdgeColor;
  varying vec3 vPosition;
  
  void main() {
    // Usar la posición de la partícula para generar colores únicos
    vec3 normalizedPos = normalize(vPosition);
    
    // Colores basados en distancia del centro
    float distance = length(vPosition);
    vec3 centerColor = uCenterColor;
    vec3 edgeColor = uEdgeColor;
    vec3 colorByDistance = mix(centerColor, edgeColor, smoothstep(0.0, 2.0, distance));
    
    // Añadir efecto de arcoíris basado en ángulo
    float hue = atan(normalizedPos.z, normalizedPos.x) / (2.0 * 3.14159) + 0.5;
    vec3 rainbowColor = vec3(
      abs(hue * 6.0 - 3.0) - 1.0,
      2.0 - abs(hue * 6.0 - 2.0),
      2.0 - abs(hue * 6.0 - 4.0)
    );
    rainbowColor = clamp(rainbowColor, 0.0, 1.0);
    
    // Combinar colores con efecto sutil de arcoíris
    vec3 finalColor = mix(colorByDistance, rainbowColor, 0.2);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const positionBasedVertexShader = `
  uniform sampler2D uPositions;
  uniform float uTime;
  varying vec3 vPosition;

  void main() {
    vec3 pos = texture2D(uPositions, position.xy).xyz;
    vPosition = pos; // Pasar posición al fragment shader

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = 3.0;
    // Size attenuation;
    gl_PointSize *= step(1.0 - (1.0/64.0), position.x) + 0.5;
  }
`;