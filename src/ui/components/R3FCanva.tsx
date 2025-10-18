import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import Scene1 from "../scenes/lowQuality/Scene1";
import DefaultSettings from "../../config/settings.config";

// Componente principal con controles de color
const R3FCanva = () => {
  // Legacy camera: PerspectiveCamera(45, 1, 10, 3000) and position (300,60,300).normalize()*1000
  const camBase = new THREE.Vector3(300, 60, 300)
    .normalize()
    .multiplyScalar(1000);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* Background and fog as legacy */}
        {/* Background color */}
        {/* @ts-ignore three-stdlib intrinsic */}
        <color attach="background" args={[DefaultSettings.bgColor]} />
        {/* FogExp2 with density 0.001 */}
        {/* @ts-ignore three-stdlib intrinsic */}
        <fogExp2 attach="fog" args={[DefaultSettings.bgColor, 0.001]} />

        <PerspectiveCamera
          makeDefault
          fov={45}
          near={10}
          far={3000}
          position={[camBase.x, camBase.y, camBase.z]}
        />

        <Scene1 />

        {/* Legacy PostProcessing System */}
        {/* {(DefaultSettings.fxaa ||
          DefaultSettings.bloom ||
          DefaultSettings.motionBlur) && <LegacyPostProcessing />} */}
      </Canvas>
    </div>
  );
};

export default R3FCanva;
