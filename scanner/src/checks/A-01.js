// A-01 (hybrid) axe-core WCAG 2.1 A/AA 自动规则；自动只能覆盖一部分，0 违规也需人工
import { requireHome, fail, manual, CheckDataError } from './_lib.js';
export default async function check(ctx) {
  requireHome(ctx);
  const axe = ctx.axe;
  if (!axe || axe.error) throw new CheckDataError(`axe 运行失败：${(axe && axe.error) || '无数据'}`);
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const v = [...axe.violations].sort((a, b) => (order[a.impact] ?? 9) - (order[b.impact] ?? 9));
  if (v.length) return fail([`axe 发现 ${v.length} 类违规：${v.slice(0, 6).map((x) => `${x.id}（${x.impact}，${x.nodes} 处）`).join('、')}`], '仅首页、仅自动规则；完整 WCAG 2.1 AA 需人工审查');
  return manual([`axe 首页未发现违规（通过 ${axe.passes} 项，待人工 ${axe.incomplete} 项）`], '自动规则只覆盖 WCAG 一部分，需人工审查键盘操作、读屏、对比度等');
}
