// F-02 表单里营销/订阅类复选框是否默认勾选
import { requireHome, pass, fail, na, allForms, q } from './_lib.js';
export default async function check(ctx) {
  requireHome(ctx);
  const boxes = allForms(ctx).flatMap((f) => f.checkboxes.filter((c) => c.marketing).map((c) => ({ ...c, page: f.page, index: f.index })));
  if (!boxes.length) return na([], '未发现营销/订阅类复选框；"与提交捆绑"需人工确认');
  const pre = boxes.filter((c) => c.checked);
  if (pre.length) return fail(pre.slice(0, 4).map((c) => `${c.page}表单#${c.index}「${q(c.label)}」默认已勾选`));
  return pass(boxes.slice(0, 4).map((c) => `${c.page}表单#${c.index}「${q(c.label)}」默认未勾选`), '"与提交捆绑"（不勾选就不能提交）需人工确认');
}
