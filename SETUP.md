# Implementación de la Arquitectura

## Pasos para Implementar

### 1. Instalar Dependencias

```bash
npm install @react-three/fiber @react-three/drei @react-three/postprocessing three zustand @react-spring/three framer-motion-3d
npm install -D @types/three vite-plugin-glsl
```

### 2. Estructura de Carpetas

Ejecutar los siguientes comandos para crear la estructura:

```bash
# Crear estructura de carpetas
mkdir -p src/{app/{stores,use-cases},domain/{entities,services,repositories},infrastructure/{three/{loaders,materials,geometries,renderers},repositories,external},presentation/{components/{ui,experience,particles},hooks,layouts},shared/{constants,types,utils,config},assets/{models,textures,shaders,audio}}

# Crear archivos base
touch src/app/stores/scene.store.ts
touch src/domain/entities/ParticleSystem.ts
touch src/presentation/components/experience/Scene.tsx
touch src/presentation/hooks/useParticles.ts
```

### 3. Configurar Vite para Shaders

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [react(), glsl()],
  resolve: {
    alias: {
      "@": "/src",
      "@/app": "/src/app",
      "@/domain": "/src/domain",
      "@/infrastructure": "/src/infrastructure",
      "@/presentation": "/src/presentation",
      "@/shared": "/src/shared",
    },
  },
});
```

### 4. Implementar Gradualmente

1. **Fase 1**: Configurar Scene básica con R3F
2. **Fase 2**: Implementar sistema de partículas simple
3. **Fase 3**: Agregar física y animaciones
4. **Fase 4**: Post-processing y efectos avanzados
5. **Fase 5**: Optimizaciones de performance

## Archivos de Ejemplo

Los siguientes archivos muestran implementaciones concretas de los patrones propuestos:

- `src/app/stores/scene.store.ts` - Estado global con Zustand
- `src/domain/entities/ParticleSystem.ts` - Entidad de dominio
- `src/presentation/components/experience/Scene.tsx` - Componente React Three Fiber
- `src/presentation/hooks/useParticles.ts` - Hook personalizado
