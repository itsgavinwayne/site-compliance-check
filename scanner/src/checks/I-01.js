// I-01 (hybrid) EU 服务提供者信息：公司名、地址、邮箱、注册号、增值税号
import { disclosureCheck } from './_disclosure.js';
export default async function check(ctx) {
  return disclosureCheck(ctx, ['company', 'address', 'email', 'registration', 'vat']);
}
