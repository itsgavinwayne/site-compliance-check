// CN-01 / CN-02 共用：备案号文本 + 指定域名链接
import { requireHome, pass, fail } from './_lib.js';
export function beianCheck(ctx, { re, hosts, label }) {
  const home = requireHome(ctx);
  const text = `${home.footerText}\n${home.bodyText}`;
  const m = text.match(re);
  const link = home.links.find((l) => { try { const h = new URL(l.href).hostname; return hosts.some((x) => h === x || h.endsWith('.' + x)); } catch { return false; } });
  if (m && link) return pass([`${label}「${m[0].trim()}」→ ${link.href}`]);
  if (m) return fail([`有${label}「${m[0].trim()}」，但未链接到 ${hosts.join(' / ')}`]);
  if (link) return fail([`有指向 ${link.href} 的链接，但页面上没有识别到${label}文本`]);
  return fail([`首页未发现${label}文本`]);
}
