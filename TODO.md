Siguientes pasos opcionales

Variante fiel: implementar material de motion vectors y un pass dedicado (más trabajo, resultado más cercano al original).

Calidad adaptativa: puedo mapear los niveles del hook para cambiar presets de efectos (por ejemplo, desactivar DOF y dejar sólo SMAA+Vignette en calidades bajas).




# Motion Blur
Siguientes pasos opcionales

Ajustar DEFAULT_QUALITY_LEVELS para incluir postProcessing=false en calidades medias/bajas y aprovechar el auto gating.
Si más adelante quieres un motion blur fiel al legacy con motion vectors, puedo planificar una implementación por fases (material de velocidad, buffers de depth/velocity y pass de muestreo).


# DOF
Siguientes pasos opcionales

DOF con enfoque dinámico “a lo legacy”: leer un depth buffer o samplear distancia y suavizar el foco (puedo implementarlo si lo quieres).
Presets: añado botones en Leva para “Legacy-like”, “Cinematic”, “Subtle” que setean todos los sliders de una.
Ajustar usePerformanceOptimization para activar postProcessing solo en High/Ultra y atenuar bloom/dof en Medium.