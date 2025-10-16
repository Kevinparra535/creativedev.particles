# 🎨 Guía Rápida: Cambiar Colores de Partículas

## 🚀 **Método 1: Cambio Simple (Recomendado)**

### Paso 1: Editar el Fragment Shader
Archivo: `src/materials/fragmentShader.ts`

```typescript
export const fragmentShader = `
  void main() {
    // 🎨 CAMBIA ESTOS VALORES:
    vec3 color = vec3(R, G, B); // Valores entre 0.0 y 1.0
    gl_FragColor = vec4(color, 1.0);
  }
`;
```

### Ejemplos de Colores:
```typescript
// Rojo vibrante
vec3 color = vec3(1.0, 0.2, 0.4);

// Verde neón  
vec3 color = vec3(0.2, 1.0, 0.4);

// Azul eléctrico
vec3 color = vec3(0.2, 0.4, 1.0);

// Púrpura místico
vec3 color = vec3(0.8, 0.2, 1.0);

// Naranja fuego
vec3 color = vec3(1.0, 0.5, 0.1);

// Cian brillante
vec3 color = vec3(0.0, 1.0, 1.0);
```

---

## 🌈 **Método 2: Colores Dinámicos**

### Paso 1: Usar el shader dinámico
En tu componente `R3FCanva.tsx`, cambia el import:

```typescript
// Cambiar de:
import { fragmentShader } from "../../materials/fragmentShader";

// A:
import { dynamicFragmentShader } from "../../materials/dynamicFragmentShader";
```

### Paso 2: Actualizar uniforms
```typescript
const uniforms = useMemo(() => ({
  uPositions: { value: null },
  uTime: { value: 0 },
  // 🎨 COLORES PERSONALIZABLES:
  uColor1: { value: new THREE.Vector3(1, 0.2, 0.4) }, // Color 1
  uColor2: { value: new THREE.Vector3(0.2, 0.4, 1) }, // Color 2  
  uSpeed: { value: 1 }, // Velocidad de cambio
}), []);
```

### Paso 3: Usar el shader dinámico
```typescript
<shaderMaterial
  blending={THREE.AdditiveBlending}
  depthWrite={false}
  fragmentShader={dynamicFragmentShader} // ← Cambiar aquí
  vertexShader={vertexShader}
  uniforms={uniforms}
/>
```

---

## 🎯 **Método 3: Control en Tiempo Real**

Para control completo, usa el componente `ColorControlledParticles.tsx` que incluye:
- Panel de control visual
- Presets de colores
- Múltiples modos de color
- Control de velocidad

```typescript
import ColorControlledParticles from './components/ColorControlledParticles';

// En tu App.tsx:
<ColorControlledParticles />
```

---

## 🔧 **Valores de Color de Referencia**

### Conversión Hex → RGB:
```javascript
// Para convertir #FF6B35 a valores shader:
const hex = "#FF6B35";
const r = parseInt(hex.slice(1,3), 16) / 255; // 1.0
const g = parseInt(hex.slice(3,5), 16) / 255; // 0.42
const b = parseInt(hex.slice(5,7), 16) / 255; // 0.21

// Resultado: vec3(1.0, 0.42, 0.21)
```

### Paleta Creative Tech:
```glsl
// Neon Tech
vec3 electricBlue = vec3(0.0, 0.75, 1.0);
vec3 neonPink = vec3(1.0, 0.08, 0.58);
vec3 cyberGreen = vec3(0.0, 1.0, 0.25);
vec3 quantumPurple = vec3(0.6, 0.0, 1.0);

// Warm Tech  
vec3 solarOrange = vec3(1.0, 0.27, 0.0);
vec3 goldenYellow = vec3(1.0, 0.84, 0.0);
vec3 emberRed = vec3(1.0, 0.25, 0.25);

// Cool Tech
vec3 arcticBlue = vec3(0.0, 0.5, 1.0);
vec3 mintGreen = vec3(0.0, 1.0, 0.5);
vec3 deepPurple = vec3(0.3, 0.0, 0.7);
```

---

## ⚡ **Cambio Rápido (30 segundos)**

1. Abre `src/materials/fragmentShader.ts`
2. Cambia la línea: `vec3 color = vec3(R, G, B);`
3. Guarda el archivo
4. ¡Los colores cambian automáticamente!

**Ejemplo rápido:**
```typescript
// De azul a rojo vibrante:
vec3 color = vec3(1.0, 0.2, 0.4);
```

¡Experimenta con diferentes valores y encuentra tu color perfecto! 🎨✨