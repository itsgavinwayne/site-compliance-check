// C-05 (hybrid) 是否有再次打开/撤回同意的入口
import { requireHome, fail, manual, noBanner, q } from './_lib.js';
export default async function check(ctx) {
  const home = requireHome(ctx);
  const found = [...(home.reopen || []), ...((ctx.states.reject && ctx.states.reject.reopen) || [])];
  const uniq = [...new Map(found.map((f) => [f.text + f.code, f])).values()];
  if (uniq.length) return manual(uniq.slice(0, 4).map((f) => `入口：「${q(f.text || f.code, 50)}」`), '请人工确认点击后能修改或撤回同意');
  if (!home.banner) return noBanner(ctx);
  return fail(['首页及拒绝后的页面均未发现"Cookie 设置"类入口或 CMP 悬浮按钮'], '若入口是无文字图标，请人工确认');
}
