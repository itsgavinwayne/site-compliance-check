// 检查函数共用工具。缺数据时一律抛错（由 runner 转为 status=error），绝不默认 pass。
import { trackerSignals, cmpSignals, analyticsLikeSignals } from '../trackers.js';

export const pass = (evidence = [], note = '') => ({ status: 'pass', evidence, note });
export const fail = (evidence = [], note = '') => ({ status: 'fail', evidence, note });
export const manual = (evidence = [], note = '') => ({ status: 'manual', evidence, note });
export const na = (evidence = [], note = '') => ({ status: 'na', evidence, note });

export class CheckDataError extends Error {}

export function requireHome(ctx) {
  if (!ctx || !ctx.home) throw new CheckDataError(`首页采集失败：${(ctx && ctx.errors && ctx.errors.before) || '无数据'}`);
  return ctx.home;
}

export function requireState(ctx, name) {
  const s = ctx && ctx.states && ctx.states[name];
  if (!s) throw new CheckDataError(`"${name}" 状态采集失败：${(ctx && ctx.errors && ctx.errors[name]) || '无数据'}`);
  return s;
}

export const shotEvidence = (file) => (file ? [`截图：${file}`] : []);
export const q = (s, n = 60) => {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n) + '…' : s;
};

/** 关键页面链接检查：有链接且能打开（HTTP < 400）才 pass */
export function linkCheck(ctx, kind, label) {
  requireHome(ctx);
  const link = ctx.keyLinks && ctx.keyLinks[kind];
  if (!link) return fail([`首页未发现「${label}」链接`]);
  const page = ctx.keyPages && ctx.keyPages[kind];
  if (!page) throw new CheckDataError(`${label}页面未抓取`);
  const where = link.inFooter ? '页脚' : '页面';
  if (page.error) {
    return { status: 'error', evidence: [`${where}链接「${q(link.text)}」→ ${link.href}`], note: `${label}页面打不开：${page.error}` };
  }
  if (page.status == null) throw new CheckDataError(`${label}页面无 HTTP 状态`);
  if (page.status >= 400) return fail([`${where}链接「${q(link.text)}」→ ${link.href} 返回 HTTP ${page.status}`]);
  return pass([`${where}链接「${q(link.text)}」→ ${page.url || link.href}（HTTP ${page.status}）`], link.inFooter ? '' : '链接不在页脚，请确认用户容易找到');
}

/** 横幅识别不到时的统一处理：有 CMP 迹象→manual（附截图）；无任何迹象→na（交由 C-01 判定） */
export function noBanner(ctx) {
  const before = ctx.states && ctx.states.before;
  const cmp = cmpSignals(before && before.requests);
  if (ctx.home.hasConsentText || cmp.length) {
    return manual([...shotEvidence(before && before.screenshot), ...(cmp.length ? [`CMP 脚本：${cmp.join('、')}`] : [])], '未能自动识别 Cookie 横幅，请对照截图人工确认');
  }
  return na([], '未发现 Cookie 横幅，见 C-01');
}

export { trackerSignals, cmpSignals, analyticsLikeSignals };

export const describeAnalyticsLike = (list) => `清单外的疑似统计上报：${list.slice(0, 5).map((x) => `${x.host}${x.path}（${x.type}）`).join('、')}`;

export function describeTrackers(sig) {
  const out = [];
  if (sig.cookies.length) out.push(`Cookie：${[...new Set(sig.cookies.map((c) => c.name))].slice(0, 10).map((n) => '`' + n + '`').join('、')}`);
  if (sig.requests.length) out.push(`请求：${sig.requests.slice(0, 10).map((r) => `${r.vendor}（${r.host}）`).join('、')}`);
  return out;
}

export function allForms(ctx) {
  const forms = (ctx.home.forms || []).map((f) => ({ ...f, page: '首页' }));
  const contact = ctx.keyPages && ctx.keyPages.contact;
  if (contact && contact.forms) forms.push(...contact.forms.map((f) => ({ ...f, page: `联系页 ${contact.url || contact.href}` })));
  for (const p of ctx.formPages || []) forms.push(...(p.forms || []).map((f) => ({ ...f, page: `${p.url} ` })));
  return forms;
}
