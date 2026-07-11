'use client';

import { useEffect, useRef } from 'react';
import { startMagmaFissureField } from '@/source/background/magmaFissureParticleField';

export function MagmaFissureBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const stopField = startMagmaFissureField(canvas);
    return stopField;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-fissure-gradient" />
    </div>
  );
}
