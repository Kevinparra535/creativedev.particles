import { useControls } from "leva";
import { useEffect } from "react";
import { useSceneSettings } from "../hooks/useSceneSettings";
import { amountList, motionBlurQualityList } from "../../config/settings.config";

export default function ControlsPanel() {
  const s = useSceneSettings();
  const { amount, useTriangleParticles, speed, dieSpeed, radius, curlSize, attraction, followMouse, flipRatio, shadowDarkness, bgColor, color1, color2, fxaa, bloom, bloomRadius, bloomAmount, motionBlur, motionBlurQuality, motionBlurMaxDistance, motionBlurMultiplier } = s;

  const sim: any = useControls(
    "Simulator",
    {
      amount: { value: amount, options: amountList as any },
      speed: { value: speed, min: 0, max: 3 },
      dieSpeed: { value: dieSpeed, min: 0.0005, max: 0.05 },
      radius: { value: radius, min: 0.2, max: 3 },
      curlSize: { value: curlSize, min: 0.001, max: 0.05 },
      attraction: { value: attraction, min: -2, max: 2 },
      followMouse: { value: followMouse, label: "follow mouse" },
    },
    [amount, speed, dieSpeed, radius, curlSize, attraction, followMouse]
  );

  const ren: any = useControls(
    "Rendering",
    {
      useTriangleParticles: { value: useTriangleParticles, label: "new particle" },
      flipRatio: { value: flipRatio, min: 0, max: 1, visible: useTriangleParticles },
      shadowDarkness: { value: shadowDarkness, min: 0, max: 1, label: "shadow" },
      color1: { value: color1 },
      color2: { value: color2 },
      bgColor: { value: bgColor, label: "background" },
    },
    [useTriangleParticles, flipRatio, shadowDarkness, color1, color2, bgColor]
  );

  const post: any = useControls(
    "Post",
    {
      fxaa: { value: fxaa },
      bloom: { value: bloom },
      bloomRadius: { value: bloomRadius, min: 0, max: 3, label: "bloom radius", visible: bloom },
      bloomAmount: { value: bloomAmount, min: 0, max: 3, label: "bloom amount", visible: bloom },
      motionBlur: { value: motionBlur },
      motionBlurMaxDistance: { value: motionBlurMaxDistance, min: 1, max: 300, label: "motion distance", visible: motionBlur },
      motionBlurMultiplier: { value: motionBlurMultiplier, min: 0.1, max: 15, label: "motion multiplier", visible: motionBlur },
      motionBlurQuality: { value: motionBlurQuality, options: motionBlurQualityList as any, label: "motion quality", visible: motionBlur },
    },
    [fxaa, bloom, bloomRadius, bloomAmount, motionBlur, motionBlurMaxDistance, motionBlurMultiplier, motionBlurQuality]
  );

  useEffect(() => {
    if (sim.amount !== amount) s.setAmount(sim.amount);
    if (sim.speed !== speed) s.set("speed", sim.speed);
    if (sim.dieSpeed !== dieSpeed) s.set("dieSpeed", sim.dieSpeed);
    if (sim.radius !== radius) s.set("radius", sim.radius);
    if (sim.curlSize !== curlSize) s.set("curlSize", sim.curlSize);
  if (sim.attraction !== attraction) s.set("attraction", sim.attraction);
  if (sim.followMouse !== followMouse) s.set("followMouse", sim.followMouse);

  if (ren.useTriangleParticles !== useTriangleParticles) s.set("useTriangleParticles", ren.useTriangleParticles);
  if (ren.flipRatio !== flipRatio) s.set("flipRatio", ren.flipRatio);
  if (ren.shadowDarkness !== shadowDarkness) s.set("shadowDarkness", ren.shadowDarkness);
  if (ren.color1 !== color1) s.set("color1", ren.color1);
    if (ren.color2 !== color2) s.set("color2", ren.color2);
    if (ren.bgColor !== bgColor) s.set("bgColor", ren.bgColor);

    if (post.fxaa !== fxaa) s.set("fxaa", post.fxaa);
    if (post.bloom !== bloom) s.set("bloom", post.bloom);
    if (post.bloomRadius !== bloomRadius) s.set("bloomRadius", post.bloomRadius);
    if (post.bloomAmount !== bloomAmount) s.set("bloomAmount", post.bloomAmount);
    if (post.motionBlur !== motionBlur) s.set("motionBlur", post.motionBlur);
    if (post.motionBlurMaxDistance !== motionBlurMaxDistance) s.set("motionBlurMaxDistance", post.motionBlurMaxDistance);
    if (post.motionBlurMultiplier !== motionBlurMultiplier) s.set("motionBlurMultiplier", post.motionBlurMultiplier);
    if (post.motionBlurQuality !== motionBlurQuality) s.set("motionBlurQuality", post.motionBlurQuality);
  }, [sim, ren, post, s, amount, speed, dieSpeed, radius, curlSize, attraction, followMouse, flipRatio, shadowDarkness, useTriangleParticles, color1, color2, bgColor, fxaa, bloom, bloomRadius, bloomAmount, motionBlur, motionBlurMaxDistance, motionBlurMultiplier, motionBlurQuality]);

  return null;
}
