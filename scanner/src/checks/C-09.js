// C-09 是否有 "Do Not Sell or Share" 类链接
import { requireHome, pass, fail, q } from './_lib.js';
import { DO_NOT_SELL } from '../patterns.js';
export default async function check(ctx) {
  const home = requireHome(ctx);
  const hits = home.links.filter((l) => DO_NOT_SELL.test(l.text));
  if (hits.length) {
    const h = hits.find((l) => l.inFooter) || hits[0];
    return pass([`${h.inFooter ? '页脚' : '页面'}链接「${q(h.text)}」${h.href ? '→ ' + h.href : ''}`]);
  }
  return fail(['首页未发现 "Do Not Sell or Share" / "Your Privacy Choices" 类链接']);
}
