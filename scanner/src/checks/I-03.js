// I-03 是否有 Impressum 链接
import { linkCheck } from './_lib.js';
export default async function check(ctx) {
  return linkCheck(ctx, 'impressum', 'Impressum');
}
