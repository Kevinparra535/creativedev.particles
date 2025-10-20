import OrbitControls from "../components/controls/OrbitControls";
import AdaptiveParticles from "../components/particles/AdaptiveParticles";
import { useSceneSettings } from "../hooks/useSceneSettings";
import ControlsPanel from "../components/ControlsPanel";
import { useEffect } from "react";
import Lights from "../components/scene/Lights";
import Floor from "../components/scene/Floor";

const Scene1 = () => {
  const s = useSceneSettings();
  const mode: "triangles" | "points" = s.useTriangleParticles ? "triangles" : "points";
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        s.set("speed", s.speed === 0 ? 1 : 0);
        s.set("dieSpeed", s.dieSpeed === 0 ? 0.015 : 0);
      }
    };
    globalThis.addEventListener("keyup", onKeyUp);
    return () => globalThis.removeEventListener("keyup", onKeyUp);
  }, [s]);
  return (
    <>
      <Lights />
      <Floor />
      <ControlsPanel />
      <AdaptiveParticles
        mode={mode}
        cols={s.cols}
        rows={s.rows}
        radius={s.radius * 300}
        speed={s.speed}
        dieSpeed={s.dieSpeed}
        curlSize={s.curlSize}
        attraction={s.attraction}
        followMouse={s.followMouse}
        flipRatio={s.flipRatio}
        triangleSize={s.triangleSize}
        color1={s.color1}
        color2={s.color2}
      />
  <OrbitControls enableDamping={true} dampingFactor={0.1} />
    </>
  );
};

export default Scene1;
