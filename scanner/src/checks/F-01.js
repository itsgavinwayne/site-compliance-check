// F-01 收集个人信息的表单附近是否有隐私政策链接
import { requireHome, pass, fail, na, allForms, q } from './_lib.js';
const desc = (f) => `${f.page}表单#${f.index}（字段：${f.fields.map((x) => x.label || x.name || x.type).slice(0, 5).join('、')}）`;
export default async function check(ctx) {
  requireHome(ctx);
  const forms = allForms(ctx).filter((f) => f.hasPI);
  if (!forms.length) return na([], '首页、联系页及抽查的合作/询价类页面未发现收集 email/电话的表单；其他页面的表单需人工确认');
  const bad = forms.filter((f) => !f.privacyLinks.length);
  if (bad.length) return fail(bad.slice(0, 4).map((f) => `${desc(f)}附近没有隐私政策链接`));
  return pass(forms.slice(0, 4).map((f) => `${desc(f)}→ 隐私链接「${q(f.privacyLinks[0].text)}」`));
}
