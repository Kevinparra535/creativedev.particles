import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Simulator from "./Simulator";
import DefaultSettings from "../config/settings.config";

const LegacyParticles = () => {
  const { gl, camera, raycaster, pointer, viewport } = useThree();
  const W = DefaultSettings.simulatorTextureWidth;
  const H = DefaultSettings.simulatorTextureHeight;

  const simRef = useRef<Simulator>(null);
  if (!simRef.current) simRef.current = new Simulator(gl, W, H);

  // Proyección mouse → plano frente a cámara
  const plane = useMemo(() => new THREE.Plane(), []);
  const mouse3d = useRef(new THREE.Vector3());
  useFrame((state, dt) => {
    // Plano con normal = forward de cámara, pasando por (0,0,0)
    camera.getWorldDirection(plane.normal).normalize();
    plane.constant = 0; // pasa por origen
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hit)) mouse3d.current.copy(hit);

    simRef.current!.update(dt * 1000, mouse3d.current);
  });

  // TODO: aquí renderizas los puntos/triángulos leyendo simRef.current!.positionRenderTarget.texture
  return null;
};

export default LegacyParticles;
