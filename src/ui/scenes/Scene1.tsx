// import { useControls } from "leva";
import LegacyParticles from "../../legacy/LegacyParticles";
import LegacyLights from "../../legacy/LegacyLights";
import LegacyFloor from "../../legacy/LegacyFloor";
import LegacyControls from "../../legacy/LegacyControls";
import LegacyGUI from "../../legacy/LegacyGUI";

const Scene1 = () => {
  return (
    <LegacyControls>
      <LegacyGUI />
      <LegacyLights />
      <LegacyFloor />
      <LegacyParticles />
    </LegacyControls>
  );
};

export default Scene1;
