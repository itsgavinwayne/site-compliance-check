// C-01 是否有 Cookie 同意横幅
// 识别到 → pass；识别不到但有 CMP 脚本/同意相关文字 → manual（附截图）；
// 无横幅且同意前无任何追踪 → na（可能不需要横幅）；无横幅、无同意迹象、却已有追踪 → fail。
import { requireHome, requireState, pass, fail, na, manual, noBanner, trackerSignals, describeTrackers, analyticsLikeSignals, describeAnalyticsLike, shotEvidence, q } from './_lib.js';
export default async function check(ctx) {
  const home = requireHome(ctx);
  const before = requireState(ctx, 'before');
  if (home.banner) {
    const b = home.banner;
    return pass([`识别到横幅${b.frameUrl ? `（iframe ${b.frameUrl}）` : ''}：「${q(b.text, 80)}」`, `按钮：${b.buttons.map((x) => `${x.text}[${x.kind}]`).slice(0, 6).join('、')}`]);
  }
  const amb = noBanner(ctx);
  if (amb.status === 'manual') return amb;
  const sig = trackerSignals(before);
  const like = analyticsLikeSignals(before);
  if (!sig.any && like.length) return manual([`没有横幅，也未发现已知追踪，但有${describeAnalyticsLike(like)}`, ...shotEvidence(before.screenshot)], '是否需要横幅取决于该统计是否需要同意（见 C-02），请人工确认');
  if (!sig.any) return na([], '同意前未发现已知追踪 Cookie 或请求，可能不需要横幅；若后续页面或交互会设置非必要 Cookie，仍需横幅，请人工确认');
  return fail(['页面上没有 Cookie 横幅、同意管理脚本或相关文字，但同意前已有追踪：', ...describeTrackers(sig), ...shotEvidence(before.screenshot)]);
}
