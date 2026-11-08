// Hero and /kontakt geometry for issue #12 (AC-1 to AC-8, AC-11) against a built or deployed site.
// Usage: node scripts/review/hero.cjs <base-url> <out-dir> [before.json]
// Writes <out-dir>/hero.json and a screenshot per viewport. With before.json the "smaller/higher than
// before" parts of AC-4 and AC-11 are checked too. Elements are found by their text, not by classes,
// so the same script measures the old and the new layout.
//
// The hero encodes the owner's decision: the approved title, the bordered box, the approved lead,
// two CTAs and nothing else. The hero fills the screen under the sticky header, and the white hero
// text keeps at least 4.5:1 against the brightest pixel behind every text box (AC-8).
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
// PLAYWRIGHT_DIR picks another install, e.g. one whose WebKit revision is already in the browser cache.
const pwDir = process.env.PLAYWRIGHT_DIR || path.join(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'playwright');
const { chromium, webkit } = require(pwDir);

const BASE = process.argv[2].replace(/\/$/, '');
const OUT = process.argv[3] || 'review-assets/12/hero';
const BEFORE = process.argv[4] ? JSON.parse(fs.readFileSync(process.argv[4], 'utf8')) : null;
fs.mkdirSync(OUT, { recursive: true });

const MOBILE = [[411, 770], [320, 560], [360, 640], [390, 664], [390, 844], [360, 740]];
const DESKTOP = [[1440, 900], [1280, 720], [1024, 640], [1024, 600], [844, 390]];
const RUNS = [
  ...MOBILE.map(([w, h]) => ({ engine: 'chromium', w, h, mobile: true })),
  { engine: 'webkit', w: 390, h: 664, mobile: true }, // iOS Safari engine for svh
  ...DESKTOP.map(([w, h]) => ({ engine: 'chromium', w, h, mobile: false })),
];

const TITLE = 'Ihr Steuerberater in Schwalmstadt';
const BOX = 'Generationenübergreifend vertrauen uns Unternehmer, Selbstständige, Privatpersonen und Vereine.';
const LEAD = 'Ob Sie ein Unternehmen gründen, laufende steuerliche Aufgaben abgeben oder Ihre private Steuererklärung erstellen lassen möchten: Die Kanzlei Karsten Walz unterstützt Sie bei Ihren nächsten Schritten. Lernen Sie unsere Leistungen und die Menschen dahinter kennen.';
// Every white text run in the hero; AC-8 fails if the contrast sample misses one of them.
const WHITE_TEXTS = ['Ihr Steuerberater', 'Generationenübergreifend', 'vertrauen uns', 'Unternehmer, Selbstständige,', 'Privatpersonen und Vereine.', 'Ob Sie ein Unternehmen', 'Passende Leistung'];

let failures = 0;
const results = {};
const check = (ac, ok, msg) => {
  (results[ac] ??= []).push(ok);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${ac}: ${msg}`);
  if (!ok) failures++;
};

// Runs in the page. Returns plain numbers so before/after JSONs compare directly.
function measureHome() {
  const r = (e) => e.getBoundingClientRect();
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;height:100svh;width:1px;visibility:hidden';
  document.body.appendChild(probe);
  const svh = probe.getBoundingClientRect().height;
  probe.remove();
  const header = document.querySelector('header');
  const hero = document.querySelector('main section');
  const byText = (sel, start) => [...hero.querySelectorAll(sel)].find((e) => e.textContent.trim().startsWith(start));
  const titleLine = byText('span', 'Ihr Steuerberater in Schwalmstadt');
  const box = byText('span', 'Generationenübergreifend');
  const subtitle = byText('p', 'Ob Sie ein Unternehmen');
  const hint = hero.querySelector('#hero-cta-note');
  const cta1 = hero.querySelector('a[href="/kontakt?anliegen=erstgespraech"]');
  const cta2 = hero.querySelector('a[href="#leistungen"]');
  const h1 = hero.querySelector('h1');
  const heroR = r(hero);
  // AC-2: every text-bearing element fully visible: no own overflow, not clipped by the hero, no clamp/ellipsis.
  const clipped = [];
  for (const e of hero.querySelectorAll('*')) {
    const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const s = getComputedStyle(e), b = r(e);
    const why = [];
    if (e.scrollHeight > e.clientHeight + 1 && s.display !== 'inline') why.push(`scrollH ${e.scrollHeight}>${e.clientHeight}`);
    if (e.scrollWidth > e.clientWidth + 1 && s.display !== 'inline') why.push(`scrollW ${e.scrollWidth}>${e.clientWidth}`);
    if (s.webkitLineClamp && s.webkitLineClamp !== 'none') why.push('line-clamp');
    if (s.textOverflow === 'ellipsis') why.push('ellipsis');
    if (b.top < heroR.top - 1 || b.bottom > heroR.bottom + 1 || b.left < heroR.left - 1 || b.right > heroR.right + 1) why.push('outside hero');
    if (why.length) clipped.push(`${e.tagName.toLowerCase()} "${e.textContent.trim().slice(0, 30)}": ${why.join(', ')}`);
  }
  const fs = (e) => parseFloat(getComputedStyle(e).fontSize);
  const c1 = r(cta1), c2 = r(cta2);
  return {
    scrollY: window.scrollY, innerHeight, innerWidth, svh,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    headerBottom: r(header).bottom, headerHeight: r(header).height,
    heroTop: heroR.top, heroBottom: heroR.bottom, heroHeight: heroR.height,
    titleTop: r(h1).top, h1Top: r(h1).top,
    cta1: { top: c1.top, bottom: c1.bottom }, cta2: { top: c2.top, bottom: c2.bottom },
    ctaBlockBottom: Math.max(c1.bottom, c2.bottom),
    leadBottom: r(subtitle).bottom,
    h1Text: h1.textContent.replace(/\s+/g, ' ').trim(),
    boxText: box ? box.textContent.replace(/\s+/g, ' ').trim() : '',
    leadText: subtitle ? subtitle.textContent.replace(/\s+/g, ' ').trim() : '',
    describedby: cta1.getAttribute('aria-describedby') || '',
    hasHint: !!hint,
    links: hero.querySelectorAll('a').length,
    font: { title: fs(titleLine), box: box ? fs(box) : null, subtitle: fs(subtitle), cta: fs(cta1) },
    clipped,
  };
}

// AC-8: hide the white hero text, screenshot the hero background and measure the contrast of white
// text against the brightest pixel behind every text line. The sample area is the line box of the
// text itself (a Range over the text node), so the decorative border of the box is not mistaken for
// the background of the text.
async function measureContrast(page) {
  const boxes = await page.evaluate(() => {
    const hero = document.querySelector('main section');
    const out = [];
    const sampled = [];
    for (const e of hero.querySelectorAll('*')) {
      const textNodes = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
      if (!textNodes.length) continue;
      const s = getComputedStyle(e);
      const m = s.color.match(/rgba?\(([^)]+)\)/);
      if (!m) continue;
      const [r, g, b, a = 1] = m[1].split(',').map((v) => parseFloat(v));
      if (a < 0.5 || r < 250 || g < 250 || b < 250) continue; // only white text is checked
      const rects = [];
      for (const n of textNodes) {
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const rc of range.getClientRects()) {
          if (rc.width < 2 || rc.height < 2) continue;
          rects.push({ x: rc.left, y: rc.top, w: rc.width, h: rc.height });
        }
      }
      if (!rects.length) continue;
      out.push({
        label: e.tagName.toLowerCase() + ' "' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 28) + '"',
        rects,
      });
      sampled.push(e);
    }
    // Hide only after collecting: children inherit the colour and would be skipped otherwise.
    for (const e of sampled) e.style.color = 'transparent';
    return out;
  });
  // Fixed overlays (chat launcher) sit on top of the hero but are not its background.
  await page.evaluate(() => {
    document.querySelectorAll('[data-vt="chat"]').forEach((e) => { e.style.visibility = 'hidden'; });
  });
  const raw = await page.screenshot({ encoding: 'base64' });
  const shot = typeof raw === 'string' ? raw : raw.toString('base64');
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const samples = await page.evaluate(async ({ shot, boxes, dpr }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + shot;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const lum = (r, g, b) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    return boxes.map((b) => {
      let maxL = -1, px = [0, 0, 0];
      for (const r of b.rects) {
        const x = Math.max(0, Math.round(r.x * dpr));
        const y = Math.max(0, Math.round(r.y * dpr));
        const w = Math.max(1, Math.min(canvas.width - x, Math.round(r.w * dpr)));
        const h = Math.max(1, Math.min(canvas.height - y, Math.round(r.h * dpr)));
        const data = ctx.getImageData(x, y, w, h).data;
        for (let i = 0; i < data.length; i += 4) {
          const L = lum(data[i], data[i + 1], data[i + 2]);
          if (L > maxL) { maxL = L; px = [data[i], data[i + 1], data[i + 2]]; }
        }
      }
      return { label: b.label, rgb: px, contrast: 1.05 / (maxL + 0.05) };
    });
  }, { shot, boxes, dpr });
  return samples;
}

(async () => {
  const data = {};
  for (const run of RUNS) {
    const key = `${run.engine}-${run.w}x${run.h}`;
    const type = run.engine === 'webkit' ? webkit : chromium;
    const browser = run.engine === 'webkit'
      ? await type.launch().catch((e) => { console.log(`FAIL setup: webkit not installed (${e.message.split('\n')[0]})`); failures++; return null; })
      : await type.launch().catch(() => type.launch({ channel: 'chrome' }));
    if (!browser) continue;
    const ctx = await browser.newContext({ viewport: { width: run.w, height: run.h }, reducedMotion: 'reduce', isMobile: run.mobile && run.engine === 'chromium', hasTouch: run.mobile, deviceScaleFactor: run.mobile ? 2 : 1 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const home = await page.evaluate(measureHome);
    await page.screenshot({ path: `${OUT}/home-${key}.png` });
    const contrast = await measureContrast(page);
    let kontakt = null;
    if (run.mobile) {
      await page.goto(`${BASE}/kontakt`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      kontakt = await page.evaluate(() => ({ nameTop: document.querySelector('#name').getBoundingClientRect().top, innerHeight }));
      await page.screenshot({ path: `${OUT}/kontakt-${key}.png` });
    }
    data[key] = { ...run, home, contrast, kontakt };
    await browser.close();
  }
  fs.writeFileSync(`${OUT}/hero.json`, JSON.stringify(data, null, 2));

  const before = (key, f) => (BEFORE && BEFORE[key] ? f(BEFORE[key]) : null);
  for (const [key, d] of Object.entries(data)) {
    const h = d.home;
    const gap = Math.round(h.titleTop - h.headerBottom);
    // AC-7: the hero carries exactly the owner's version: title + box in the h1, the approved lead, two CTAs.
    check('AC-7', h.h1Text === `${TITLE} ${BOX}` && h.leadText === LEAD && h.links === 2 && !h.hasHint && !h.describedby,
      `${key} hero content: h1 "${h.h1Text.slice(0, 60)}", lead "${h.leadText.slice(0, 24)}...", ${h.links} links, hint ${h.hasHint ? 'present' : 'gone'}`);
    // AC-6: header + hero fill the viewport exactly at every width.
    check('AC-6', Math.abs(h.headerHeight + h.heroHeight - h.svh) <= 1,
      `${key} header ${h.headerHeight.toFixed(1)}px + hero ${h.heroHeight.toFixed(1)}px = ${(h.headerHeight + h.heroHeight).toFixed(1)}px vs 100svh ${h.svh}px`);
    if (!d.mobile) {
      check('AC-1', h.cta1.bottom <= h.innerHeight && h.cta2.bottom <= h.innerHeight, `${key} CTA bottoms ${Math.round(h.cta1.bottom)}/${Math.round(h.cta2.bottom)} <= ${h.innerHeight}`);
      check('AC-2', h.clipped.length === 0, `${key} clipped text: ${h.clipped.join('; ') || 'none'}`);
      check('AC-2', h.overflowX <= 0, `${key} horizontal overflow ${h.overflowX}px`);
      check('AC-3', Math.abs(h.cta1.top - h.cta2.top) <= 2, `${key} CTAs side by side (top ${Math.round(h.cta1.top)}/${Math.round(h.cta2.top)})`);
      continue;
    }
    check('AC-1', h.scrollY === 0 && h.cta1.bottom <= h.innerHeight && h.cta2.bottom <= h.innerHeight, `${key} CTA bottoms ${Math.round(h.cta1.bottom)}/${Math.round(h.cta2.bottom)} <= ${h.innerHeight}`);
    check('AC-2', h.clipped.length === 0, `${key} clipped text: ${h.clipped.join('; ') || 'none'}`);
    check('AC-2', h.overflowX <= 0, `${key} horizontal overflow ${h.overflowX}px`);
    check('AC-3', Math.abs(h.cta1.top - h.cta2.top) <= 2, `${key} CTAs side by side (top ${Math.round(h.cta1.top)}/${Math.round(h.cta2.top)})`);
    // AC-3: below md the CTA block is pinned to the bottom of the screen-high hero.
    check('AC-3', h.heroBottom - h.ctaBlockBottom <= 48, `${key} CTA block ${Math.round(h.heroBottom - h.ctaBlockBottom)}px above the hero bottom (<= 48)`);
    const was = before(key, (b) => Math.round(b.home.titleTop - b.home.headerBottom));
    check('AC-4', gap <= 32 && (was === null || gap < was), `${key} navbar -> title ${gap}px (before ${was ?? 'n/a'})`);
    const k = d.kontakt, kWas = before(key, (b) => b.kontakt.nameTop);
    const mustFit = ['chromium-411x770', 'chromium-390x664', 'webkit-390x664'].includes(key);
    check('AC-11', (kWas === null || k.nameTop < kWas) && (!mustFit || k.nameTop <= k.innerHeight - 48), `${key} /kontakt first field top ${Math.round(k.nameTop)}px (before ${kWas === null ? 'n/a' : Math.round(kWas)}, viewport ${k.innerHeight}${mustFit ? ', must fit incl. 48px field' : ''})`);
  }
  // AC-8: white hero text keeps at least 4.5:1 against the brightest pixel behind every text box.
  for (const [key, d] of Object.entries(data)) {
    for (const t of WHITE_TEXTS) check('AC-8', d.contrast.some((s) => s.label.includes(`"${t}`)), `${key} contrast sample covers "${t}"`);
    for (const s of d.contrast) {
      check('AC-8', s.contrast >= 4.5, `${key} ${s.label} brightest rgb(${s.rgb.join(',')}) contrast ${s.contrast.toFixed(2)}:1 >= 4.5:1`);
    }
  }
  const small = data['chromium-320x560'].home.font, big = data['chromium-411x770'].home.font;
  check('AC-5', small.subtitle < big.subtitle, `subtitle ${small.subtitle}px @320x560 < ${big.subtitle}px @411x770`);
  for (const f of ['title', 'box', 'subtitle', 'cta']) console.log(`info AC-5: ${f} ${small[f]}px @320x560 vs ${big[f]}px @411x770`);

  for (const [ac, list] of Object.entries(results)) console.log(`${list.every(Boolean) ? 'PASS' : 'FAIL'} ${ac} (${list.filter(Boolean).length}/${list.length})`);
  process.exit(failures ? 1 : 0);
})();
