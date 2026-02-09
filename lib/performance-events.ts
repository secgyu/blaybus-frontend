import { events } from '@react-three/fiber';

export const performanceEvents = (store: any) => {
  const defaultEvents = events(store);
  let lastCall = 0;

  return {
    ...defaultEvents,
    compute: (event: any, state: any) => {
      const now = performance.now();
      if (now - lastCall < 50) return;

      lastCall = now;
      defaultEvents.compute?.(event, state);
    },
  };
};
