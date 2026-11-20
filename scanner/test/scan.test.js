// 端到端：本地静态 fixture → collect → 全部检查
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, scanFixture } from './helpers.js';

let srv;
const scans = {};
before(async () => {
  srv = await startServer();
  for (const name of ['compliant', 'violating', 'nobanner', 'ambiguous', 'prechecked', 'gpc', 'plain']) {
    scans[name] = await scanFixture(`${srv.base}/${name}/index.html`);
  }
});
after(() => srv && srv.close());

const expectStatus = (fixture, id, status) => {
  const r = scans[fixture].by[id];
  assert.ok(r, `${id} 无结果`);
  assert.equal(r.status, status, `${fixture} ${id}: 期望 ${status}，实际 ${r.status}；evidence=${JSON.stringify(r.evidence)} note=${r.note}`);
};

// 每条 auto 规则：compliant → pass，违规 fixture → fail
const AUTO = {
  'P-01': 'violating', // 隐私链接 404
  'C-01': 'nobanner',
  'C-02': 'violating',
  'C-03': 'violating',
  'C-06': 'violating',
  'C-08': 'violating',
  'C-09': 'violating',
  'F-01': 'violating',
  'F-02': 'violating',
  'I-03': 'violating',
  'I-04': 'violating',
  'CN-01': 'violating', // 有备案号但未链接
  'CN-02': 'violating',
  'A-02': 'violating',
};
for (const [id, bad] of Object.entries(AUTO)) {
  test(`${id} pass（compliant）`, () => expectStatus('compliant', id, 'pass'));
  test(`${id} fail（${bad}）`, () => expectStatus(bad, id, 'fail'));
}

test('C-02 拒绝后仍加载追踪 → fail', () => {
  expectStatus('prechecked', 'C-02', 'fail');
  assert.match(scans.prechecked.by['C-02'].evidence.join(' '), /拒绝后仍加载/);
});
test('C-02 证据列出 Cookie 名', () => assert.match(scans.violating.by['C-02'].evidence.join(' '), /_ga.*_fbp|_fbp.*_ga/));
test('CN-01 有号未链接的说明', () => assert.match(scans.violating.by['CN-01'].evidence.join(' '), /未链接/));

// 横幅识别不到：有同意相关文字 → manual 并附截图，而不是 fail
test('识别不到横幅但有 Cookie 文字 → C-01/C-03/C-04 manual + 截图', () => {
  for (const id of ['C-01', 'C-03', 'C-04']) {
    expectStatus('ambiguous', id, 'manual');
    assert.match(scans.ambiguous.by[id].evidence.join(' '), /截图：/);
  }
});
test('无横幅且无追踪 → C-01 na，C-03 na', () => { expectStatus('plain', 'C-01', 'na'); expectStatus('plain', 'C-03', 'na'); });

// hybrid
test('P-07 compliant 中文隐私政策 → manual；violating → fail', () => { expectStatus('compliant', 'P-07', 'manual'); expectStatus('violating', 'P-07', 'fail'); });
test('P-08 compliant 有更新日期 → manual；violating 无隐私页 → na', () => { expectStatus('compliant', 'P-08', 'manual'); expectStatus('violating', 'P-08', 'na'); });
test('C-04 compliant 未默认勾选 → manual；prechecked → fail；violating 无分类 → fail', () => {
  expectStatus('compliant', 'C-04', 'manual');
  expectStatus('prechecked', 'C-04', 'fail');
  expectStatus('violating', 'C-04', 'fail');
});
test('C-05 compliant 有 Cookie settings 入口 → manual；violating → fail', () => { expectStatus('compliant', 'C-05', 'manual'); expectStatus('violating', 'C-05', 'fail'); });
test('C-10 GPC 下追踪消失 → manual；violating 仍加载 → fail；compliant 无追踪 → na', () => {
  expectStatus('gpc', 'C-10', 'manual');
  expectStatus('violating', 'C-10', 'fail');
  expectStatus('compliant', 'C-10', 'na');
});
test('GPC 状态确实发送了 Sec-GPC: 1 请求头', () => {
  assert.ok(srv.log.some((l) => l.path === '/gpc/index.html' && l.headers['sec-gpc'] === '1'));
  assert.ok(scans.gpc.ctx.states.gpc.gpcInjected);
});
test('I-01 / I-02 compliant → manual；violating → fail', () => {
  for (const id of ['I-01', 'I-02']) { expectStatus('compliant', id, 'manual'); expectStatus('violating', id, 'fail'); }
});
test('A-01 compliant → manual；violating（缺 alt、无 label）→ fail', () => { expectStatus('compliant', 'A-01', 'manual'); expectStatus('violating', 'A-01', 'fail'); });

// 状态采集
test('拒绝后状态：点击拒绝、刷新、访问内页', () => {
  const r = scans.compliant.ctx.states.reject;
  assert.equal(r.attempted, true);
  assert.equal(r.clicked, 'Reject all');
  assert.match(r.innerPage, /about\.html$/);
  assert.equal(r.bannerAfterReload, false);
});
test('关键页面发现', () => {
  const k = scans.compliant.ctx.keyLinks;
  for (const kind of ['privacy', 'cookie', 'impressum', 'terms', 'accessibility']) assert.ok(k[kind], `未发现 ${kind}`);
  assert.match(k.cookie.href, /cookies\.html$/);
});
test('manual 规则不执行检查函数', () => {
  for (const id of ['P-02', 'P-03', 'C-07', 'F-03', 'L-01']) {
    const r = scans.compliant.by[id];
    assert.equal(r.status, 'manual');
    assert.equal(r.automated, false);
  }
});
test('任何 fixture 都没有 error 结果（采集完整）', () => {
  for (const [name, s] of Object.entries(scans)) {
    const errs = s.results.filter((r) => r.status === 'error');
    assert.deepEqual(errs.map((r) => `${r.id}:${r.note}`), [], name);
  }
});
