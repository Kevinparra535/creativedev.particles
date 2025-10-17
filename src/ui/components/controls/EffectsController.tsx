import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useControls } from "leva";
import { usePerformanceOptimization } from "../../../core/presentation/usePerformanceOptimization";
import PostFX from "../PostFX";

const EffectsController = () => {
  const { currentQuality } = usePerformanceOptimization();
  // Presets aproximados al legacy y variantes
  const presets = useMemo(
    () =>
      ({
        "Legacy-like": {
          bloomIntensity: 0.3,
          bloomThreshold: 0,
          bloomSmoothing: 0.9,
          bloomHeight: 300,
          dofFocusDistance: 0,
          dofFocalLength: 50,
          dofBokehScale: 1,
          dofHeight: 480,
          vignetteOffset: 0.3,
          vignetteDarkness: 1.2,
        },
        Cinematic: {
          bloomIntensity: 0.6,
          bloomThreshold: 0.1,
          bloomSmoothing: 0.85,
          bloomHeight: 720,
          dofFocusDistance: 0.3,
          dofFocalLength: 70,
          dofBokehScale: 1.4,
          dofHeight: 720,
          vignetteOffset: 0.35,
          vignetteDarkness: 1.25,
        },
        Subtle: {
          bloomIntensity: 0.15,
          bloomThreshold: 0.2,
          bloomSmoothing: 0.8,
          bloomHeight: 240,
          dofFocusDistance: 0,
          dofFocalLength: 35,
          dofBokehScale: 0.8,
          dofHeight: 360,
          vignetteOffset: 0.2,
          vignetteDarkness: 1.05,
        },
      }) as Record<
        "Legacy-like" | "Cinematic" | "Subtle",
        {
          bloomIntensity: number;
          bloomThreshold: number;
          bloomSmoothing: number;
          bloomHeight: number;
          dofFocusDistance: number;
          dofFocalLength: number;
          dofBokehScale: number;
          dofHeight: number;
          vignetteOffset: number;
          vignetteDarkness: number;
        }
      >,
    []
  );

  const controls = useControls("PostFX", {
    preset: {
      value: "Legacy-like",
      options: ["Legacy-like", "Cinematic", "Subtle", "Custom"],
    },
    auto: { value: true },
    enabled: { value: true },
    // toggles
    dof: { value: true },
    bloom: { value: true },
    noise: { value: true },
    vignette: { value: true },
    smaa: { value: true },
    temporalAccumulation: { value: false },
    trailStrength: { value: 0.6, min: 0, max: 0.98, step: 0.01 },
    // Custom tuning (only used if preset === 'Custom')
    bloomIntensity: { value: 0.3, min: 0, max: 2, step: 0.01 },
    bloomThreshold: { value: 0, min: 0, max: 1, step: 0.01 },
    bloomSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01 },
    bloomHeight: { value: 300, min: 128, max: 2048, step: 1 },
    dofFocusDistance: { value: 0, min: 0, max: 1, step: 0.001 },
    dofFocalLength: { value: 50, min: 1, max: 150, step: 1 },
    dofBokehScale: { value: 1, min: 0, max: 5, step: 0.01 },
    dofHeight: { value: 480, min: 128, max: 2048, step: 1 },
    vignetteOffset: { value: 0.3, min: 0, max: 1, step: 0.01 },
    vignetteDarkness: { value: 1.2, min: 0, max: 3, step: 0.01 },
    dofFollowMouse: { value: false },
    dofFollowSpeed: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
  });

  // DOF follow mouse: calcular focusDistance normalizado 0..1 desde z de intersección
  const { camera, pointer, raycaster } = useThree();
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  ); // z=0
  const hit = useMemo(() => new THREE.Vector3(), []);
  const focusRef = useRef(controls.dofFocusDistance);

  useFrame(() => {
    if (!controls.dofFollowMouse) return;
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, hit);
    // Distancia de la cámara al plano de enfoque (z=0)
    const dist = Math.abs((camera as THREE.Camera as any).position?.z ?? 5);
    const near = (camera as any).near ?? 0.1;
    const far = (camera as any).far ?? 2000;
    const normalized = THREE.MathUtils.clamp(
      (dist - near) / (far - near),
      0,
      1
    );
    focusRef.current = THREE.MathUtils.lerp(
      focusRef.current,
      normalized,
      controls.dofFollowSpeed
    );
  });

  const effectiveEnabled = controls.auto
    ? Boolean(currentQuality?.postProcessing)
    : controls.enabled;

  type PresetKey = keyof typeof presets;
  const presetValues =
    controls.preset === "Custom" ? null : presets[controls.preset as PresetKey];

  const tuning = {
    bloomIntensity: presetValues?.bloomIntensity ?? controls.bloomIntensity,
    bloomThreshold: presetValues?.bloomThreshold ?? controls.bloomThreshold,
    bloomSmoothing: presetValues?.bloomSmoothing ?? controls.bloomSmoothing,
    bloomHeight: presetValues?.bloomHeight ?? controls.bloomHeight,
    dofFocusDistance: controls.dofFollowMouse
      ? focusRef.current
      : (presetValues?.dofFocusDistance ?? controls.dofFocusDistance),
    dofFocalLength: presetValues?.dofFocalLength ?? controls.dofFocalLength,
    dofBokehScale: presetValues?.dofBokehScale ?? controls.dofBokehScale,
    dofHeight: presetValues?.dofHeight ?? controls.dofHeight,
    vignetteOffset: presetValues?.vignetteOffset ?? controls.vignetteOffset,
    vignetteDarkness:
      presetValues?.vignetteDarkness ?? controls.vignetteDarkness,
  } as const;

  return (
    <PostFX
      enabled={effectiveEnabled}
      dof={controls.dof}
      bloom={controls.bloom}
      noise={controls.noise}
      vignette={controls.vignette}
      smaa={controls.smaa}
      temporalAccumulation={controls.temporalAccumulation}
      trailStrength={controls.trailStrength}
      {...tuning}
    />
  );
};

export default EffectsController;
