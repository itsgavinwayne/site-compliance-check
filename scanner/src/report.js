// Markdown + JSON 报告
import path from 'node:path';
import { thirdPartyHosts } from './trackers.js';

const LEVEL = { must: '必须', conditional: '视情况', recommended: '建议' };
const LEVEL_ORDER = ['must', 'conditional', 'recommended'];
const CAT_ORDER = ['privacy-policy', 'cookies', 'forms', 'disclosure', 'china', 'accessibility', 'licensing'];
const CAT = { 'privacy-policy': '隐私政策', cookies: 'Cookie 与追踪', forms: '表单与营销', disclosure: '公示信息', china: '中国大陆专项', accessibility: '无障碍', licensing: '素材授权' };
const ICON = { fail: '❌', pass: '✅', manual: '🔍', na: '➖', error: '⚠️' };
const STATUS_ZH = { fail: '不通过', pass: '通过', manual: '需人工确认', na: '不适用', error: '检查出错' };
export const DISCLAIMER = '本报告由自动扫描生成，不构成法律意见；自动检查只能覆盖一部分要求，正式上线前请咨询专业律师。';

const idx = (arr, v) => { const i = arr.indexOf(v); return i < 0 ? 99 : i; };
export function sortResults(results) {
  return [...results].sort((a, b) => idx(LEVEL_ORDER, a.level) - idx(LEVEL_ORDER, b.level) || idx(CAT_ORDER, a.category) - idx(CAT_ORDER, b.category) || a.id.localeCompare(b.id, 'en', { numeric: true }));
}

const one = (s) => String(s || '').replace(/\s+/g, ' ').trim();

export function relPaths(results, outDir) {
  if (!outDir) return results;
  return results.map((r) => ({ ...r, evidence: r.evidence.map((e) => e.replace(/截图：(.+)$/, (_, p) => `截图：${path.relative(outDir, p)}`)) }));
}

export function line(r) {
  const ev = r.evidence.map(one).filter(Boolean).join('；');
  const note = one(r.note);
  const head = r.status === 'pass' ? '通过' : r.status === 'na' ? '不适用' : r.status === 'error' ? `检查出错（${one(r.missing)}）` : one(r.missing);
  const body = [ev, note && (ev ? `（${note}）` : note)].filter(Boolean).join('');
  return `${ICON[r.status]} ${r.id} ${head}${body ? '：' + body : ''} → 影响 ${r.markets.join(' ')} ｜ ${LEVEL[r.level] || r.level}`;
}

export function summarize(results) {
  const s = { fail: 0, manual: 0, error: 0, pass: 0, na: 0 };
  for (const r of results) s[r.status]++;
  return s;
}

export function buildJson(ctx, results, meta = {}) {
  return {
    tool: 'site-compliance-check',
    version: meta.version || '0.1.0',
    registryVersion: meta.registryVersion || null,
    url: ctx.url,
    finalUrl: ctx.finalUrl,
    scannedAt: ctx.startedAt,
    finishedAt: ctx.finishedAt,
    summary: summarize(results),
    results: sortResults(results),
    discovered: {
      keyPages: Object.fromEntries(Object.entries(ctx.keyPages || {}).map(([k, p]) => [k, { href: p.href, url: p.url || null, status: p.status ?? null, linkText: p.linkText, error: p.error || null }])),
      thirdPartyHosts: thirdPartyHosts(ctx.states.before && ctx.states.before.requests, ctx.finalUrl || ctx.url),
      banner: ctx.home && ctx.home.banner ? { text: ctx.home.banner.text, buttons: ctx.home.banner.buttons.map(({ text, kind }) => ({ text, kind })), frameUrl: ctx.home.banner.frameUrl || null } : null,
      reject: ctx.states.reject ? { attempted: ctx.states.reject.attempted, clicked: ctx.states.reject.clicked, innerPage: ctx.states.reject.innerPage, reason: ctx.states.reject.reason || null } : null,
      axe: ctx.axe,
    },
    phaseErrors: ctx.errors,
    disclaimer: DISCLAIMER,
  };
}

export function buildMarkdown(json) {
  const out = [];
  const s = json.summary;
  out.push(`# 合规检查报告`, '');
  out.push(`- 网址：${json.url}${json.finalUrl && json.finalUrl !== json.url ? `（最终 ${json.finalUrl}）` : ''}`);
  out.push(`- 扫描时间：${json.scannedAt}`);
  out.push(`- 结果：❌ 不通过 ${s.fail} ｜ 🔍 需人工 ${s.manual} ｜ ⚠️ 出错 ${s.error} ｜ ✅ 通过 ${s.pass} ｜ ➖ 不适用 ${s.na}`);
  out.push('', `> ${json.disclaimer}`, '');
  const errs = Object.entries(json.phaseErrors || {});
  if (errs.length) {
    out.push('## ⚠️ 采集阶段出错', '');
    for (const [k, v] of errs) out.push(`- ${k}：${one(v)}`);
    out.push('');
  }

  const auto = json.results.filter((r) => r.automated && r.status !== 'manual');
  out.push('## 自动检查结果', '');
  for (const lv of LEVEL_ORDER) {
    const rows = auto.filter((r) => r.level === lv);
    if (!rows.length) continue;
    out.push(`### ${LEVEL[lv]}`, '');
    for (const r of rows) out.push(`- ${line(r)}`);
    out.push('');
  }

  out.push('## 需人工确认', '');
  const sig = json.results.filter((r) => r.automated && r.status === 'manual');
  if (sig.length) {
    out.push('### 扫描器已给出信号，需人工确认', '');
    for (const r of sig) out.push(`- ${line(r)}`);
    out.push('');
  }
  const man = json.results.filter((r) => !r.automated);
  if (man.length) {
    out.push('### 只能人工确认', '');
    for (const r of man) out.push(`- [ ] ${r.id} ${one(r.missing)} → 影响 ${r.markets.join(' ')} ｜ ${LEVEL[r.level] || r.level}${r.condition ? `（${one(r.condition)}）` : ''}`);
    out.push('');
  }

  out.push('## 采集信息', '');
  const kp = Object.entries(json.discovered.keyPages);
  out.push(`- 发现的关键页面：${kp.length ? kp.map(([k, p]) => `${k} → ${p.url || p.href}${p.status ? `（${p.status}）` : p.error ? '（打不开）' : ''}`).join('；') : '无'}`);
  const b = json.discovered.banner;
  out.push(`- Cookie 横幅：${b ? `识别到，按钮 ${b.buttons.map((x) => `${x.text}[${x.kind}]`).join('、')}` : '未识别到'}`);
  const rj = json.discovered.reject;
  if (rj) out.push(`- 拒绝后状态：${rj.attempted ? `已点击「${rj.clicked}」并刷新${rj.innerPage ? '，再访问内页 ' + rj.innerPage : ''}` : `未执行（${rj.reason}）`}`);
  const tp = json.discovered.thirdPartyHosts;
  out.push(`- 同意前请求的第三方域名（辅助核对 P-03 / P-06）：${tp.length ? tp.map((h) => '`' + h + '`').join(' ') : '无'}`);
  out.push('');
  return out.join('\n');
}
