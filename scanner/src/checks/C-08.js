// C-08 同意前是否加载 YouTube / Google 地图 / Google Fonts 等第三方嵌入
import { requireState, pass, fail } from './_lib.js';
import { embedSignals } from '../trackers.js';
export default async function check(ctx) {
  const before = requireState(ctx, 'before');
  const e = embedSignals(before);
  if (e.length) {
    const by = {};
    for (const x of e) (by[x.vendor] ||= new Set()).add(x.host);
    return fail([`同意前已请求：${Object.entries(by).map(([v, h]) => `${v}（${[...h].join('、')}）`).join('、')}`]);
  }
  return pass([`同意前未请求已知第三方嵌入域名（共 ${before.requests.length} 个请求）`], '嵌入清单见 src/trackers.js');
}
