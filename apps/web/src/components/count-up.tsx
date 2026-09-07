'use client';

import { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  value: number;
  duration?: number;
};

/**
 * Görünəndə 0-dan value-ya sayan rəqəm animasiyası.
 * SSR-də son dəyəri render edir (SEO / JS-siz), IntersectionObserver
 * tetiklənəndə 0-dan animasiya ilə sayır. prefers-reduced-motion
 * halında animasiya atlanır.
 */
export function CountUp({ value, duration = 1200 }: CountUpProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = spanRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        observer.disconnect();
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setDisplay(Math.round(value * eased));
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [duration, value]);

  return <span ref={spanRef}>{display}</span>;
}
