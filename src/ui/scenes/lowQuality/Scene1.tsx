import { useControls } from "leva";
import LowQualityParticles from "../../components/particles/LowQualityParticles";

const Scene1 = () => {
  // PostFX centralizado en R3FCanva (EffectsController)

  const { count, radius, pointSize, attract, falloff } = useControls(
    "Low Quality Particles",
    {
      count: { value: 10000, min: 1000, max: 50000, step: 1000 },
      radius: { value: 2, min: 0.5, max: 5, step: 0.1 },
      pointSize: { value: 8, min: 1, max: 20, step: 0.5 },
      attract: { value: 0.02, min: 0, max: 0.1, step: 0.001 },
      falloff: { value: 1.5, min: 0.1, max: 5, step: 0.1 },
    }
  );

  return (
    <LowQualityParticles
      count={count}
      radius={radius}
      pointSize={pointSize}
      attract={attract}
      falloff={falloff}
    />
  );
};

export default Scene1;
