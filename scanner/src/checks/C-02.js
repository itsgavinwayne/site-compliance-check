// C-02 同意前（及拒绝后）是否已加载统计/广告类 Cookie 或脚本
import { requireState, pass, fail, manual, trackerSignals, describeTrackers, analyticsLikeSignals, describeAnalyticsLike } from './_lib.js';
export default async function check(ctx) {
  const before = requireState(ctx, 'before');
  const sig = trackerSignals(before);
  const rej = ctx.states.reject;
  const rejSig = rej && rej.attempted && rej.requests ? trackerSignals(rej) : null;
  if (sig.any) return fail(['同意前已加载 ' + describeTrackers(sig).join('；')]);
  if (rejSig && rejSig.any) return fail([`点击「${rej.clicked}」拒绝后仍加载 ` + describeTrackers(rejSig).join('；')]);
  // 清单外、路径像统计上报的请求（常见于自建统计）：不能当作"未发现追踪"直接通过
  const like = analyticsLikeSignals(before);
  if (like.length) return manual([`同意前未发现已知追踪 Cookie 或清单内的追踪域名，但有${describeAnalyticsLike(like)}`], '请人工确认该统计收集哪些数据、是否读取设备信息或生成标识符，以及是否需要事先同意');
  const notes = [];
  if (ctx.errors.reject) notes.push(`"拒绝后"状态采集失败：${ctx.errors.reject}`);
  else if (!rej || !rej.attempted) notes.push(`未验证"拒绝后"状态（${(rej && rej.reason) || '未执行'}）`);
  return pass([`同意前未发现已知追踪 Cookie 或请求（共 ${before.requests.length} 个请求、${before.cookies.length} 个 Cookie）`, ...(rejSig ? [`拒绝后（含刷新${rej.innerPage ? '与内页 ' + rej.innerPage : ''}）也未发现`] : [])], [...notes, '追踪清单见 src/trackers.js，未收录的工具不会被识别'].join('；'));
}
