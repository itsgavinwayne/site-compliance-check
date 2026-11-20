// 采集：同意前 / 拒绝后 / GPC 三种状态 + 设置层探测 + 关键页面发现 + axe。
// 每个阶段独立 try/catch，失败记录到 state.error，由检查函数转为 status=error。
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { extractInPage, PATTERN_ARGS } from './extract.js';
import { KEY_PAGES, normalize } from './patterns.js';


export const DEFAULTS = {
  timeout: 45000, // 单次导航超时；国内站境外访问慢，宁长勿短
  settle: 3000, // 网络空闲后的固定缓冲
  idle: 10000, // 等待 networkidle 的上限
  offline: false, // 测试用：所有非本地请求返回空响应（仍会被记录）
  axe: true,
  outDir: null,
  viewport: { width: 1366, height: 900 },
};

const isLocal = (u) => { try { const h = new URL(u).hostname; return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h.endsWith('.localhost'); } catch { return false; } };

async function newContext(browser, o, extra = {}) {
  const context = await browser.newContext({
    viewport: o.viewport,
    locale: 'en-US',
    ignoreHTTPSErrors: false,
    ...extra,
  });
  if (o.offline) {
    await context.route('**/*', (route) => {
      const u = route.request().url();
      if (isLocal(u) || u.startsWith('data:')) return route.continue();
      const type = route.request().resourceType();
      const ct = type === 'script' ? 'application/javascript' : type === 'stylesheet' ? 'text/css' : type === 'document' ? 'text/html' : 'text/plain';
      return route.fulfill({ status: 200, contentType: ct, body: '' });
    });
  }
  const requests = [];
  context.on('request', (r) => requests.push({ url: r.url(), type: r.resourceType(), t: Date.now() }));
  return { context, requests };
}

async function settle(page, o) {
  await page.waitForLoadState('networkidle', { timeout: o.idle }).catch(() => {});
  await page.waitForTimeout(o.settle);
}

async function goto(page, url, o) {
  const resp = await page.goto(url, { waitUntil: 'load', timeout: o.timeout });
  await settle(page, o);
  return resp;
}

async function extract(page) {
  return page.evaluate(extractInPage, PATTERN_ARGS);
}

/** 主文档没识别到横幅时，再到子 frame（如 Sourcepoint/TrustArc 的 iframe 横幅）里找 */
async function extractWithFrames(page) {
  const main = await extract(page);
  if (main.banner) return { home: main, bannerFrame: page.mainFrame() };
  for (const f of page.frames()) {
    if (f === page.mainFrame()) continue;
    try {
      const sub = await f.evaluate(extractInPage, PATTERN_ARGS);
      if (sub.banner) {
        main.banner = { ...sub.banner, frameUrl: f.url() };
        return { home: main, bannerFrame: f };
      }
    } catch { /* 跨域/已卸载 frame */ }
  }
  return { home: main, bannerFrame: null };
}

async function snapshot(context, page, requests) {
  const cookies = (await context.cookies()).map((c) => ({ name: c.name, domain: c.domain, path: c.path, expires: c.expires }));
  let localStorage = [];
  try { localStorage = await page.evaluate(() => Object.keys(window.localStorage)); } catch { /* opaque origin */ }
  return { requests: requests.slice(), cookies, localStorage };
}

async function shot(page, o, name) {
  try {
    const file = path.join(o.shotDir, `${name}.png`);
    await page.screenshot({ path: file });
    return file;
  } catch { return null; }
}

// ---------- 关键页面 ----------
export function findKeyLinks(links) {
  const out = {};
  const all = {};
  for (const [kind, def] of Object.entries(KEY_PAGES)) {
    const cands = [];
    for (const l of links) {
      if (!l.href || /^(mailto|tel|javascript):/i.test(l.href)) continue;
      const text = normalize(l.text);
      const tm = def.text.test(text);
      let hm = false;
      try { hm = def.href.test(new URL(l.href).pathname); } catch { /* ignore */ }
      if (!tm && !hm) continue;
      if (def.exclude && def.exclude.test(text)) continue;
      if (l.inBanner && kind !== 'privacy' && kind !== 'cookie') continue;
      cands.push({ ...l, score: (tm ? 2 : 0) + (hm ? 1 : 0) + (l.inFooter ? 2 : 0) + (l.visible ? 1 : 0) });
    }
    cands.sort((a, b) => b.score - a.score);
    all[kind] = cands;
    if (cands.length) out[kind] = cands[0];
  }
  return { best: out, all };
}

async function fetchKeyPage(context, link, o) {
  const page = await context.newPage();
  try {
    const resp = await page.goto(link.href, { waitUntil: 'load', timeout: o.timeout });
    await page.waitForLoadState('networkidle', { timeout: Math.min(o.idle, 5000) }).catch(() => {});
    const info = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      lang: document.documentElement.getAttribute('lang') || '',
      text: (document.body ? document.body.innerText : '').replace(/[ \t]+/g, ' ').slice(0, 150000),
      alternates: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => ({ hreflang: l.getAttribute('hreflang'), href: l.href })),
      links: [...document.querySelectorAll('a[href]')].map((a) => ({ text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 80), href: a.href, hreflang: a.getAttribute('hreflang') || '', lang: a.getAttribute('lang') || '' })).slice(0, 1500),
    }));
    let forms = [];
    try { forms = (await extract(page)).forms; } catch { /* ignore */ }
    return { ...info, forms, status: resp ? resp.status() : null, linkText: link.text, href: link.href };
  } catch (e) {
    return { href: link.href, linkText: link.text, error: String(e && e.message || e).split('\n')[0] };
  } finally {
    await page.close().catch(() => {});
  }
}

function pickInnerPage(home, baseUrl) {
  let base;
  try { base = new URL(baseUrl); } catch { return null; }
  for (const l of home.links) {
    try {
      const u = new URL(l.href);
      if (u.origin !== base.origin) continue;
      if (u.pathname === base.pathname || u.pathname === '/' || /\.(pdf|zip|jpg|png|svg|xml)$/i.test(u.pathname)) continue;
      if (l.inBanner) continue;
      return u.href;
    } catch { /* ignore */ }
  }
  return null;
}

const errMsg = (e) => String((e && e.message) || e).split('\n')[0];

// ---------- 各状态 ----------
async function stateBefore(browser, url, o, ctx) {
  const { context, requests } = await newContext(browser, o);
  try {
    const page = await context.newPage();
    const resp = await goto(page, url, o);
    const snap = await snapshot(context, page, requests);
    const { home } = await extractWithFrames(page);
    const screenshot = await shot(page, o, 'before');
    ctx.home = { ...home, status: resp ? resp.status() : null };
    ctx.finalUrl = page.url();
    ctx.states.before = { ...snap, screenshot };

    if (o.axe) {
      try {
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        ctx.axe = {
          violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, tags: v.tags.filter((t) => /^wcag/.test(t)) })),
          passes: r.passes.length,
          incomplete: r.incomplete.length,
        };
      } catch (e) { ctx.axe = { error: errMsg(e) }; }
    } else ctx.axe = { error: 'axe 已禁用' };

    const { best, all } = findKeyLinks(home.links);
    ctx.keyLinks = best;
    ctx.keyLinkCandidates = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.slice(0, 5).map(({ text, href, inFooter }) => ({ text, href, inFooter }))]));
    const fetched = new Map();
    for (const [kind, link] of Object.entries(best)) {
      if (!fetched.has(link.href)) fetched.set(link.href, await fetchKeyPage(context, link, o));
      ctx.keyPages[kind] = fetched.get(link.href);
    }
  } finally {
    await context.close().catch(() => {});
  }
}

async function stateSettings(browser, url, o, ctx) {
  const { context } = await newContext(browser, o);
  try {
    const page = await context.newPage();
    await goto(page, url, o);
    const { home, bannerFrame } = await extractWithFrames(page);
    const probe = { banner: !!home.banner, settingsButton: null, firstLayer: [], settingsLayer: [], clicked: false };
    if (!home.banner) { ctx.settingsProbe = probe; return; }
    const frame = bannerFrame || page.mainFrame();
    const firstLayer = frame === page.mainFrame() ? home.checkboxes : (await frame.evaluate(extractInPage, PATTERN_ARGS)).checkboxes;
    probe.firstLayer = firstLayer.map(({ label, checked, disabled }) => ({ label, checked, disabled }));
    const btn = home.banner.buttons.find((b) => b.kind === 'settings');
    if (btn) {
      probe.settingsButton = btn.text;
      await frame.click(btn.selector, { timeout: 5000 });
      probe.clicked = true;
      await page.waitForTimeout(Math.max(800, Math.min(o.settle, 2000)));
      // 设置层可能在主文档或任一 frame
      const before = new Set(firstLayer.map((c) => c.key));
      const layer = [];
      for (const f of page.frames()) {
        try {
          const ex = await f.evaluate(extractInPage, PATTERN_ARGS);
          for (const c of ex.checkboxes) if (f !== frame || !before.has(c.key)) layer.push(c);
        } catch { /* ignore */ }
      }
      probe.settingsLayer = layer.map(({ label, checked, disabled }) => ({ label, checked, disabled }));
      probe.screenshot = await shot(page, o, 'settings');
    }
    ctx.settingsProbe = probe;
  } finally {
    await context.close().catch(() => {});
  }
}

async function stateReject(browser, url, o, ctx) {
  const { context, requests } = await newContext(browser, o);
  try {
    const page = await context.newPage();
    await goto(page, url, o);
    const { home, bannerFrame } = await extractWithFrames(page);
    const st = { attempted: false, clicked: null, innerPage: null };
    const btn = home.banner && home.banner.buttons.find((b) => b.kind === 'reject');
    if (!btn) { ctx.states.reject = { ...st, reason: home.banner ? '横幅上没有识别到拒绝按钮' : '没有识别到横幅' }; return; }
    st.attempted = true;
    const mark = requests.length;
    const t0 = Date.now();
    await (bannerFrame || page.mainFrame()).click(btn.selector, { timeout: 5000 });
    st.clicked = btn.text;
    await settle(page, o);
    await page.reload({ waitUntil: 'load', timeout: o.timeout });
    await settle(page, o);
    const after = await extract(page);
    st.bannerAfterReload = !!after.banner;
    st.reopen = after.reopen;
    const inner = pickInnerPage(home, page.url());
    if (inner) {
      await goto(page, inner, o);
      st.innerPage = inner;
    }
    const snap = await snapshot(context, page, requests);
    st.requests = snap.requests.slice(mark).filter((r) => r.t >= t0);
    st.cookies = snap.cookies;
    st.localStorage = snap.localStorage;
    st.screenshot = await shot(page, o, 'after-reject');
    ctx.states.reject = st;
  } finally {
    await context.close().catch(() => {});
  }
}

async function stateGpc(browser, url, o, ctx) {
  const { context, requests } = await newContext(browser, o, { extraHTTPHeaders: { 'Sec-GPC': '1' } });
  try {
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true, configurable: true });
    });
    const page = await context.newPage();
    await goto(page, url, o);
    const gpcSeen = await page.evaluate(() => navigator.globalPrivacyControl === true);
    const snap = await snapshot(context, page, requests);
    ctx.states.gpc = { ...snap, gpcInjected: gpcSeen, screenshot: await shot(page, o, 'gpc') };
  } finally {
    await context.close().catch(() => {});
  }
}

/** 主入口：返回供检查函数使用的 ctx */
export async function collect(url, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  o.shotDir = o.outDir ? path.join(o.outDir, 'screenshots') : await mkdtemp(path.join(tmpdir(), 'scc-'));
  await mkdir(o.shotDir, { recursive: true });
  const ctx = {
    url,
    finalUrl: null,
    startedAt: new Date().toISOString(),
    home: null,
    states: {},
    settingsProbe: null,
    keyLinks: {},
    keyPages: {},
    axe: null,
    errors: {},
  };
  const browser = await chromium.launch(o.browserOptions || {});
  try {
    const phases = [
      ['before', () => stateBefore(browser, url, o, ctx)],
      ['settings', () => stateSettings(browser, url, o, ctx)],
      ['reject', () => stateReject(browser, url, o, ctx)],
      ['gpc', () => stateGpc(browser, url, o, ctx)],
    ];
    for (const [name, fn] of phases) {
      try { await fn(); } catch (e) { ctx.errors[name] = errMsg(e); }
      if (name === 'before' && ctx.errors.before && !ctx.home) break; // 首页都打不开就不再继续
    }
  } finally {
    await browser.close().catch(() => {});
  }
  ctx.finishedAt = new Date().toISOString();
  return ctx;
}
