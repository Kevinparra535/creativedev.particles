/**
 * @fileoverview Performance-Optimized Shaders
 * @author Kevin Parra Lopez - Creative Tech Lead
 * 
 * Optimized for 60fps+ performance:
 * - Reduced mathematical operations
 * - Efficient color calculations  
 * - Mobile-friendly precision
 * - GPU-optimized algorithms
 */

// High-performance vertex shader with optimizations
export const performanceVertexShader = `
  uniform sampler2D uPositions;
  uniform float uTime;
  uniform vec2 uResolution;
  
  // Optimized attributes
  attribute vec3 position;
  
  void main() {
    // Use efficient texture lookup
    vec3 pos = texture2D(uPositions, position.xy).xyz;

    // Simplified model transformations
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Adaptive point size based on distance (LOD)
    float distance = length(viewPosition.xyz);
    gl_PointSize = max(1.0, 3.0 / distance);
    
    // Clamp point size for performance
    gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);
  }
`;

// Ultra-fast fragment shader for maximum FPS
export const performanceFragmentShader = `
  precision mediump float;
  
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uSpeed;
  
  void main() {
    // Ultra-fast color interpolation using optimized sine
    float t = sin(uTime * uSpeed * 0.5) * 0.5 + 0.5;
    
    // Efficient linear interpolation
    vec3 color = mix(uColor1, uColor2, t);
    
    // Simple circular particle shape for performance
    vec2 center = gl_PointCoord - 0.5;
    float dist = dot(center, center);
    
    // Fast fade-out calculation
    float alpha = 1.0 - smoothstep(0.0, 0.25, dist);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Mobile-optimized low-precision shader
export const mobileOptimizedFragmentShader = `
  precision lowp float;
  
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  
  void main() {
    // Simplified color calculation for mobile devices
    float t = fract(uTime * 0.1); // Use fract for efficiency
    vec3 color = mix(uColor1, uColor2, t);
    
    // Simple square particle for maximum performance
    gl_FragColor = vec4(color, 0.8);
  }
`;

// Quality-adaptive shader selection
export const getOptimizedShaders = (quality: 'ultra' | 'high' | 'medium' | 'low' | 'potato') => {
  switch (quality) {
    case 'ultra':
    case 'high':
      return {
        vertex: performanceVertexShader,
        fragment: performanceFragmentShader,
        precision: 'highp'
      };
    case 'medium':
      return {
        vertex: performanceVertexShader,
        fragment: performanceFragmentShader,
        precision: 'mediump'
      };
    case 'low':
    case 'potato':
      return {
        vertex: performanceVertexShader.replace('highp', 'mediump'),
        fragment: mobileOptimizedFragmentShader,
        precision: 'lowp'
      };
    default:
      return {
        vertex: performanceVertexShader,
        fragment: performanceFragmentShader,
        precision: 'mediump'
      };
  }
};