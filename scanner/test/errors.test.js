// 检查出错时一律为 error，绝不为 pass
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { loadRegistry } from '../src/registry.js';
import { runAll, runCheck, checkFile } from '../src/run.js';
import { collect } from '../src/crawl.js';
import { TEST_OPTS } from './helpers.js';

test('每条 auto/hybrid 规则都有检查函数，manual 规则没有', async () => {
  const reg = await loadRegistry();
  for (const r of reg.rules) {
    if (r.check === 'manual') assert.ok(!existsSync(checkFile(r.id)), `${r.id} 是 manual，不应有检查函数`);
    else assert.ok(existsSync(checkFile(r.id)), `${r.id} 缺检查函数`);
  }
});

test('空 ctx（采集全部失败）→ 所有自动检查为 error，没有 pass', async () => {
  const reg = await loadRegistry();
  const ctx = { url: 'http://x.invalid', home: null, states: {}, keyLinks: {}, keyPages: {}, axe: null, errors: { before: 'net::ERR_NAME_NOT_RESOLVED' } };
  const results = await runAll(reg, ctx);
  for (const r of results) {
    if (r.check === 'manual') assert.equal(r.status, 'manual', r.id);
    else assert.equal(r.status, 'error', `${r.id} 应为 error，实际 ${r.status}`);
  }
});

test('部分状态缺失（只有首页）→ 依赖该状态的检查为 error', async () => {
  const reg = await loadRegistry();
  const home = { links: [], forms: [], checkboxes: [], reopen: [], banner: null, bodyText: '', footerText: '', hasConsentText: false };
  const ctx = { url: 'http://x.test', home, states: {}, keyLinks: {}, keyPages: {}, axe: { error: 'boom' }, errors: { before: 'snapshot failed', gpc: 'timeout' } };
  const by = Object.fromEntries((await runAll(reg, ctx)).map((r) => [r.id, r]));
  for (const id of ['C-01', 'C-02', 'C-08', 'C-10', 'A-01']) assert.equal(by[id].status, 'error', id);
});

test('检查函数抛异常 → error', async () => {
  const r = await runCheck({ id: 'X-01', check: 'auto' }, {}, async () => ({ default: () => { throw new Error('kaboom'); } }));
  assert.equal(r.status, 'error');
  assert.match(r.note, /kaboom/);
});

test('检查函数返回无效状态 → error', async () => {
  for (const bad of [undefined, null, {}, { status: 'ok' }, { status: 'PASS' }, 'pass']) {
    const r = await runCheck({ id: 'X-01', check: 'auto' }, {}, async () => ({ default: () => bad }));
    assert.equal(r.status, 'error', JSON.stringify(bad));
  }
});

test('缺检查函数 → error', async () => {
  const r = await runCheck({ id: 'ZZ-99', check: 'auto' }, {});
  assert.equal(r.status, 'error');
});

test('关键页面打不开（超时）→ linkCheck 为 error 而非 pass', async () => {
  const { default: p01 } = await import('../src/checks/P-01.js');
  const ctx = { home: { links: [] }, keyLinks: { privacy: { text: 'Privacy', href: 'http://x.test/p', inFooter: true } }, keyPages: { privacy: { href: 'http://x.test/p', error: 'Timeout 15000ms exceeded' } }, states: {}, errors: {} };
  assert.equal((await p01(ctx)).status, 'error');
});

test('端到端：站点无法访问 → 自动检查全部 error', async () => {
  const reg = await loadRegistry();
  const ctx = await collect('http://127.0.0.1:9/', { ...TEST_OPTS, timeout: 5000 });
  assert.ok(ctx.errors.before);
  const results = await runAll(reg, ctx);
  assert.deepEqual(results.filter((r) => r.check !== 'manual' && r.status !== 'error').map((r) => r.id), []);
});
