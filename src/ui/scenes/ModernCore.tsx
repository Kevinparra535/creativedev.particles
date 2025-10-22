import OrbitControls from '../components/controls/OrbitControls';
import AdaptiveParticles from '../components/particles/AdaptiveParticles';
import { useSceneSettings } from '../hooks/useSceneSettings';
import { useEffect } from 'react';
import Lights from '../components/scene/Lights';
import Floor from '../components/scene/Floor';
import ControlsPanel from '../components/controls/ControlsPanel';
import PostProcessingFx from '@/ui/components/fx/PostProcessingFx';

const ModernCore = () => {
  const s = useSceneSettings();
  const mode: 'triangles' | 'points' = s.useTriangleParticles ? 'triangles' : 'points';

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        s.set('speed', s.speed === 0 ? 1 : 0);
        s.set('dieSpeed', s.dieSpeed === 0 ? 0.015 : 0);
      }
    };
    globalThis.addEventListener('keyup', onKeyUp);
    return () => globalThis.removeEventListener('keyup', onKeyUp);
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
        radius={s.radius * 150}
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

      <PostProcessingFx />
      <OrbitControls
        enableDamping={true}
        dampingFactor={0.1}
        maxDistance={1000}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.1}
        enablePan={false}
        target={[0, 50, 0]}
      />
    </>
  );
};

export default ModernCore;
