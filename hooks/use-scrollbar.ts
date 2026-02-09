import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollbarResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  scrollRatio: number;
  thumbRatio: number;
  updateScrollbar: () => void;
}

export function useScrollbar<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = []
): UseScrollbarResult<T> {
  const ref = useRef<T>(null);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [thumbRatio, setThumbRatio] = useState(1);

  const updateScrollbar = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setScrollRatio(0);
      setThumbRatio(1);
    } else {
      setScrollRatio(scrollTop / maxScroll);
      setThumbRatio(clientHeight / scrollHeight);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateScrollbar();
    el.addEventListener('scroll', updateScrollbar);
    return () => el.removeEventListener('scroll', updateScrollbar);
  }, [updateScrollbar, ...deps]);

  return { ref, scrollRatio, thumbRatio, updateScrollbar };
}
