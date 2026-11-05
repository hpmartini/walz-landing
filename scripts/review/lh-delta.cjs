// #12 AC-12/AC-13: median table new vs baseline from lighthouse.sh JSON reports.
// Usage: node scripts/review/lh-delta.cjs <baseline-dir> <new-dir>
const fs = require('node:fs');
const [BASE, NEW] = process.argv.slice(2);
const runs = (dir, stem) => [1, 2, 3].map((i) => JSON.parse(fs.readFileSync(`${dir}/${stem}-${i}.json`, 'utf8')));
const med = (r, f) => r.map(f).sort((a, b) => a - b)[1];
const num = (id) => (x) => x.audits[id].numericValue;
const METRICS = [['lcp', 'largest-contentful-paint'], ['tbt', 'total-blocking-time'], ['cls', 'cumulative-layout-shift']];
let fail = 0;
console.log('| Seite | Form | Metrik | Baseline | Neu | Delta | |\n|:--|:--|:--|--:|--:|--:|:--|');
for (const page of ['/', '/leistungen/existenzgruendung', '/kontakt', '/team']) {
  for (const form of ['mobile', 'desktop']) {
    const stem = `${page.replace(/\//g, '_')}-${form}`;
    const b = runs(BASE, stem), n = runs(NEW, stem);
    for (const [name, id] of METRICS) {
      const vb = med(b, num(id)), vn = med(n, num(id));
      const ok = vn <= vb;
      if (!ok) fail++;
      const fmt = (v) => (name === 'cls' ? v.toFixed(3) : Math.round(v));
      console.log(`| ${page} | ${form} | ${name} | ${fmt(vb)} | ${fmt(vn)} | ${name === 'cls' ? (vn - vb).toFixed(3) : Math.round(vn - vb)} | ${ok ? 'ok' : 'schlechter'} |`);
    }
  }
}
// AC-13: home mobile audits.
const b = runs(BASE, '_-mobile'), n = runs(NEW, '_-mobile');
// Insights nest their table in a list: count the rows, not the wrappers.
const rows = (d) => (d?.type === 'list' ? d.items.reduce((s, t) => s + rows(t), 0) : d?.items?.length ?? 0);
const items = (r, id) => med(r, (x) => rows(x.audits[id]?.details));
const unusedJs = (r) => med(r, (x) => x.audits['unused-javascript'].details?.overallSavingsBytes ?? 0);
const si = med(n, num('speed-index'));
console.log(`\nAC-13 home mobile: speed-index ${Math.round(med(b, num('speed-index')))} -> ${Math.round(si)} ms; unused-js ${unusedJs(b)} -> ${unusedJs(n)} B; render-blocking items ${items(b, 'render-blocking-insight')} -> ${items(n, 'render-blocking-insight')}; forced-reflow items ${items(b, 'forced-reflow-insight')} -> ${items(n, 'forced-reflow-insight')}`);
const ac13 = si < 3800 && unusedJs(n) < 24 * 1024 && items(n, 'render-blocking-insight') === 0 && items(n, 'forced-reflow-insight') === 0;
console.log(`${fail ? 'FAIL' : 'PASS'} AC-12 delta (${fail} metrics worse than baseline)`);
console.log(`${ac13 ? 'PASS' : 'FAIL'} AC-13`);
process.exit(fail || !ac13 ? 1 : 0);
