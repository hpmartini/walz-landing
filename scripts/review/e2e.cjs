// Browser checks for issue #10 (AC-5, AC-6, AC-10, AC-13) against a deployed URL.
// Usage: node scripts/review/e2e.cjs <base-url> [share-token] [out-dir]
// Uses a global `playwright` install (no project dependency on purpose).
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const { chromium } = require(path.join(globalRoot, 'playwright'));

const BASE = process.argv[2].replace(/\/$/, '');
const TOKEN = process.argv[3] || '';
const OUT = process.argv[4] || 'review-artifacts';
const AXE = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
const PAGES = ['/', '/leistungen/existenzgruendung', '/kontakt', '/team'];
fs.mkdirSync(OUT, { recursive: true });

const results = {};
let failures = 0;
const check = (ac, ok, msg) => {
  (results[ac] ??= []).push(ok);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${ac}: ${msg}`);
  if (!ok) failures++;
};

async function newContext(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  if (TOKEN) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/?_vercel_share=${TOKEN}`);
    await p.close();
  }
  return ctx;
}

const fillValid = async (page) => {
  await page.fill('#name', 'Erika Test');
  await page.fill('#email', 'erika@example.com');
  await page.selectOption('#anliegen', 'Gründung');
  await page.fill('#message', 'Testanfrage <b>mit</b> Sonderzeichen äöüß & "Zitat"');
};

(async () => {
  // Bundled browser if downloaded, otherwise the installed Google Chrome.
  const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }));

  // ---------- AC-5: texts and prefill ----------
  {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/kontakt`);
    check('AC-5', (await page.textContent('h1')).includes('Erstgespräch oder Rückruf anfragen'), 'H1');
    check('AC-5', (await page.locator('h2', { hasText: 'Worum geht es bei Ihrer Anfrage' }).count()) === 1, 'form heading');
    const options = await page.$$eval('#anliegen option', (os) => os.map((o) => o.value).filter(Boolean));
    check('AC-5', options.join('|') === 'Gründung|Nachfolge|laufende Buchhaltung|Lohnabrechnung|Jahresabschluss|Steuererklärung|andere Frage', `7 options: ${options.join(', ')}`);
    check('AC-5', (await page.textContent('label[for=message]')).includes('Ihr Anliegen in wenigen Sätzen'), 'message label');
    check('AC-5', (await page.textContent('button[type=submit]')).trim() === 'Anfrage senden', 'button label');
    const prefill = {
      erstgespraech: '', gruendung: 'Gründung', nachfolge: 'Nachfolge', buchhaltung: 'laufende Buchhaltung', lohn: 'Lohnabrechnung',
      jahresabschluss: 'Jahresabschluss', steuererklaerung: 'Steuererklärung', coaching: 'andere Frage', bwl: 'andere Frage', steuerberatung: 'andere Frage',
      unbekannt: '', '<script>alert(1)</script>': '', constructor: '', __proto__: '',
    };
    let dialogs = 0;
    page.on('dialog', (d) => { dialogs++; d.dismiss(); });
    for (const [param, want] of Object.entries(prefill)) {
      await page.goto(`${BASE}/kontakt?anliegen=${encodeURIComponent(param)}`);
      const got = await page.inputValue('#anliegen');
      check('AC-5', got === want, `anliegen=${param} -> "${got}"`);
    }
    const html = await page.content();
    check('AC-5', dialogs === 0 && !html.includes('alert(1)'), 'hostile param never rendered or executed');
    await ctx.close();
  }

  // ---------- AC-6: form behaviour ----------
  {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/kontakt`);

    // Empty submit: plan message, aria-invalid, focus on first invalid field.
    await page.click('button[type=submit]');
    check('AC-6', (await page.textContent('#contact-status')).includes('Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse und Ihr Anliegen ein.'), 'required-field message');
    check('AC-6', await page.evaluate(() => document.activeElement?.id === 'name'), 'focus on first invalid field (#name)');
    check('AC-6', (await page.getAttribute('#email', 'aria-invalid')) === 'true', 'aria-invalid on email');
    check('AC-6', ((await page.getAttribute('#email', 'aria-describedby')) || '').includes('contact-status'), 'aria-describedby links field to error');
    check('AC-6', (await page.getAttribute('#contact-status', 'role')) === 'status' && (await page.getAttribute('#contact-status', 'aria-live')) === 'polite', 'ARIA status region');
    await page.fill('#name', 'Erika Test');
    await page.click('button[type=submit]');
    check('AC-6', await page.evaluate(() => document.activeElement?.id === 'email'), 'focus moves to next invalid field (#email)');

    // Real path: preview API without mail key answers 5xx -> error state, inputs kept, links work.
    await page.goto(`${BASE}/kontakt`);
    await fillValid(page);
    const real = page.waitForResponse((r) => r.url().endsWith('/api/kontakt'));
    await page.click('button[type=submit]');
    const realStatus = (await real).status();
    await page.waitForFunction(() => document.querySelector('#contact-status')?.textContent?.trim());
    const statusText = await page.textContent('#contact-status');
    if (realStatus >= 200 && realStatus < 300) {
      check('AC-6', statusText.includes('Vielen Dank. Ihre Anfrage wurde übermittelt.'), `real API ${realStatus}: success text`);
    } else {
      check('AC-6', statusText.includes('Ihre Anfrage konnte gerade nicht übermittelt werden. Ihre Eingaben bleiben erhalten.'), `real API ${realStatus}: error text`);
      check('AC-6', (await page.inputValue('#name')) === 'Erika Test' && (await page.inputValue('#anliegen')) === 'Gründung', 'inputs kept after error');
      check('AC-6', (await page.locator('#contact-status a[href^="mailto:info@kanzlei-karstenwalz.de"]').count()) === 1, 'mailto link in error');
      check('AC-6', (await page.locator('#contact-status a[href^="tel:"]').count()) === 1, 'tel link in error');
      await page.locator('#contact-status').screenshot({ path: `${OUT}/kontakt-fehler-status.png` });
    }

    // Retry after error, slow 200 answer: double click sends one request, success only after 2xx, form resets.
    let posts = 0;
    await page.route('**/api/kontakt', async (route) => {
      posts++;
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.dblclick('button[type=submit]');
    check('AC-6', (await page.textContent('button[type=submit]')).includes('Anfrage wird gesendet'), 'loading text while in flight');
    check('AC-6', !(await page.textContent('#contact-status')).includes('Vielen Dank'), 'no success before server answer');
    await page.waitForFunction(() => document.querySelector('#contact-status')?.textContent?.includes('Vielen Dank'));
    check('AC-6', posts === 1, `double click sent ${posts} request(s)`);
    check('AC-6', (await page.textContent('#contact-status')).includes('Vielen Dank. Ihre Anfrage wurde übermittelt. Wir melden uns, um Ihr Anliegen und die nächsten Schritte zu besprechen.'), 'success text after retry');
    check('AC-6', (await page.inputValue('#name')) === '', 'form reset after success');
    await ctx.close();
  }

  // ---------- AC-10: no-JS, reduced motion, widths, zoom, ARIA, axe ----------
  for (const [label, opts] of [['no JS', { javaScriptEnabled: false }], ['reduced motion', { reducedMotion: 'reduce' }]]) {
    const ctx = await newContext(browser, opts);
    const page = await ctx.newPage();
    for (const path of PAGES) {
      await page.goto(`${BASE}${path}`);
      await page.waitForTimeout(300);
      const hidden = await page.$$eval('main h1, main h2, main p, main a, main button, main label', (els) =>
        els.filter((e) => { const s = getComputedStyle(e); return s.visibility === 'visible' && e.getBoundingClientRect().height > 0 && Number(s.opacity) === 0; }).length);
      check('AC-10', hidden === 0, `${label} ${path}: ${hidden} content elements at opacity 0`);
    }
    await ctx.close();
  }
  for (const width of [320, 390, 768, 1440, 640 /* 1280px at 200 % zoom */]) {
    const ctx = await newContext(browser, { viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    for (const path of PAGES) {
      await page.goto(`${BASE}${path}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check('AC-10', overflow <= 0, `${width}px ${path}: horizontal overflow ${overflow}px`);
    }
    await ctx.close();
  }
  {
    const ctx = await newContext(browser, { viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`);
    check('AC-10', (await page.getAttribute('#mobile-menu-btn', 'aria-expanded')) === 'false', 'menu aria-expanded=false');
    await page.click('#mobile-menu-btn');
    check('AC-10', (await page.getAttribute('#mobile-menu-btn', 'aria-expanded')) === 'true', 'menu aria-expanded=true after click');
    await page.click('#mobile-menu-btn');
    await page.click('#chat-open');
    await page.waitForTimeout(400);
    check('AC-10', await page.evaluate(() => document.getElementById('chat-modal')?.contains(document.activeElement)), 'chat dialog takes focus');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    check('AC-10', await page.evaluate(() => document.getElementById('chat-modal')?.classList.contains('hidden') && document.activeElement?.id === 'chat-open'), 'Escape closes chat, focus returns');
    await page.goto(`${BASE}/kontakt`);
    check('AC-10', !(await page.isVisible('#website')), 'honeypot hidden');
    // Keyboard: Tab reaches the topic cards on the home page.
    await page.goto(`${BASE}/`);
    let reached = false;
    let tabs = 0;
    for (; tabs < 120 && !reached; tabs++) {
      await page.keyboard.press('Tab');
      reached = await page.evaluate(() => document.activeElement?.getAttribute('href') === '/leistungen/finanzbuchhaltung' && !!document.activeElement.closest('[aria-labelledby=anliegen-heading]'));
    }
    check('AC-4', reached, `topic card link reachable by keyboard (${tabs} Tab presses)`);
    await ctx.close();
  }
  {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    for (const path of [...PAGES, '/kontakt?anliegen=gruendung']) {
      await page.goto(`${BASE}${path}`);
      await page.waitForTimeout(1500);
      await page.addScriptTag({ url: AXE });
      const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] })).violations.map((x) => `${x.id}(${x.nodes.length})`));
      check('AC-10', v.length === 0, `axe ${path}: ${v.join(', ') || 'clean'}`);
    }
    await ctx.close();
  }

  // ---------- AC-13: screenshots and journey video ----------
  for (const width of [390, 1440]) {
    const ctx = await newContext(browser, { viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const shot = async (path, name, prep) => {
      await page.goto(`${BASE}${path}`);
      if (prep) await prep();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: true });
    };
    await shot('/', 'home');
    await shot('/kontakt?anliegen=gruendung', 'kontakt-prefill');
    await shot('/kontakt', 'kontakt-fehler', async () => { await page.click('button[type=submit]'); });
    await shot('/leistungen/existenzgruendung', 'leistung-existenzgruendung');
    await ctx.close();
  }
  {
    const ctx = await newContext(browser, { viewport: { width: 1280, height: 800 }, recordVideo: { dir: `${OUT}/video`, size: { width: 1280, height: 800 } } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1500);
    await page.locator('#anliegen-heading').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.click('[aria-labelledby=anliegen-heading] a[href="/leistungen/existenzgruendung"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await page.locator('a[href="/kontakt?anliegen=gruendung"]').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.locator('a[href="/kontakt?anliegen=gruendung"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('#anliegen').scrollIntoViewIfNeeded();
    check('AC-13', (await page.inputValue('#anliegen')) === 'Gründung', 'journey ends in prefilled form');
    await page.waitForTimeout(2000);
    const video = await page.video().path();
    await ctx.close();
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vf', 'fps=8,scale=800:-1:flags=lanczos', `${OUT}/journey.gif`]);
    check('AC-13', fs.statSync(`${OUT}/journey.gif`).size > 0, 'journey.gif written');
  }

  await browser.close();
  for (const [ac, list] of Object.entries(results)) console.log(`${list.every(Boolean) ? 'PASS' : 'FAIL'} ${ac} (${list.filter(Boolean).length}/${list.length})`);
  process.exit(failures ? 1 : 0);
})();
