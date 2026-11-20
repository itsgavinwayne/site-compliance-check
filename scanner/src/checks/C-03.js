// C-03 横幅第一层是否有拒绝按钮，且不比接受更难操作
import { requireHome, pass, fail, manual, noBanner, q } from './_lib.js';
export default async function check(ctx) {
  const home = requireHome(ctx);
  if (!home.banner) return noBanner(ctx);
  const btns = home.banner.buttons;
  const reject = btns.filter((b) => b.kind === 'reject');
  const accept = btns.filter((b) => b.kind === 'accept');
  const list = `横幅按钮：${btns.map((b) => `${q(b.text, 30)}[${b.kind}]`).slice(0, 8).join('、')}`;
  if (!reject.length) {
    const hasSettings = btns.some((b) => b.kind === 'settings');
    return fail([list], hasSettings ? '第一层只有接受/设置，拒绝需要进入第二层' : '横幅上没有拒绝选项');
  }
  const r = Math.max(...reject.map((b) => b.area));
  const a = accept.length ? Math.max(...accept.map((b) => b.area)) : 0;
  if (a && r < a * 0.25) return manual([list, `拒绝按钮面积约为接受按钮的 ${Math.round((r / a) * 100)}%`], '拒绝选项明显弱于接受，请人工判断是否"更难操作"');
  const rej = ctx.states.reject;
  const notes = [];
  if (rej && rej.attempted && rej.bannerAfterReload) notes.push('点击拒绝并刷新后横幅仍出现，请确认拒绝是否被记住');
  return pass([list], notes.join('；'));
}
