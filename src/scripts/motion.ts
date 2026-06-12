import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Shared motion vocabulary — keep every animation on the same eases/durations.
    Tuned snappy: reveals must read as polish, never as a loading state. */
export const MOTION = {
  ease: 'power3.out',
  easeLong: 'power4.out',
  duration: 0.55,
  stagger: 0.06,
  revealY: 20,
} as const;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
