import OrbitControls from "../components/controls/OrbitControls";
import AdaptiveParticles from "../components/particles/AdaptiveParticles";
import { useSceneSettings } from "../hooks/useSceneSettings";
import ControlsPanel from "../components/ControlsPanel";
import { useEffect } from "react";
import Lights from "../components/scene/Lights";
import Floor from "../components/scene/Floor";

const Scene1 = () => {
  const s = useSceneSettings();
  const mode = s.useTriangleParticles ? "triangles" : "points";
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        s.set("speed", s.speed === 0 ? 1 : 0);
        s.set("dieSpeed", s.dieSpeed === 0 ? 0.015 : 0);
      }
    };
    globalThis.addEventListener("keyup", onKeyUp as any);
    return () => globalThis.removeEventListener("keyup", onKeyUp as any);
  }, [s]);
  return (
    <>
      <Lights />
      <Floor />
      <ControlsPanel />
      <AdaptiveParticles
        mode={mode as any}
        cols={s.cols}
        rows={s.rows}
        radius={s.radius * 300}
        speed={s.speed}
        dieSpeed={s.dieSpeed}
        curlSize={s.curlSize}
        attraction={s.attraction}
        flipRatio={s.flipRatio}
        color1={s.color1}
        color2={s.color2}
      />
      <OrbitControls enableDamping dampingFactor={0.1} />
    </>
  );
};

export default Scene1;
