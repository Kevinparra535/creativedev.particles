import { useEffect, useCallback, useRef } from "react";
import { folder, useControls } from "leva";
import DefaultSettings, {
  amountList,
  amountMap,
  motionBlurQualityList,
  motionBlurQualityMap,
} from "../config/settings.config";
import type {
  MotionBlurQualityKey,
  AmountKey,
} from "../config/settings.config";
import PostProcessing from "../postprocessing/PostProcessing";

// Global refs for motion blur and bloom effects (legacy compatibility)
export const motionBlurRef = {
  maxDistance: 120,
  motionMultiplier: 7,
  linesRenderTargetScale: 1,
  resize: () => {
    // This will be implemented by the actual motion blur effect
    console.log("MotionBlur resize called");
  },
};

export const bloomRef = {
  blurRadius: 1,
  amount: 1,
};

/**
 * LegacyGUI Component
 * Replica exactamente la funcionalidad del dat.GUI legacy
 * - Folders: Simulator, Rendering, Post-Processing
 * - Amount reload behavior exacto
 * - enableGuiControl logic para desabilitar controles
 * - Mobile behavior (cierra GUI)
 * - Motion blur y bloom controls conectados a efectos reales
 */
const LegacyGUI = () => {
  // Track if this is the initial render to avoid showing confirm on page load
  const isInitializedRef = useRef(false);

  // Initialize motion blur settings exactly like legacy
  useEffect(() => {
    motionBlurRef.maxDistance = 120;
    motionBlurRef.motionMultiplier = 7;
    motionBlurRef.linesRenderTargetScale = DefaultSettings.motionBlur
      ? 1 / 3 // medium quality default
      : 1 / 3;
    
    // Mark as initialized after first render to allow onChange to work
    setTimeout(() => {
      isInitializedRef.current = true;
    }, 100);
  }, []);

  // Handler for amount change - only show confirm if component is initialized (not on page load)
  const handleAmountChange = useCallback((val: AmountKey) => {
    // Only show confirm if this is a real user change, not initial render
    if (!isInitializedRef.current) {
      return;
    }
    
    // Legacy behavior: confirm and reload page
    if (confirm("It will restart the demo")) {
      const [w, h, r] = amountMap[val];
      DefaultSettings.amount = val;
      DefaultSettings.simulatorTextureWidth = w;
      DefaultSettings.simulatorTextureHeight = h;
      DefaultSettings.radius = r;

      // Update URL with new amount like legacy
      const url = new URL(window.location.href);
      url.searchParams.set("amount", val);
      window.location.href = url.toString();
      window.location.reload();
    }
  }, []);

  // Motion blur handlers
  const handleMotionDistanceChange = useCallback((v: number) => {
    motionBlurRef.maxDistance = v;
    // Update actual motion blur effect
    const motionBlurEffect = PostProcessing.getMotionBlur();
    if (motionBlurEffect) {
      motionBlurEffect.maxDistance = v;
    }
  }, []);

  const handleMotionMultiplierChange = useCallback((v: number) => {
    motionBlurRef.motionMultiplier = v;
    // Update actual motion blur effect
    const motionBlurEffect = PostProcessing.getMotionBlur();
    if (motionBlurEffect) {
      motionBlurEffect.motionMultiplier = v;
    }
  }, []);

  const handleMotionQualityChange = useCallback((v: MotionBlurQualityKey) => {
    DefaultSettings.motionBlurQuality = v;
    // Update linesRenderTargetScale like legacy using imported map
    motionBlurRef.linesRenderTargetScale = motionBlurQualityMap[v];

    // Update actual motion blur effect
    const motionBlurEffect = PostProcessing.getMotionBlur();
    if (motionBlurEffect) {
      motionBlurEffect.linesRenderTargetScale = motionBlurQualityMap[v];
    }
  }, []);

  // Bloom handlers
  const handleBloomRadiusChange = useCallback((v: number) => {
    bloomRef.blurRadius = v;
    // Update actual bloom effect
    const bloomEffect = PostProcessing.getBloom();
    if (bloomEffect) {
      bloomEffect.setRadius(v);
    }
  }, []);

  const handleBloomAmountChange = useCallback((v: number) => {
    bloomRef.amount = v;
    // Update actual bloom effect
    const bloomEffect = PostProcessing.getBloom();
    if (bloomEffect) {
      bloomEffect.setAmount(v);
    }
  }, []);

  useControls(
    () => ({
      Simulator: folder(
        {
          amount: {
            options: amountList,
            value: DefaultSettings.amount,
            onChange: handleAmountChange,
          },
          speed: {
            value: DefaultSettings.speed,
            min: 0,
            max: 3,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.speed = v),
          },
          dieSpeed: {
            value: DefaultSettings.dieSpeed,
            min: 0.0005,
            max: 0.05,
            step: 0.0005,
            onChange: (v: number) => (DefaultSettings.dieSpeed = v),
          },
          radius: {
            value: DefaultSettings.radius,
            min: 0.2,
            max: 3,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.radius = v),
          },
          curlSize: {
            value: DefaultSettings.curlSize,
            min: 0.001,
            max: 0.05,
            step: 0.001,
            onChange: (v: number) => (DefaultSettings.curlSize = v),
          },
          attraction: {
            value: DefaultSettings.attraction,
            min: -2,
            max: 2,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.attraction = v),
          },
          followMouse: {
            value: DefaultSettings.followMouse,
            onChange: (v: boolean) => (DefaultSettings.followMouse = v),
          },
        },
        { collapsed: false } // simulatorGui.open() in legacy
      ),

      Rendering: folder(
        {
          shadowDarkness: {
            value: DefaultSettings.shadowDarkness,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v: number) => (DefaultSettings.shadowDarkness = v),
          },
          useTriangleParticles: {
            value: DefaultSettings.useTriangleParticles,
            onChange: (v: boolean) =>
              (DefaultSettings.useTriangleParticles = v),
          },
          color1: {
            value: DefaultSettings.color1,
            onChange: (v: string) => (DefaultSettings.color1 = v),
          },
          color2: {
            value: DefaultSettings.color2,
            onChange: (v: string) => (DefaultSettings.color2 = v),
          },
          bgColor: {
            value: DefaultSettings.bgColor,
            onChange: (v: string) => (DefaultSettings.bgColor = v),
          },
        },
        { collapsed: false } // renderingGui.open() in legacy
      ),

      "Post-Processing": folder(
        {
          fxaa: {
            value: DefaultSettings.fxaa,
            onChange: (v: boolean) => (DefaultSettings.fxaa = v),
          },
          motionBlur: {
            value: DefaultSettings.motionBlur,
            onChange: (v: boolean) => {
              DefaultSettings.motionBlur = v;
              // Enable/disable controls will be handled by individual control disabled property
            },
          },
          motionDistance: {
            value: motionBlurRef.maxDistance,
            min: 1,
            max: 300,
            step: 1,
            disabled: !DefaultSettings.motionBlur,
            onChange: handleMotionDistanceChange,
          },
          motionMultiplier: {
            value: motionBlurRef.motionMultiplier,
            min: 0.1,
            max: 15,
            step: 0.1,
            disabled: !DefaultSettings.motionBlur,
            onChange: handleMotionMultiplierChange,
          },
          motionQuality: {
            options: motionBlurQualityList,
            value: DefaultSettings.motionBlurQuality,
            disabled: !DefaultSettings.motionBlur,
            onChange: handleMotionQualityChange,
          },
          bloom: {
            value: DefaultSettings.bloom,
            onChange: (v: boolean) => {
              DefaultSettings.bloom = v;
              // Enable/disable controls will be handled by individual control disabled property
            },
          },
          bloomRadius: {
            value: bloomRef.blurRadius,
            min: 0,
            max: 3,
            step: 0.01,
            disabled: !DefaultSettings.bloom,
            onChange: handleBloomRadiusChange,
          },
          bloomAmount: {
            value: bloomRef.amount,
            min: 0,
            max: 3,
            step: 0.01,
            disabled: !DefaultSettings.bloom,
            onChange: handleBloomAmountChange,
          },
        },
        { collapsed: false } // postprocessingGui.open() in legacy
      ),
    }),
    []
  );

  // Mobile behavior like legacy - close GUI on mobile
  useEffect(() => {
    if (DefaultSettings.isMobile) {
      // In Leva, we can hide the panel programmatically
      const levaPanel = document.querySelector(
        "[data-leva-root]"
      ) as HTMLElement;
      if (levaPanel) {
        levaPanel.style.display = "none";
      }
    }
  }, []);

  return null; // Leva controls are rendered globally
};

export default LegacyGUI;
