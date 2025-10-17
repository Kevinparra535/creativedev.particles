import * as THREE from "three";
import React, { useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";

export type TemporalAccumulationProps = {
  enabled?: boolean;
  persistence?: number; // 0..1 (higher = longer trails)
  priority?: number; // render priority; higher runs earlier
};

// Cheap motion blur via temporal accumulation: don't clear the frame and draw a
// fullscreen black quad with small opacity each frame to fade previous contents.
const TemporalAccumulation: React.FC<TemporalAccumulationProps> = ({
  enabled = true,
  persistence = 0.9,
  priority = 1000,
}) => {
  const { gl } = useThree();
  const prevAutoClear = useRef<boolean>(true);

  // Offscreen scene + ortho cam for the fade quad
  const fadeScene = useMemo(() => new THREE.Scene(), []);
  const fadeCam = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    []
  );

  // Quad geometry
  const positions = useMemo(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
    []
  );

  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 0, 0),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      opacity: Math.max(0, Math.min(1, 1 - persistence)),
    });
    m.blending = THREE.NormalBlending;
    return m;
  }, [persistence]);

  // Manage autoClear lifecycle
  useEffect(() => {
    prevAutoClear.current = gl.autoClear;
    gl.autoClear = false;
    return () => {
      gl.autoClear = prevAutoClear.current;
    };
  }, [gl]);

  useFrame(() => {
    if (!enabled) return;
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(prev); // draw to current target
    gl.render(fadeScene, fadeCam);
  }, priority);

  return createPortal(
    <mesh frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <primitive object={material} attach="material" />
    </mesh>,
    fadeScene
  );
};

export default TemporalAccumulation;
