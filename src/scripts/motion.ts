import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Shared motion vocabulary — keep every animation on the same eases/durations. */
export const MOTION = {
  ease: 'power3.out',
  easeLong: 'power4.out',
  duration: 0.9,
  stagger: 0.09,
  revealY: 28,
} as const;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger, SplitText };
