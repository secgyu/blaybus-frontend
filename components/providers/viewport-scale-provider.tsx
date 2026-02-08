'use client';

import { useEffect } from 'react';

const DESIGN_BASE = 1920 / 0.9;

export function ViewportScaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const updateScale = () => {
      const scale = Math.min(window.innerWidth / DESIGN_BASE, 1);
      const html = document.documentElement;
      html.style.zoom = `${scale}`;
      html.style.setProperty('--viewport-scale', `${scale}`);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      document.documentElement.style.zoom = '';
      document.documentElement.style.removeProperty('--viewport-scale');
    };
  }, []);

  return <>{children}</>;
}
