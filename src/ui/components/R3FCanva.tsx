import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Scene1 from "../scenes/lowQuality/Scene1";
import settings from "../../config/settings.config";

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
        <color attach="background" args={[settings.bgColor]} />
        {/* FogExp2 with density 0.001 */}
        {/* @ts-ignore three-stdlib intrinsic */}
        <fogExp2 attach="fog" args={[settings.bgColor, 0.001]} />

        <PerspectiveCamera
          makeDefault
          fov={45}
          near={10}
          far={3000}
          position={[camBase.x, camBase.y, camBase.z]}
        />

        <OrbitControls
          makeDefault
          enabled
          enableRotate
          enableZoom
          enablePan={false}
          // Legacy limits
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2 - 0.1}
          maxDistance={1000}
          // Legacy target.y = 50
          target={[0, 50, 0]}
        />

        <Scene1 />
      </Canvas>
    </div>
  );
};

export default R3FCanva;
