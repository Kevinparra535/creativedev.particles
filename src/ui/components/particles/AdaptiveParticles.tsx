import * as React from "react";
import { useThree } from "@react-three/fiber";
import { shouldUseFallback } from "../../../utils/capabilities";
import FboParticles from "./FboParticles";
import CpuParticles from "./CpuParticles";

type Props = React.ComponentProps<typeof FboParticles> & {
  cpuCount?: number;
};

export default function AdaptiveParticles(props: Readonly<Props>) {
  const { gl } = useThree();
  const useFallback = shouldUseFallback(gl);
  if (useFallback) {
    const { cpuCount = 8000, radius = 250, color1 = "white" } = props;
    return <CpuParticles count={cpuCount} radius={radius} color={color1} />;
  }
  return <FboParticles {...props} />;
}
