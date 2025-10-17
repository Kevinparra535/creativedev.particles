import React, { useEffect } from "react";
import styled from "styled-components";
import { GlobalStyles, ControlPanel } from "../styles/base";
import { mixins, themes, themeUtils } from "../styles/theme";

// =====================================
// Ejemplo de Componente con Estilos Base
// =====================================

const ExampleApp = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  background: var(--canvas-bg);
  overflow: hidden;
`;

const ThemeButton = styled.button`
  ${mixins.controlButton}
  margin: 0.5rem;

  &.active {
    background: var(--accent-color);
    ${mixins.glowEffect("var(--accent-color)")}
  }
`;

const StatsPanel = styled(ControlPanel)`
  ${mixins.overlayPosition("top-left")}
  min-width: 200px;

  h3 {
    color: var(--accent-color);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    margin: 0.25rem 0;
    font-size: 0.8rem;
    color: var(--text-secondary);

    .value {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
`;

const ThemeSelector = styled(ControlPanel)`
  ${mixins.overlayPosition("top-right")}

  h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
`;

const CanvasPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: var(--canvas-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 1.2rem;

  ${mixins.gpuAcceleration}
  ${mixins.preventUserInteraction}
  
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    height: 200px;
    margin: -100px 0 0 -100px;
    border: 2px solid var(--accent-color);
    border-radius: 50%;
    opacity: 0.3;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.6;
    }
  }
`;

// =====================================
// Componente Principal
// =====================================

interface StyleExampleProps {
  children?: React.ReactNode;
}

const StyleExample: React.FC<StyleExampleProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] =
    React.useState<keyof typeof themes>("space");
  const [stats, setStats] = React.useState({
    fps: 60,
    memory: 125,
    triangles: 15420,
  });

  // Aplicar tema al montar y cuando cambie
  useEffect(() => {
    themeUtils.applyTheme(currentTheme);
  }, [currentTheme]);

  // Simular stats que se actualizan
  useEffect(() => {
    const interval = setInterval(() => {
  setStats(() => ({
        fps: Math.floor(Math.random() * 10) + 55,
        memory: Math.floor(Math.random() * 50) + 100,
        triangles: Math.floor(Math.random() * 5000) + 12000,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (theme: keyof typeof themes) => {
    setCurrentTheme(theme);
  };

  return (
    <>
      {/* Estilos globales que afectan HTML y #root */}
      <GlobalStyles />

      <ExampleApp>
        {/* Canvas principal (aquí iría tu Three.js canvas) */}
        <CanvasPlaceholder>
          {children || "Three.js Canvas aquí"}
        </CanvasPlaceholder>

        {/* Panel de estadísticas */}
        <StatsPanel>
          <h3>Performance</h3>
          <div className="stat-item">
            <span>FPS:</span>
            <span className="value">{stats.fps}</span>
          </div>
          <div className="stat-item">
            <span>Memory:</span>
            <span className="value">{stats.memory} MB</span>
          </div>
          <div className="stat-item">
            <span>Triangles:</span>
            <span className="value">{stats.triangles.toLocaleString()}</span>
          </div>
        </StatsPanel>

        {/* Selector de temas */}
        <ThemeSelector>
          <h3>Temas</h3>
          {Object.keys(themes).map((theme) => (
            <ThemeButton
              key={theme}
              className={currentTheme === theme ? "active" : ""}
              onClick={() => handleThemeChange(theme as keyof typeof themes)}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </ThemeButton>
          ))}
        </ThemeSelector>
      </ExampleApp>
    </>
  );
};

export default StyleExample;
