// C-06 是否有 Cookie 政策（独立链接；或隐私政策内含 Cookie 章节 → manual）
import { requireHome, linkCheck, manual, fail } from './_lib.js';
export default async function check(ctx) {
  requireHome(ctx);
  if (ctx.keyLinks && ctx.keyLinks.cookie) {
    const r = linkCheck(ctx, 'cookie', 'Cookie 政策');
    if (r.status !== 'fail') return r;
  }
  const p = ctx.keyPages && ctx.keyPages.privacy;
  if (p && !p.error && p.status < 400) {
    const n = (String(p.text).match(/cookie|クッキー/gi) || []).length;
    if (n >= 3) return manual([`未找到独立 Cookie 政策；隐私政策页提到 cookie ${n} 次`], '请人工确认隐私政策中列出了 Cookie 名称、提供方、用途、有效期');
  }
  return fail(['首页未发现 Cookie 政策链接，隐私政策中也没有 Cookie 相关章节']);
}
