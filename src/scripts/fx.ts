/**
 * Site-wide motion layer. Markup opts into choreography via data attributes
 * (data-reveal, data-reveal-group, data-lines, data-split, data-clip,
 * data-parallax, data-count, data-flow-item, data-particles); this file is the
 * only place animations are defined. The inline head script adds `fx-motion`
 * to <html> pre-paint; the stylesheet hides entrance elements only under that
 * class and force-reveals them via failsafe keyframes if this module dies.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger, SplitText, MOTION, prefersReducedMotion } from './motion';

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
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------- Scroll choreography (declarative data-attribute API) ---------- */

const delayOf = (el: Element) =>
  parseFloat(el.getAttribute('data-reveal-delay') ?? '0') || 0;

// In-view elements animate immediately (page entrance); others on scroll.
const triggerFor = (el: Element) =>
  el.getBoundingClientRect().top < window.innerHeight * 0.88
    ? {}
    : { scrollTrigger: { trigger: el, start: 'top 88%', once: true } };

function initChoreography() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
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
    gsap.from(el.querySelectorAll('[data-line]'), {
      yPercent: 112,
      duration: 1.15,
      delay: delayOf(el),
      stagger: MOTION.stagger,
      ease: MOTION.easeLong,
      ...(onLoad ? {} : triggerFor(el)),
    });
  });

  // Auto-split masked lines — body/medium text only, never huge display type.
  document.querySelectorAll('[data-split]').forEach((el) => {
    const onLoad = el.getAttribute('data-split') === 'load';
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        gsap.set(el, { autoAlpha: 1 });
        return gsap.from(self.lines, {
          yPercent: 112,
          duration: 1.15,
          delay: delayOf(el),
          stagger: MOTION.stagger,
          ease: MOTION.easeLong,
          ...(onLoad ? {} : triggerFor(el)),
        });
      },
    });
  });

  // Image wipe from bottom + scale-settle.
  document.querySelectorAll('[data-clip]').forEach((el) => {
    const img = el.querySelector('img');
    const tl = gsap.timeline({ delay: delayOf(el), ...triggerFor(el) });
    tl.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: MOTION.easeLong }
    );
    if (img) {
      tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, '<');
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

  // Count numeric text up once visible, preserving prefix/suffix + zero-padding.
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
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
      duration: 1.6,
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
  gsap.fromTo(
    '[data-page]',
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: 'power2.out' }
  );
}

/* ---------- Signature interaction: flowing service rows ---------- */

function initFlowMenu() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-flow-item]').forEach((item) => {
    const band = item.querySelector<HTMLElement>('[data-flow-band]');
    const marquee = item.querySelector<HTMLElement>('[data-flow-marquee]');
    if (!band || !marquee) return;

    // y: 0 clears the inline no-JS fallback transform, which GSAP would
    // otherwise parse as a px offset and stack underneath yPercent.
    gsap.set(band, { yPercent: 101, y: 0 });
    const flow = gsap.to(marquee, {
      xPercent: -50,
      repeat: -1,
      duration: 16,
      ease: 'none',
      paused: true,
    });

    // Edge detection: the band always chases the cursor.
    const fromTop = (e: MouseEvent) => {
      const rect = item.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    };

    // killTweensOf before each new tween: enter/leave tweens otherwise coexist
    // on rapid hover cycles (GSAP doesn't overwrite by default) and the band
    // can end up stuck covering the row.
    item.addEventListener('mouseenter', (e) => {
      gsap.killTweensOf(band);
      flow.play();
      gsap
        .timeline()
        .set(band, { yPercent: fromTop(e) ? -101 : 101 })
        .to(band, { yPercent: 0, duration: 0.5, ease: 'expo.out' });
    });

    item.addEventListener('mouseleave', (e) => {
      gsap.killTweensOf(band);
      gsap.to(band, {
        yPercent: fromTop(e) ? -101 : 101,
        duration: 0.45,
        ease: 'expo.out',
        onComplete: () => flow.pause(),
      });
    });
  });
}

/* ---------- Ambient particle canvas (night sections) ---------- */

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
        // Brand atmosphere: secondary mauve + cream motes.
        ctx.fillStyle = m.warm
          ? `rgba(176, 151, 150, ${alpha})`
          : `rgba(236, 226, 225, ${alpha * 0.7})`;
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

/* ---------- Anchors, header state, scroll locking ---------- */

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

function initHeaderState() {
  const header = document.querySelector('header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
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

initHeaderState();
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
  initFlowMenu();
  initParticles();
}
