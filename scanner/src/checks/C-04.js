// C-04 (hybrid) 设置层复选框是否默认勾选 / 能否按类别选择
import { requireHome, fail, manual, noBanner, shotEvidence, q, CheckDataError } from './_lib.js';
export default async function check(ctx) {
  const home = requireHome(ctx);
  if (!home.banner) return noBanner(ctx);
  const p = ctx.settingsProbe;
  if (!p) throw new CheckDataError(`设置层探测失败：${ctx.errors.settings || '无数据'}`);
  const boxes = [...(p.firstLayer || []), ...(p.settingsLayer || [])];
  const pre = boxes.filter((b) => b.checked && !b.disabled);
  const fmt = (b) => `「${q(b.label, 40)}」${b.checked ? '☑' : '☐'}${b.disabled ? '（锁定）' : ''}`;
  if (pre.length) return fail([`默认勾选的非锁定选项：${pre.slice(0, 6).map(fmt).join('、')}`, ...shotEvidence(p.screenshot)], '如该项确为"严格必要"类，应锁定而非默认勾选；请人工复核');
  const others = home.banner.buttons.filter((b) => b.kind === 'other');
  if (!p.settingsButton && !boxes.length && others.length) return manual([`横幅无分类开关，另有入口：${others.slice(0, 4).map((b) => `「${q(b.text, 30)}」`).join('、')}`, ...shotEvidence(ctx.states.before && ctx.states.before.screenshot)], '请人工确认该入口能按类别选择');
  if (!p.settingsButton && !boxes.length) return fail([`横幅按钮：${home.banner.buttons.map((b) => q(b.text, 30)).join('、')}`], '横幅没有设置入口，也没有分类开关，无法按类别选择');
  if (!boxes.length) return manual([`已点击「${p.settingsButton}」，但未识别到分类开关`, ...shotEvidence(p.screenshot)], '请对照截图人工确认能否按类别选择');
  return manual([`识别到 ${boxes.length} 个分类选项，非锁定项均未默认勾选：${boxes.slice(0, 6).map(fmt).join('、')}`, ...shotEvidence(p.screenshot)], '请人工确认分类完整、保存后生效');
}
