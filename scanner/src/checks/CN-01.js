// CN-01 ICP 备案号且链接到 beian.miit.gov.cn
import { beianCheck } from './_beian.js';
import { ICP } from '../patterns.js';
export default async function check(ctx) {
  return beianCheck(ctx, { re: ICP, hosts: ['beian.miit.gov.cn'], label: 'ICP 备案号' });
}
