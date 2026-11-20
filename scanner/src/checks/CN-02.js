// CN-02 公安联网备案号且链接到公安备案网站
// beian.mps.gov.cn 为现行地址；www.beian.gov.cn 为旧地址（仍常见），同样接受
import { beianCheck } from './_beian.js';
import { GONGAN } from '../patterns.js';
export default async function check(ctx) {
  return beianCheck(ctx, { re: GONGAN, hosts: ['beian.mps.gov.cn', 'www.beian.gov.cn'], label: '公安联网备案号' });
}
