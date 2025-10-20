import { OrbitControls as DreiOrbitControls } from "@react-three/drei";
import React from "react";

export type OrbitControlsProps = {
  enabled?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  minAzimuthAngle?: number;
  maxAzimuthAngle?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  enableDamping?: boolean;
  dampingFactor?: number;
};

// Wrapper to mirror the legacy OrbitControls API names to drei props
const OrbitControls: React.FC<OrbitControlsProps> = ({
  enabled = true,
  autoRotate = false,
  autoRotateSpeed = 2,
  minDistance = 0.1,
  maxDistance = Infinity,
  minPolarAngle = 0,
  maxPolarAngle = Math.PI,
  minAzimuthAngle = -Infinity,
  maxAzimuthAngle = Infinity,
  enablePan = true,
  enableZoom = true,
  enableRotate = true,
  enableDamping = true,
  dampingFactor = 0.1,
}) => {
  return (
    <DreiOrbitControls
      enabled={enabled}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      enablePan={enablePan}
      enableZoom={enableZoom}
      enableRotate={enableRotate}
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      makeDefault
    />
  );
};

export default OrbitControls;
