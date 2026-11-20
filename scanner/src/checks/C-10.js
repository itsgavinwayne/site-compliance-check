// C-10 (hybrid) 带 GPC 信号时追踪请求是否减少
import { requireState, manual, fail, na, trackerSignals, CheckDataError } from './_lib.js';
const vendors = (s) => new Set([...s.requests, ...s.cookies].map((x) => x.vendor));
export default async function check(ctx) {
  const before = requireState(ctx, 'before');
  const gpc = requireState(ctx, 'gpc');
  if (!gpc.gpcInjected) throw new CheckDataError('navigator.globalPrivacyControl 注入失败');
  const b = vendors(trackerSignals(before));
  const g = vendors(trackerSignals(gpc));
  if (!b.size) return na([], '无 GPC 时也未发现追踪，无法比较；如追踪只在同意后加载，需人工在"同意后 + GPC"下确认');
  const gone = [...b].filter((v) => !g.has(v));
  if (gone.length) return manual([`带 GPC 后不再出现：${gone.join('、')}`, ...(g.size ? [`仍出现：${[...g].join('、')}`] : [])], '请人工确认 GPC 被当作"拒绝出售/共享"处理');
  return fail([`带 Sec-GPC: 1 与 navigator.globalPrivacyControl 后仍加载：${[...g].join('、')}`]);
}
