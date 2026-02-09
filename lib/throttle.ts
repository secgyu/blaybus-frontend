export function throttleTrailing<T extends (...args: any[]) => void>(
  fn: T,
  wait: number
) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;

  return (...args: Parameters<T>) => {
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
        if (lastArgs) fn(...(lastArgs as Parameters<T>));
        lastArgs = null;
      }, remaining);
    }
  };
}
