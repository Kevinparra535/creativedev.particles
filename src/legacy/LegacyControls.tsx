import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls as DreiOrbitControls } from "@react-three/drei";
import * as THREE from "three";
import DefaultSettings from "../config/settings.config";

// Global variables for legacy compatibility
export let initAnimation = 0;
export let mouse3d = new THREE.Vector3();
export const mouse = new THREE.Vector2(0, 0);

const ray = new THREE.Ray();

interface LegacyControlsProps {
  children?: React.ReactNode;
}

const LegacyControls: React.FC<LegacyControlsProps> = ({ children }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Mouse event handlers - exactly like legacy
  useEffect(() => {
    const handleMouseMove = (evt: MouseEvent) => {
      mouse.x = (evt.pageX / window.innerWidth) * 2 - 1;
      mouse.y = -(evt.pageY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (evt: TouchEvent) => {
      if (DefaultSettings.isMobile && evt.preventDefault) {
        evt.preventDefault();
      }
      const touch = evt.changedTouches[0];
      mouse.x = (touch.pageX / window.innerWidth) * 2 - 1;
      mouse.y = -(touch.pageY / window.innerHeight) * 2 + 1;
    };

    const handleKeyUp = (evt: KeyboardEvent) => {
      if (evt.keyCode === 32) {
        // Spacebar
        DefaultSettings.speed = DefaultSettings.speed === 0 ? 1 : 0;
        DefaultSettings.dieSpeed = DefaultSettings.dieSpeed === 0 ? 0.015 : 0;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_state, delta) => {
    const deltaMs = delta * 1000;

    // Update initAnimation - exactly like legacy
    initAnimation = Math.min(initAnimation + deltaMs * 0.00025, 1);

    // Update controls maxDistance based on initAnimation - exactly like legacy
    if (controlsRef.current) {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      controlsRef.current.maxDistance =
        initAnimation === 1
          ? 1000
          : lerp(1000, 450, easeOutCubic(initAnimation));
    }

    // Update mouse3d - exactly like legacy ray projection
    camera.updateMatrixWorld();
    ray.origin.setFromMatrixPosition(camera.matrixWorld);
    ray.direction
      .set(mouse.x, mouse.y, 0.5)
      .unproject(camera)
      .sub(ray.origin)
      .normalize();

    const distance =
      ray.origin.length() /
      Math.cos(Math.PI - ray.direction.angleTo(ray.origin));
    mouse3d.copy(ray.origin).add(ray.direction.multiplyScalar(distance * 1.0));

    // Update DefaultSettings mouse values for legacy compatibility
    DefaultSettings.mouse = mouse;
    DefaultSettings.mouse3d = mouse3d;
  });

  return (
    <>
      <DreiOrbitControls
        ref={controlsRef}
        target={[0, 50, 0]} // target.y = 50 like legacy
        maxDistance={1000}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.1}
        enablePan={false} // noPan = true in legacy
        enabled={!DefaultSettings.isMobile} // disabled on mobile like legacy
        makeDefault
      />
      {children}
    </>
  );
};

export default LegacyControls;
