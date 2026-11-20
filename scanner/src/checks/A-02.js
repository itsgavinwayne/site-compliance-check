// A-02 是否有无障碍声明链接
import { linkCheck } from './_lib.js';
export default async function check(ctx) {
  return linkCheck(ctx, 'accessibility', '无障碍声明');
}
