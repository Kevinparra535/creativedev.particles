import { useControls } from 'leva';
import { useEffect } from 'react';
import { useSceneSettings, type SceneSettings } from '@/ui/hooks/useSceneSettings';
import { amountList, motionBlurQualityList, type AmountKey } from '@/config/settings.config';

export default function ControlsPanel() {
  const s = useSceneSettings();
  const {
    amount,
    useTriangleParticles,
    speed,
    dieSpeed,
    radius,
    curlSize,
    attraction,
    followMouse,
    flipRatio,
    triangleSize,
    shadowDarkness,
    bgColor,
    color1,
    color2,
    fxaa,
    bloom,
    bloomRadius,
    bloomAmount,
    motionBlur,
    motionBlurQuality,
    motionBlurMaxDistance,
    motionBlurMultiplier
  } = s;

  type SimControls = {
    amount: AmountKey;
    speed: number;
    dieSpeed: number;
    radius: number;
    curlSize: number;
    attraction: number;
    followMouse: boolean;
  };
  const sim = useControls(
    'Simulator',
    {
      amount: { value: amount, options: amountList },
      speed: { value: speed, min: 0, max: 3 },
      dieSpeed: { value: dieSpeed, min: 0.0005, max: 0.05 },
      radius: { value: radius, min: 0.2, max: 3 },
      curlSize: { value: curlSize, min: 0.001, max: 0.05 },
      attraction: { value: attraction, min: -2, max: 2 },
      followMouse: { value: followMouse, label: 'follow mouse' }
    },
    [amount, speed, dieSpeed, radius, curlSize, attraction, followMouse]
  ) as unknown as SimControls;

  type RenControls = {
    useTriangleParticles: boolean;
    flipRatio: number;
    triangleSize: number;
    shadowDarkness: number;
    color1: string;
    color2: string;
    bgColor: string;
  };
  const ren = useControls(
    'Rendering',
    {
      useTriangleParticles: {
        value: useTriangleParticles,
        label: 'new particle'
      },
      flipRatio: {
        value: flipRatio,
        min: 0,
        max: 1,
        visible: useTriangleParticles
      },
      triangleSize: {
        value: triangleSize,
        min: 0.5,
        max: 6,
        visible: useTriangleParticles
      },
      shadowDarkness: {
        value: shadowDarkness,
        min: 0,
        max: 1,
        label: 'shadow'
      },
      color1: { value: color1 },
      color2: { value: color2 },
      bgColor: { value: bgColor, label: 'background' }
    },
    [useTriangleParticles, flipRatio, triangleSize, shadowDarkness, color1, color2, bgColor]
  ) as unknown as RenControls;

  type PostControls = {
    fxaa: boolean;
    bloom: boolean;
    bloomRadius: number;
    bloomAmount: number;
    motionBlur: boolean;
    motionBlurMaxDistance: number;
    motionBlurMultiplier: number;
    motionBlurQuality: SceneSettings['motionBlurQuality'];
  };
  const post = useControls(
    'Post',
    {
      fxaa: { value: fxaa },
      bloom: { value: bloom },
      bloomRadius: {
        value: bloomRadius,
        min: 0,
        max: 3,
        label: 'bloom radius',
        visible: bloom
      },
      bloomAmount: {
        value: bloomAmount,
        min: 0,
        max: 3,
        label: 'bloom amount',
        visible: bloom
      },
      motionBlur: { value: motionBlur },
      motionBlurMaxDistance: {
        value: motionBlurMaxDistance,
        min: 1,
        max: 300,
        label: 'motion distance',
        visible: motionBlur
      },
      motionBlurMultiplier: {
        value: motionBlurMultiplier,
        min: 0.1,
        max: 15,
        label: 'motion multiplier',
        visible: motionBlur
      },
      motionBlurQuality: {
        value: motionBlurQuality,
        options: motionBlurQualityList,
        label: 'motion quality',
        visible: motionBlur
      }
    },
    [
      fxaa,
      bloom,
      bloomRadius,
      bloomAmount,
      motionBlur,
      motionBlurMaxDistance,
      motionBlurMultiplier,
      motionBlurQuality
    ]
  ) as unknown as PostControls;

  useEffect(() => {
    // Simulator updates
    if (sim.amount !== amount) {
      // Legacy behavior: confirm + reload with URL param
      if (globalThis.window !== undefined) {
        const shouldReload = globalThis.window.confirm(
          'Changing the particle amount will reload the page. Continue?'
        );
        if (shouldReload) {
          try {
            const url = new URL(globalThis.window.location.href);
            url.searchParams.set('amount', sim.amount);
            globalThis.window.location.href = url.toString();
          } catch {
            // Fallback: just reload
            globalThis.window.location.reload();
          }
          return; // prevent further updates; page will reload
        }
      }
      // Fallback: no window available, update store only
      s.setAmount(sim.amount);
    }
    const simUpdates: Array<[keyof SceneSettings, unknown, unknown]> = [
      ['speed', sim.speed, speed],
      ['dieSpeed', sim.dieSpeed, dieSpeed],
      ['radius', sim.radius, radius],
      ['curlSize', sim.curlSize, curlSize],
      ['attraction', sim.attraction, attraction],
      ['followMouse', sim.followMouse, followMouse]
    ];
    for (const [key, next, curr] of simUpdates) {
      if (next !== curr) {
        s.set(key, next as never);
      }
    }

    // Rendering updates
    const renUpdates: Array<[keyof SceneSettings, unknown, unknown]> = [
      ['useTriangleParticles', ren.useTriangleParticles, useTriangleParticles],
      ['flipRatio', ren.flipRatio, flipRatio],
      ['triangleSize', ren.triangleSize, triangleSize],
      ['shadowDarkness', ren.shadowDarkness, shadowDarkness],
      ['color1', ren.color1, color1],
      ['color2', ren.color2, color2],
      ['bgColor', ren.bgColor, bgColor]
    ];
    for (const [key, next, curr] of renUpdates) {
      if (next !== curr) {
        s.set(key, next as never);
      }
    }

    // Post-processing updates (legacy allows independent toggles)
    const postUpdates: Array<[keyof SceneSettings, unknown, unknown]> = [
      ['fxaa', post.fxaa, fxaa],
      ['bloom', post.bloom, bloom],
      ['bloomRadius', post.bloomRadius, bloomRadius],
      ['bloomAmount', post.bloomAmount, bloomAmount],
      ['motionBlur', post.motionBlur, motionBlur],
      ['motionBlurMaxDistance', post.motionBlurMaxDistance, motionBlurMaxDistance],
      ['motionBlurMultiplier', post.motionBlurMultiplier, motionBlurMultiplier],
      ['motionBlurQuality', post.motionBlurQuality, motionBlurQuality]
    ];
    for (const [key, next, curr] of postUpdates) {
      if (next !== curr) {
        s.set(key, next as never);
      }
    }
  }, [
    sim,
    ren,
    post,
    s,
    amount,
    speed,
    dieSpeed,
    radius,
    curlSize,
    attraction,
    followMouse,
    flipRatio,
    triangleSize,
    shadowDarkness,
    useTriangleParticles,
    color1,
    color2,
    bgColor,
    fxaa,
    bloom,
    bloomRadius,
    bloomAmount,
    motionBlur,
    motionBlurMaxDistance,
    motionBlurMultiplier,
    motionBlurQuality
  ]);

  return null;
}
