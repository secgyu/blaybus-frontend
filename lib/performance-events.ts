import type { EventManager } from '@react-three/fiber';
import { events } from '@react-three/fiber';

export const performanceEvents = (
  store: Parameters<typeof events>[0]
): EventManager<HTMLElement> => {
  const defaultEvents = events(store);
  let lastCall = 0;

  return {
    ...defaultEvents,
    compute: (...args) => {
      const now = performance.now();
      if (now - lastCall < 50) return;

      lastCall = now;
      defaultEvents.compute?.(...args);
    },
  };
};
