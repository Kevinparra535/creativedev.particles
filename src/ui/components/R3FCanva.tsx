import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Scene1 from "../scenes/lowQuality/Scene1";
import EffectsController from "./controls/EffectsController";

// Componente principal con controles de color
const R3FCanva = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        // camera={{ position: [0, 0, 5], fov: 120, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />

        <PerspectiveCamera
          makeDefault
          fov={45}
          aspect={1}
          near={10}
          far={3000}
          position={[300, 60, 300]}
          zoom={100}
        />

        <OrbitControls
          makeDefault
          enabled
          enableRotate
          enablePan
          enableZoom
          // Easing equivalents
          enableDamping
          dampingFactor={0.02} // ~ rotateEaseRatio
          zoomSpeed={1}
          // Angle limits
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          // Distance/zoom limits
          minDistance={0.1}
          maxDistance={Infinity}
          minZoom={0.1}
          maxZoom={500}
          // Auto-rotate mapping
          autoRotate={false}
          autoRotateSpeed={2}
        />

        <Scene1 />
        <EffectsController />
      </Canvas>
    </div>
  );
};

export default R3FCanva;
