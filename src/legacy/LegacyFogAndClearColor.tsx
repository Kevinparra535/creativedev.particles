import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import DefaultSettings from "../config/settings.config";

/**
 * LegacyFogAndClearColor
 * Matches legacy index.js behavior:
 *  - tmpColor = floor.mesh.material.color; tmpColor.lerp(bgColor, 0.05)
 *  - _scene.fog.color.copy(tmpColor)
 *  - _renderer.setClearColor(tmpColor)
 */
const LegacyFogAndClearColor = () => {
  const { scene, gl } = useThree();

  // Cached colors
  const bgColor = useMemo(() => new THREE.Color(DefaultSettings.bgColor), []);
  const tmpColor = useMemo(() => new THREE.Color(0x333333), []);

  useFrame(() => {
    // Find floor mesh by name set in LegacyFloor
    const floor: THREE.Mesh | undefined = scene.getObjectByName(
      "legacy-floor"
    ) as THREE.Mesh | undefined;

    // 1) bgColor.setStyle(settings.bgColor)
    bgColor.setStyle(DefaultSettings.bgColor);

    // 2) tmpColor = floor.mesh.material.color; tmpColor.lerp(_bgColor, 0.05)
    if (floor && (floor.material as any)?.color) {
      const mat = floor.material as THREE.MeshStandardMaterial;
      tmpColor.copy(mat.color).lerp(bgColor, 0.05);
    } else {
      // Fallback: lerp internal tmp to bg
      tmpColor.lerp(bgColor, 0.05);
    }

    // 3) scene.fog.color = tmpColor (if fog exists)
    if ((scene as any).fog && (scene as any).fog.color) {
      (scene as any).fog.color.copy(tmpColor);
    }

    // 4) renderer clear color
    gl.setClearColor(tmpColor.getHex());
  });

  return null;
};

export default LegacyFogAndClearColor;
