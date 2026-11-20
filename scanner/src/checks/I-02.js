// I-02 (hybrid) UK 公司名称、注册号、注册地址
import { disclosureCheck } from './_disclosure.js';
export default async function check(ctx) {
  return disclosureCheck(ctx, ['company', 'registration', 'address']);
}
