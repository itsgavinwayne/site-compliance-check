// I-01 / I-02 共用：在 Impressum/条款/页脚/首页正文中寻找公示信息信号
import { DISCLOSURE } from '../patterns.js';
import { requireHome, manual, fail, q } from './_lib.js';
const LABEL = { company: '公司名', address: '地址', email: '邮箱', registration: '注册号', vat: '增值税号', registeredAddress: '注册地址' };
export function disclosureCheck(ctx, needed) {
  const home = requireHome(ctx);
  const sources = [];
  const NAME = { impressum: 'Impressum/法律声明', terms: '条款', contact: '联系' };
  for (const k of ['impressum', 'terms', 'contact']) {
    const p = ctx.keyPages && ctx.keyPages[k];
    if (p && !p.error && p.status < 400) sources.push([`${NAME[k]}页`, p.text]);
  }
  sources.push(['页脚', home.footerText], ['首页', home.bodyText]);
  const found = {};
  for (const key of needed) {
    for (const [where, text] of sources) {
      const m = String(text || '').match(DISCLOSURE[key]);
      if (m) { found[key] = `${LABEL[key]}（${where}）：「${q(m[0], 50)}」`; break; }
    }
  }
  const missing = needed.filter((k) => !found[k]);
  if (!Object.keys(found).length) return fail([`未发现${needed.map((k) => LABEL[k]).join('、')}`]);
  return manual(Object.values(found), missing.length ? `未自动找到：${missing.map((k) => LABEL[k]).join('、')}；请人工确认信息完整、真实` : '请人工确认信息完整、真实');
}
