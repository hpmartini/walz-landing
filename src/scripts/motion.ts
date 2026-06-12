import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Shared motion vocabulary — keep every animation on the same eases/durations.
    Tuned snappy: reveals must read as polish, never as a loading state.
    Eases are deliberately gentle (power2/power3): steeper out-eases dump all
    visible movement into the first third of the tween and then crawl — combined
    with sequential delays that reads as "start, stall, continue". */
export const MOTION = {
  ease: 'power2.out',
  easeLong: 'power3.out',
  duration: 0.5,
  stagger: 0.06,
  revealY: 20,
} as const;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
