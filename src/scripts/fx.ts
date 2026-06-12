/**
 * Site-wide motion layer. Markup opts into choreography via data attributes
 * (data-reveal, data-reveal-group, data-reveal-delay, data-lines, data-clip,
 * data-parallax, data-count, data-particles); this file is the only place
 * animations are defined. The inline head script adds `fx-motion` to <html>
 * pre-paint; the stylesheet hides entrance elements only under that class and
 * force-reveals them via failsafe keyframes if this module dies.
 *
 * The visual design (cards, rounded corners, type scale) is untouched by this
 * layer — it only choreographs how the existing design enters the viewport.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger, MOTION, prefersReducedMotion } from './motion';

let lenis: Lenis | null = null;

function initLenis() {
  lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  // Exposed for QA tooling (scroll scripting in browser automation).
  (window as unknown as { __lenis: Lenis }).__lenis = lenis;

  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Late-loading images shift layout; re-measure triggers once settled.
  // rAF-wrapped so the forced reflow lands between frames, not mid-tween.
  window.addEventListener('load', () =>
    requestAnimationFrame(() => ScrollTrigger.refresh())
  );
}

/* ---------- Scroll choreography (declarative data-attribute API) ---------- */

// If this module loads slowly (dev server, cold cache, slow network), the CSS
// failsafe has already revealed the page. Entrance animations must then NEVER
// re-hide visible content — that reads as "appears, blinks off, replays".
// Threshold sits safely below the 1.0s [data-page] failsafe delay.
const LATE_BOOT = performance.now() > 800;

const delayOf = (el: Element) =>
  parseFloat(el.getAttribute('data-reveal-delay') ?? '0') || 0;

const inView = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight * 0.88;

// In-view elements animate immediately (page entrance); others on scroll.
// On a late boot, in-view elements are already on screen — leave them alone.
const skipEntrance = (el: Element) => LATE_BOOT && inView(el);

const triggerFor = (el: Element) =>
  inView(el)
    ? {}
    : { scrollTrigger: { trigger: el, start: 'top 88%', once: true } };

function initChoreography() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (skipEntrance(el)) return;
    const fadeOnly = el.getAttribute('data-reveal') === 'fade';
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: fadeOnly ? 0 : MOTION.revealY },
      {
        autoAlpha: 1,
        y: 0,
        duration: MOTION.duration,
        delay: delayOf(el),
        ease: MOTION.ease,
        ...triggerFor(el),
      }
    );
  });

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    if (skipEntrance(group)) return;
    gsap.fromTo(
      group.children,
      { autoAlpha: 0, y: MOTION.revealY },
      {
        autoAlpha: 1,
        y: 0,
        duration: MOTION.duration,
        delay: delayOf(group),
        stagger: MOTION.stagger,
        ease: MOTION.ease,
        ...triggerFor(group),
      }
    );
  });

  // Author-defined masked lines (markup provides the overflow-hidden wrappers).
  document.querySelectorAll('[data-lines]').forEach((el) => {
    const onLoad = el.getAttribute('data-lines') === 'load';
    gsap.set(el, { autoAlpha: 1 });
    if (skipEntrance(el)) return;
    gsap.from(el.querySelectorAll('[data-line]'), {
      yPercent: 112,
      duration: 0.75,
      delay: delayOf(el),
      stagger: MOTION.stagger,
      ease: MOTION.easeLong,
      ...(onLoad ? {} : triggerFor(el)),
    });
  });

  // Image wipe from bottom + scale-settle.
  document.querySelectorAll('[data-clip]').forEach((el) => {
    if (skipEntrance(el)) return;
    const img = el.querySelector('img');
    const tl = gsap.timeline({ delay: delayOf(el), ...triggerFor(el) });
    tl.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: MOTION.easeLong }
    );
    if (img) {
      tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.0, ease: 'power2.out' }, '<');
    }
  });

  // Scrubbed drift; target pre-scaled so edges never show.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const strength = parseFloat(el.getAttribute('data-parallax') ?? '6') || 6;
    const target = el.querySelector('img') ?? el;
    gsap.set(target, { scale: 1 + (strength * 2.4) / 100 });
    gsap.fromTo(
      target,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: 'none',
        scrollTrigger: { trigger: el, scrub: true, start: 'top bottom', end: 'bottom top' },
      }
    );
  });

  // Count numeric text up once visible, preserving prefix/suffix.
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    if (skipEntrance(el)) return;
    const raw = el.textContent ?? '';
    const match = raw.match(/^(\D*?)(\d+)(\D*)$/);
    if (!match) return;
    const [, prefix, digits, suffix] = match;
    const end = parseInt(digits, 10);
    // Only preserve padding for genuinely zero-padded sources ('07'), so
    // '14' counts 0…14 instead of '00'…'14'.
    const pad = digits.startsWith('0') ? digits.length : 0;
    const state = { value: 0 };
    gsap.to(state, {
      value: end,
      duration: 1.2,
      ease: 'power2.out',
      snap: { value: 1 },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => {
        el.textContent = `${prefix}${String(Math.round(state.value)).padStart(pad, '0')}${suffix}`;
      },
    });
  });
}

/* ---------- Page entrance ---------- */

// Opacity-only on purpose, twice over: a transform here would turn [data-page]
// into the containing block for the fixed chat widget, and autoAlpha would add
// an inline visibility:hidden that the opacity-only CSS failsafe could never
// rescue. Never clearProps opacity — the stylesheet pre-hides [data-page] and
// would re-blank the page.
function entrance() {
  // Late boot: the failsafe revealed (or is about to reveal) the page —
  // re-hiding it for a fade would blink visible content off. Show instantly.
  if (LATE_BOOT) {
    gsap.set('[data-page]', { opacity: 1 });
    return;
  }
  gsap.fromTo(
    '[data-page]',
    { opacity: 0 },
    { opacity: 1, duration: 0.35, ease: 'power2.out' }
  );
}

/* ---------- Ambient particle canvas ---------- */

type Mote = {
  x: number; y: number; r: number; vy: number;
  drift: number; phase: number; flicker: number; warm: boolean;
};

function initParticles() {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-particles]').forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let motes: Mote[] = [];
    let raf = 0;
    let running = false;
    let last = 0;

    const spawn = (w: number, h: number, atBottom: boolean): Mote => ({
      x: Math.random() * w,
      y: atBottom ? h + 10 : Math.random() * h,
      r: 0.6 + Math.random() * 1.4,
      vy: 8 + Math.random() * 18,
      drift: 4 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      flicker: 0.5 + Math.random() * 1.2,
      warm: Math.random() < 0.7,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(26, Math.round((width * height) / 38000));
      motes = Array.from({ length: count }, () => spawn(width, height, false));
    };

    const frame = (t: number) => {
      if (!running) return;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y -= m.vy * dt;
        m.x += Math.sin(t / 1000 + m.phase) * m.drift * dt;
        if (m.y < -10) motes[i] = spawn(w, h, true);

        const alpha = 0.12 + 0.22 * (0.5 + 0.5 * Math.sin(t / 350 / m.flicker + m.phase));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        // Brand atmosphere on the mauve section: light secondary + white motes.
        ctx.fillStyle = m.warm
          ? `rgba(236, 226, 225, ${alpha})`
          : `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: '60px' }
    ).observe(canvas);
    new ResizeObserver(resize).observe(canvas);
  });
}

/* ---------- Anchors and scroll locking ---------- */

// Lenis fights native fragment jumps — handle in-page anchors ourselves.
// lenis.scrollTo(el) already honors scroll-margin-top; never add an offset.
function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#') || href === '#') return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    e.preventDefault();
    history.pushState(null, '', href);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}

// Overlays (chat widget) announce open/close; we park/resume the smooth scroller.
function initScrollLock() {
  window.addEventListener('fx:lock-scroll', () => {
    lenis?.stop();
    document.documentElement.classList.add('overflow-hidden');
  });
  window.addEventListener('fx:unlock-scroll', () => {
    lenis?.start();
    document.documentElement.classList.remove('overflow-hidden');
  });
}

/* ---------- Boot ---------- */

initScrollLock();
initAnchors();

if (prefersReducedMotion()) {
  // Defense #2 (of 3): the inline script never adds the class under reduced
  // motion, but remove it anyway in case the preference changed mid-session.
  document.documentElement.classList.remove('fx-motion');
} else {
  initLenis();
  initChoreography();
  entrance();
  initParticles();
}
