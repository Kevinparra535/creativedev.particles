import { useControls } from "leva";
import { useEffect } from "react";
import { useSceneSettings } from "../hooks/useSceneSettings";
import { amountList, motionBlurQualityList } from "../../config/settings.config";

export default function ControlsPanel() {
  const s = useSceneSettings();
  const { amount, useTriangleParticles, speed, dieSpeed, radius, curlSize, attraction, flipRatio, bgColor, color1, color2, fxaa, bloom, motionBlur, motionBlurQuality } = s;

  const sim: any = useControls(
    "Simulator",
    {
      amount: { value: amount, options: amountList as any },
      speed: { value: speed, min: 0, max: 3 },
      dieSpeed: { value: dieSpeed, min: 0.0005, max: 0.05 },
      radius: { value: radius, min: 0.2, max: 3 },
      curlSize: { value: curlSize, min: 0.001, max: 0.05 },
      attraction: { value: attraction, min: -2, max: 2 },
      useTriangleParticles: { value: useTriangleParticles, label: "new particle" },
  flipRatio: { value: flipRatio, min: 0, max: 1, visible: useTriangleParticles },
    },
    [amount, speed, dieSpeed, radius, curlSize, attraction, useTriangleParticles, flipRatio]
  );

  const ren: any = useControls(
    "Rendering",
    {
      color1: { value: color1 },
      color2: { value: color2 },
      bgColor: { value: bgColor, label: "background" },
    },
    [color1, color2, bgColor]
  );

  const post: any = useControls(
    "Post",
    {
      fxaa: { value: fxaa },
      bloom: { value: bloom },
      motionBlur: { value: motionBlur },
      motionBlurQuality: { value: motionBlurQuality, options: motionBlurQualityList as any },
    },
    [fxaa, bloom, motionBlur, motionBlurQuality]
  );

  useEffect(() => {
    if (sim.amount !== amount) s.setAmount(sim.amount);
    if (sim.speed !== speed) s.set("speed", sim.speed);
    if (sim.dieSpeed !== dieSpeed) s.set("dieSpeed", sim.dieSpeed);
    if (sim.radius !== radius) s.set("radius", sim.radius);
    if (sim.curlSize !== curlSize) s.set("curlSize", sim.curlSize);
    if (sim.attraction !== attraction) s.set("attraction", sim.attraction);
  if (sim.useTriangleParticles !== useTriangleParticles) s.set("useTriangleParticles", sim.useTriangleParticles);
  if (sim.flipRatio !== flipRatio) s.set("flipRatio", sim.flipRatio);

    if (ren.color1 !== color1) s.set("color1", ren.color1);
    if (ren.color2 !== color2) s.set("color2", ren.color2);
    if (ren.bgColor !== bgColor) s.set("bgColor", ren.bgColor);

    if (post.fxaa !== fxaa) s.set("fxaa", post.fxaa);
    if (post.bloom !== bloom) s.set("bloom", post.bloom);
    if (post.motionBlur !== motionBlur) s.set("motionBlur", post.motionBlur);
    if (post.motionBlurQuality !== motionBlurQuality) s.set("motionBlurQuality", post.motionBlurQuality);
  }, [sim, ren, post, s, amount, speed, dieSpeed, radius, curlSize, attraction, flipRatio, useTriangleParticles, color1, color2, bgColor, fxaa, bloom, motionBlur, motionBlurQuality]);

  return null;
}
