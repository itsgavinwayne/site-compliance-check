// I-04 是否有服务条款/法律声明链接
import { linkCheck } from './_lib.js';
export default async function check(ctx) {
  return linkCheck(ctx, 'terms', '服务条款/法律声明');
}
