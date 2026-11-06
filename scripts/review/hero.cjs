// Hero and /kontakt geometry for issue #12 (AC-1 to AC-6, AC-11) against a built or deployed site.
// Usage: node scripts/review/hero.cjs <base-url> <out-dir> [before.json]
// Writes <out-dir>/hero.json and a screenshot per viewport. With before.json the "smaller/higher than
// before" parts of AC-4 and AC-11 are checked too. Elements are found by their text, not by classes,
// so the same script measures the old and the new layout.
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
const DESKTOP = [[1440, 900], [1280, 720]];
const RUNS = [
  ...MOBILE.map(([w, h]) => ({ engine: 'chromium', w, h, mobile: true })),
  { engine: 'webkit', w: 390, h: 664, mobile: true }, // iOS Safari engine for svh
  ...DESKTOP.map(([w, h]) => ({ engine: 'chromium', w, h, mobile: false })),
];

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
  const titleLine = byText('span', 'Steuerberater in Schwalmstadt für');
  const tag = byText('p', 'Buchhaltung, Lohn');
  const subtitle = tag; // audit V2 9.1: one lead line instead of tag + paragraph
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
  const c1 = r(cta1), c2 = r(cta2), hn = hint ? r(hint) : null;
  return {
    scrollY: window.scrollY, innerHeight, innerWidth, svh,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    headerBottom: r(header).bottom, heroTop: heroR.top, heroBottom: heroR.bottom, heroHeight: heroR.height,
    titleTop: r(hero.querySelector('p, h1')).top, h1Top: r(h1).top, // first text line (kicker above the H1)
    cta1: { top: c1.top, bottom: c1.bottom }, cta2: { top: c2.top, bottom: c2.bottom },
    hint: hn && { top: hn.top, bottom: hn.bottom },
    ctaBlockBottom: Math.max(c1.bottom, c2.bottom, hn ? hn.bottom : 0),
    leadBottom: r(subtitle).bottom, h1Text: h1.textContent.replace(/\s+/g, ' ').trim(),
    describedby: cta1.getAttribute('aria-describedby') || '',
    font: { title: fs(titleLine), tag: fs(tag), subtitle: fs(subtitle), hint: hint ? fs(hint) : null, cta: fs(cta1) },
    texts: { title: titleLine.textContent.trim(), tag: tag.textContent.replace(/\s+/g, ' ').trim() },
    clipped,
  };
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
    let kontakt = null;
    if (run.mobile) {
      await page.goto(`${BASE}/kontakt`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      kontakt = await page.evaluate(() => ({ nameTop: document.querySelector('#name').getBoundingClientRect().top, innerHeight }));
      await page.screenshot({ path: `${OUT}/kontakt-${key}.png` });
    }
    data[key] = { ...run, home, kontakt };
    await browser.close();
  }
  fs.writeFileSync(`${OUT}/hero.json`, JSON.stringify(data, null, 2));

  const before = (key, f) => (BEFORE && BEFORE[key] ? f(BEFORE[key]) : null);
  for (const [key, d] of Object.entries(data)) {
    const h = d.home;
    const gap = Math.round(h.titleTop - h.headerBottom);
    // Audit V2 9.1: H1 holds only the heading; the lead is a separate <p>.
    check('AC-7', h.h1Text === 'Steuerberater in Schwalmstadt für Betriebe, Selbstständige und Privatpersonen' && /^Buchhaltung, Lohn, Jahresabschluss und Steuererklärungen aus einer Hand\. Ein \d+-köpfiges Team um Steuerberater Karsten Walz, selbstständig seit 2000\.$/.test(h.texts.tag), `${key} H1 only heading, lead separate`);
    if (!d.mobile) {
      check('AC-6', h.heroHeight <= h.svh + 0.5, `${key} hero ${Math.round(h.heroHeight)}px <= 100svh ${Math.round(h.svh)}px`);
      continue;
    }
    check('AC-1', h.scrollY === 0 && h.cta1.bottom <= h.innerHeight && h.cta2.bottom <= h.innerHeight, `${key} CTA bottoms ${Math.round(h.cta1.bottom)}/${Math.round(h.cta2.bottom)} <= ${h.innerHeight}`);
    // Audit V2 9.1: the mobile hero is content-high; only the CTAs must sit in the first screen.
    check('AC-2', h.clipped.length === 0, `${key} clipped text: ${h.clipped.join('; ') || 'none'}`);
    check('AC-2', h.overflowX <= 0, `${key} horizontal overflow ${h.overflowX}px`);
    check('AC-3', Math.abs(h.cta1.top - h.cta2.top) <= 2, `${key} CTAs side by side (top ${Math.round(h.cta1.top)}/${Math.round(h.cta2.top)})`);
    // Audit V2 9.1 acceptance replaces the old "CTA block at hero bottom": buttons directly under the text.
    check('AC-3', Math.min(h.cta1.top, h.cta2.top) - h.leadBottom <= 32, `${key} lead -> CTA ${Math.round(Math.min(h.cta1.top, h.cta2.top) - h.leadBottom)}px <= 32`);
    check('AC-3', !!h.hint && h.hint.top >= Math.max(h.cta1.bottom, h.cta2.bottom) && h.font.hint < h.font.subtitle && h.describedby.split(' ').includes('hero-cta-note'), `${key} hint small below buttons, aria-describedby`);
    const was = before(key, (b) => Math.round(b.home.titleTop - b.home.headerBottom));
    check('AC-4', gap <= 32 && (was === null || gap < was), `${key} navbar -> title ${gap}px (before ${was ?? 'n/a'})`);
    const k = d.kontakt, kWas = before(key, (b) => b.kontakt.nameTop);
    const mustFit = ['chromium-411x770', 'chromium-390x664', 'webkit-390x664'].includes(key);
    check('AC-11', (kWas === null || k.nameTop < kWas) && (!mustFit || k.nameTop <= k.innerHeight - 48), `${key} /kontakt first field top ${Math.round(k.nameTop)}px (before ${kWas === null ? 'n/a' : Math.round(kWas)}, viewport ${k.innerHeight}${mustFit ? ', must fit incl. 48px field' : ''})`);
  }
  const small = data['chromium-320x560'].home.font, big = data['chromium-411x770'].home.font;
  check('AC-5', small.subtitle < big.subtitle, `subtitle ${small.subtitle}px @320x560 < ${big.subtitle}px @411x770`);
  for (const f of ['title', 'tag', 'hint', 'cta']) console.log(`info AC-5: ${f} ${small[f]}px @320x560 vs ${big[f]}px @411x770`);

  for (const [ac, list] of Object.entries(results)) console.log(`${list.every(Boolean) ? 'PASS' : 'FAIL'} ${ac} (${list.filter(Boolean).length}/${list.length})`);
  process.exit(failures ? 1 : 0);
})();
