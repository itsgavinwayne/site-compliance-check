// P-08 (hybrid) 隐私政策是否有更新日期
import { requireHome, manual, fail, na, CheckDataError } from './_lib.js';
import { UPDATED_DATE } from '../patterns.js';
export default async function check(ctx) {
  requireHome(ctx);
  if (!ctx.keyLinks || !ctx.keyLinks.privacy) return na([], '未发现隐私政策，见 P-01');
  const page = ctx.keyPages.privacy;
  if (!page || page.error) throw new CheckDataError(`隐私政策页打不开：${page ? page.error : '未抓取'}`);
  if (page.status >= 400) return na([], `隐私政策页返回 HTTP ${page.status}，见 P-01`);
  const m = String(page.text || '').match(UPDATED_DATE);
  if (m) return manual([`隐私政策页发现日期：「${m[0].trim().slice(0, 80)}」`], '请人工确认这是隐私政策的更新/生效日期');
  return fail([`隐私政策页（${page.url || page.href}）未发现"最后更新/生效日期"类字样`]);
}
