// P-07 (hybrid) 是否存在中文隐私政策
import { requireHome, manual, fail, q } from './_lib.js';
const ZH = /隐私|隱私|个人信息保护|個人資料/;
const cjkRatio = (t) => { const s = String(t || '').replace(/\s/g, ''); if (!s) return 0; return (s.match(/[一-鿿]/g) || []).length / s.length; };
export default async function check(ctx) {
  requireHome(ctx);
  const ev = [];
  const cands = (ctx.keyLinkCandidates && ctx.keyLinkCandidates.privacy) || [];
  for (const c of cands) if (ZH.test(c.text)) ev.push(`中文隐私链接「${q(c.text)}」→ ${c.href}`);
  const page = ctx.keyPages && ctx.keyPages.privacy;
  if (page && !page.error) {
    if (/^zh/i.test(page.lang)) ev.push(`隐私政策页 lang="${page.lang}"`);
    const r = cjkRatio(page.text);
    if (r > 0.2) ev.push(`隐私政策页正文中文字符占比 ${(r * 100).toFixed(0)}%`);
    for (const a of page.alternates || []) if (/^zh/i.test(a.hreflang)) ev.push(`隐私政策页有中文版本 hreflang="${a.hreflang}" → ${a.href}`);
    for (const l of page.links || []) if (/^zh/i.test(l.hreflang || l.lang) || /^(中文|简体中文|繁體中文|简体|繁體)$/.test(l.text)) ev.push(`隐私政策页有中文切换链接「${q(l.text)}」→ ${l.href}`);
  }
  if (ev.length) return manual([...new Set(ev)].slice(0, 6), '发现中文隐私政策信号，请人工确认中文版内容完整且与其他语言版本一致');
  if (!ctx.keyLinks || !ctx.keyLinks.privacy) return fail(['未发现隐私政策（见 P-01），也就没有中文版']);
  if (page && page.error) return { status: 'error', evidence: [], note: `隐私政策页打不开：${page.error}` };
  return fail(['隐私政策链接与页面中均未发现中文版本信号']);
}
