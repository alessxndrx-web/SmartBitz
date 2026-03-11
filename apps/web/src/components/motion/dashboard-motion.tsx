'use client';

import { useEffect, useRef, type PropsWithChildren } from 'react';
import gsap from 'gsap';

export function DashboardMotion({ children }: PropsWithChildren) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.motion-fade-up',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.08,
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
