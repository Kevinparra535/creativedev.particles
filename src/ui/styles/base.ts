import styled, { createGlobalStyle, css } from 'styled-components';

// =====================================
// Global Styles - Afecta HTML y Root
// =====================================

export const GlobalStyles = createGlobalStyle`
  /* Reset básico para experiencias 3D */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    /* Base para experiencias 3D inmersivas */
    height: 100%;
    font-size: 16px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    /* Optimizaciones para 3D */
    transform-style: preserve-3d;
    perspective: 1000px;

    /* Variables CSS para theming */
    --primary-bg: #000012;
    --secondary-bg: #1a1a2e;
    --accent-color: #6366f1;
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;

    /* Variables para 3D */
    --canvas-bg: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
    --particle-glow: #00ffff;
    --particle-trail: rgba(0, 255, 255, 0.3);
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: var(--primary-bg);
    color: var(--text-primary);
    height: 100%;
    overflow: hidden; /* Previene scroll en experiencias 3D */

    /* Prevenir selección de texto en experiencias 3D */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;

    /* Mejoras de performance para 3D */
    will-change: transform;
    backface-visibility: hidden;
  }

  /* Clase root para React */
  #root {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background: var(--canvas-bg);

    /* Layout para experiencias 3D */
    display: flex;
    flex-direction: column;

    /* GPU acceleration */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }

  /* Estilos para canvas de Three.js */
  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
    outline: none;
    touch-action: none; /* Prevenir gestos del navegador */
  }

  /* Scrollbar styling para UI overlays */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--accent-color);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #818cf8;
  }

  /* Estados de loading */
  .loading-state {
    cursor: wait;
  }

  /* Utilidades para experiencias 3D */
  .gpu-accelerated {
    transform: translateZ(0);
    will-change: transform;
  }

  .fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }
`;

// =====================================
// CSS Variables Helper
// =====================================

export const cssVariables = {
  colors: {
    primaryBg: 'var(--primary-bg)',
    secondaryBg: 'var(--secondary-bg)',
    accentColor: 'var(--accent-color)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    canvasBg: 'var(--canvas-bg)',
    particleGlow: 'var(--particle-glow)',
    particleTrail: 'var(--particle-trail)'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  zIndex: {
    canvas: 1,
    ui: 10,
    overlay: 100,
    modal: 1000
  }
};

// =====================================
// Base Styled Components
// =====================================

export const BaseContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${cssVariables.colors.canvasBg};
`;

export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: ${cssVariables.zIndex.canvas};
`;

// =====================================
// UI Overlay Components
// =====================================

export const UIOverlay = styled.div<{ position?: 'top' | 'bottom' | 'center' }>`
  position: absolute;
  z-index: ${cssVariables.zIndex.ui};
  pointer-events: auto;

  ${({ position = 'top' }) => {
    switch (position) {
      case 'top':
        return css`
          top: ${cssVariables.spacing.lg};
          left: ${cssVariables.spacing.lg};
          right: ${cssVariables.spacing.lg};
        `;
      case 'bottom':
        return css`
          bottom: ${cssVariables.spacing.lg};
          left: ${cssVariables.spacing.lg};
          right: ${cssVariables.spacing.lg};
        `;
      case 'center':
        return css`
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;
      default:
        return '';
    }
  }}
`;

export const ControlPanel = styled.div`
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: ${cssVariables.spacing.lg};
  color: ${cssVariables.colors.textPrimary};

  /* Glassmorphism effect */
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

// =====================================
// Performance Optimized Components
// =====================================

export const GPUAccelerated = styled.div`
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
`;

export const FullscreenCanvas = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${cssVariables.zIndex.canvas};

  /* Optimizaciones para Three.js */
  touch-action: none;
  user-select: none;
  outline: none;
`;
