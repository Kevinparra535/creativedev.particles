import { useSceneSettings } from '../hooks/useSceneSettings';
import { useEffect } from 'react';
import LegacyPostProcessing from '@/legacy/LegacyPostProcessing';
import LegacyLights from '@/legacy/LegacyLights';
import LegacyFloor from '@/legacy/LegacyFloor';
import LegacyGUI from '@/legacy/LegacyGUI';
import LegacyParticles from '@/legacy/LegacyParticles';
import LegacyControls from '@/legacy/LegacyControls';

const LegacyCore = () => {
  const s = useSceneSettings();

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
      <LegacyLights />
      <LegacyFloor />
      <LegacyGUI />
      <LegacyParticles />
      <LegacyControls />
      <LegacyPostProcessing />
    </>
  );
};

export default LegacyCore;
