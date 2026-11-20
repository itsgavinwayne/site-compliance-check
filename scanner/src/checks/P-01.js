// P-01 隐私政策链接存在且可打开
import { linkCheck } from './_lib.js';
export default async function check(ctx) {
  return linkCheck(ctx, 'privacy', '隐私政策');
}
