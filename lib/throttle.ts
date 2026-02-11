export function throttleTrailing<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number
) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | null = null;

  return (...args: A) => {
    const now = performance.now();
    const remaining = wait - (now - last);
    lastArgs = args;

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      fn(...args);
      lastArgs = null;
      return;
    }

    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        last = performance.now();
        if (lastArgs) fn(...lastArgs);
        lastArgs = null;
      }, remaining);
    }
  };
}
