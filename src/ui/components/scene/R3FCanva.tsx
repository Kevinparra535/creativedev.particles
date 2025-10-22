import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

import DefaultSettings from '@/config/settings.config';
import { useSceneSettings } from '@/ui/hooks/useSceneSettings';

import ModernCore from '@/ui/scenes/ModernCore';

const R3FCanva = () => {
  const camBase = new THREE.Vector3(0, 60, 800).normalize().multiplyScalar(1000);

  const s = useSceneSettings();

  const handleCanvasCreated = (gl: THREE.WebGLRenderer) => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        performance={{ min: 2 }}
        onCreated={({ gl }) => handleCanvasCreated(gl)}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach='background' args={[s.bgColor || DefaultSettings.bgColor]} />
        <fogExp2 attach='fog' args={[s.bgColor || DefaultSettings.bgColor, 0.001]} />

        <ModernCore />
        {/* <LegacyCore /> */}

        <PerspectiveCamera
          makeDefault
          fov={75}
          near={10}
          far={3000}
          position={[camBase.x, camBase.y, camBase.z]}
        />
      </Canvas>
    </div>
  );
};

export default R3FCanva;
