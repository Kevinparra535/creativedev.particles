# Motion Blur plan
 
 MeshMotionMaterial encodes screen-space velocity in RG (0..1) and speed in B.
 Next step: create a custom postprocessing pass that:
  1) renders velocity buffer using MeshMotionMaterial into a separate low-res target (quality dependent).
  2) full-screen pass samples along velocity direction (N taps scaled by motionMultiplier and speed), accumulating color from previous frame or color buffer.
  3) optional depth rejection to avoid bleeding.
 
 For R3F, either:
  - implement a custom Effect (extend from postprocessing's Effect) with a fragment shader sampling the main color texture and a velocity texture.
  - or a two-pass approach: first render velocity with <primitive object={triangles.motionMaterial} />, then consume in EffectComposer.
 
 Wiring needed in LegacyParticles: expose a velocity render group or ref to the motion material.