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
import type Lenis from 'lenis';
import { gsap, ScrollTrigger, MOTION, prefersReducedMotion } from './motion';

let lenis: Lenis | null = null;

// Lenis only smooths wheel scrolling; touch devices scroll natively, so they never download it.
async function initLenis() {
  if (!FINE_POINTER) return;
  const { default: LenisCtor } = await import('lenis');
  lenis = new LenisCtor({ lerp: 0.12 });
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

// Internal navigations skip the entrance entirely (the inline head script only
// adds fx-entrance on fresh visits/reloads): content is visible from the first
// frame and the view transition carries the polish. Below-the-fold reveals
// still choreograph on scroll either way.
const ENTRANCE = document.documentElement.classList.contains('fx-entrance');

// Spotlight/magnetic are pointer-chasing effects — hover-capable mice only.
const FINE_POINTER = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Below the desktop nav breakpoint (lg) columns stack, so a [data-reveal]
// block (heading, bar, copy, CTA, form…) is taller than one glance. There it
// reveals its children one by one instead of fading in as a single slab.
const STACKED = matchMedia('(max-width: 1023px)').matches;

const delayOf = (el: Element) =>
  parseFloat(el.getAttribute('data-reveal-delay') ?? '0') || 0;

// Whole viewport, not the 88% scroll line: a block already visible at load (the hero CTAs pinned to
// the bottom of a phone screen) must enter with the page instead of waiting, invisible, for a scroll.
const inView = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight;

// In-view elements animate immediately (page entrance); others on scroll.
// On a late boot or non-entrance navigation, in-view elements are already on
// screen — leave them alone.
const skipEntrance = (el: Element) => (LATE_BOOT || !ENTRANCE) && inView(el);

/** Reveal each element as it reaches the viewport. Elements that cross the
    line together (a grid row, a fast flick) share one staggered tween, so a
    stacked column enters card by card instead of all at once when its top
    appears — and off-screen items never burn their animation unseen.
    opacity, not autoAlpha: visibility:hidden drops links below the fold from
    the Tab order; focusing one scrolls it into view, which fires its reveal. */
function revealEach(items: Element[], { delay = 0, fadeOnly = false } = {}) {
  const from = { opacity: 0, y: fadeOnly ? 0 : MOTION.revealY };
  const to = { opacity: 1, y: 0, duration: MOTION.duration, delay, stagger: MOTION.stagger, ease: MOTION.ease };
  // display:none children (honeypots, empty states) have no box to trigger on.
  const shown = items.filter((el) => el.getClientRects().length > 0 && !skipEntrance(el));
  const now = shown.filter(inView);
  const later = shown.filter((el) => !inView(el));
  if (now.length) gsap.fromTo(now, from, to);
  if (!later.length) return;
  gsap.set(later, from);
  ScrollTrigger.batch(later, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, to),
  });
}

const triggerFor = (el: Element) =>
  inView(el)
    ? {}
    : { scrollTrigger: { trigger: el, start: 'top 88%', once: true } };

function initChoreography() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const parts = STACKED && el.children.length > 1 ? [...el.children] : [el];
    revealEach(parts, { delay: delayOf(el), fadeOnly: el.getAttribute('data-reveal') === 'fade' });
  });

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    revealEach([...group.children], { delay: delayOf(group) });
  });

  // Author-defined masked lines (markup provides the overflow-hidden wrappers).
  document.querySelectorAll('[data-lines]').forEach((el) => {
    const onLoad = el.getAttribute('data-lines') === 'load';
    gsap.set(el, { autoAlpha: 1 });
    if (skipEntrance(el)) return;
    gsap.from(el.querySelectorAll('[data-line]'), {
      yPercent: 112,
      duration: 0.6,
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

  // Section divider bars grow in alongside their heading's reveal.
  document.querySelectorAll<HTMLElement>('[data-bar]').forEach((el) => {
    if (skipEntrance(el)) return;
    const origin = el.getAttribute('data-bar') === 'center' ? '50% 50%' : '0% 50%';
    gsap.fromTo(
      el,
      { scaleX: 0, transformOrigin: origin },
      {
        scaleX: 1,
        duration: 0.7,
        delay: delayOf(el),
        ease: MOTION.easeLong,
        ...triggerFor(el),
      }
    );
  });

  // Decorative shapes drift against the scroll and breathe slowly — the hero
  // keeps living after the entrance without touching any content.
  document.querySelectorAll<HTMLElement>('[data-drift]').forEach((el) => {
    const strength = parseFloat(el.getAttribute('data-drift') ?? '6') || 6;
    gsap.fromTo(
      el,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') ?? el,
          scrub: true,
          start: 'top bottom',
          end: 'bottom top',
        },
      }
    );
    gsap.to(el, { scale: 1.04, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
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
// No page-level fade: it reads as load delay. The page shows the instant the
// script runs; the per-element reveals (all starting at t=0) carry the polish.
function entrance() {
  gsap.set('[data-page]', { opacity: 1 });
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

/* ---------- Pointer micro-interactions (fine pointers only) ---------- */

// Cards carry a soft brand glow that follows the cursor; the CSS owns the
// gradient and hover fade, we only feed it coordinates.
function initSpotlight() {
  if (!FINE_POINTER) return;
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--fx-mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--fx-my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

// Fact numbers count up from zero each time their card is entered. The real
// value sits in an sr-only twin, so screen readers never hear the ticking.
function initCountUp() {
  if (!FINE_POINTER) return;
  document.querySelectorAll<HTMLElement>('[data-countup]').forEach((el) => {
    const end = Number(el.dataset.countup);
    if (!Number.isFinite(end)) return;
    const n = { v: 0 };
    el.closest('[data-trace]')?.addEventListener('pointerenter', () => {
      gsap.fromTo(n, { v: 0 }, {
        v: end, duration: 0.9, ease: 'power3.out', overwrite: true,
        onUpdate: () => { el.textContent = String(Math.round(n.v)); },
      });
    });
  });
}

// Primary CTAs lean a few pixels toward the cursor and spring back. GSAP owns
// the whole transform (the markup deliberately has no hover:scale on these),
// so transform is excluded from the CSS transition to avoid the two fighting.
function initMagnetic() {
  if (!FINE_POINTER) return;
  const MAX = 7;
  const PULL = 0.22;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.style.transitionProperty =
      'color, background-color, border-color, opacity, filter, box-shadow';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    let rect: DOMRect | null = null;
    el.addEventListener('pointerenter', () => {
      rect = el.getBoundingClientRect(); // rest-state rect, before any pull
      gsap.to(el, { scale: 1.04, duration: 0.35, ease: 'power3.out' });
    });
    el.addEventListener('pointermove', (e) => {
      if (!rect) return;
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      xTo(gsap.utils.clamp(-MAX, MAX, dx * PULL));
      yTo(gsap.utils.clamp(-MAX, MAX, dy * PULL));
    });
    el.addEventListener('pointerleave', () => {
      rect = null;
      xTo(0);
      yTo(0);
      gsap.to(el, { scale: 1, duration: 0.45, ease: 'power3.out' });
    });
  });
}

// Hero photo leans toward the cursor in 3D while its offset outline drifts the other way, so the
// gap between them opens like a shadow. Tracked over the whole hero, eased by GSAP.
function initTilt() {
  if (!FINE_POINTER) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((fig) => {
    const photo = fig.querySelector<HTMLElement>('[data-tilt-photo]');
    const shadow = fig.querySelector<HTMLElement>('[data-tilt-shadow]');
    const area = fig.closest('section');
    if (!photo || !shadow || !area) return;
    gsap.set(photo, { transformPerspective: 900 });
    // GSAP folds the outline's Tailwind translate (16px) into x/y; keep it as the rest offset.
    const ox = gsap.getProperty(shadow, 'x') as number;
    const oy = gsap.getProperty(shadow, 'y') as number;
    const to = (t: HTMLElement, p: string) => gsap.quickTo(t, p, { duration: 0.8, ease: 'power3.out' });
    const [px, py, rx, ry, sx, sy] = [
      to(photo, 'x'), to(photo, 'y'), to(photo, 'rotationX'), to(photo, 'rotationY'),
      to(shadow, 'x'), to(shadow, 'y'),
    ];
    const move = (nx: number, ny: number) => {
      px(nx * 14); py(ny * 10); ry(nx * 6); rx(-ny * 5);
      sx(ox - nx * 12); sy(oy - ny * 10);
    };
    const clamp = gsap.utils.clamp(-1, 1);
    area.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      move(
        clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)),
        clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)),
      );
    });
    area.addEventListener('pointerleave', () => move(0, 0));
  });
}

// Sticky header earns its shadow only once content actually slides under it.
function initElevate() {
  const el = document.querySelector<HTMLElement>('[data-elevate]');
  if (!el) return;
  // The bar compacts over the first 80px of scroll (≥ the largest --header-shrink, so the header never
  // slides up faster than the page) and grows back the same way; no transition, so no lag or jump.
  const update = (y: number) => {
    el.style.setProperty('--fx-hp', String(Math.min(Math.max(y / 80, 0), 1)));
    el.classList.toggle('fx-elevated', y > 8);
  };
  // Native scroll fires for Lenis too (it scrolls the window), so one listener covers both.
  addEventListener('scroll', () => update(window.scrollY), { passive: true });
  update(window.scrollY);
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
    // preventDefault also cancels the native focus move; keyboard users (skip link) need it.
    target.focus({ preventScroll: true });
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
  initLenis().catch(() => {}); // native scrolling stays if the chunk fails to load
  initChoreography();
  entrance();
  initParticles();
  initSpotlight();
  initCountUp();
  initMagnetic();
  initTilt();
  initElevate();
}
