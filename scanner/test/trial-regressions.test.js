// 真实站点试跑（S4）发现的误报/漏报的回归测试。fixture 均为虚构内容。
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, scanFixture } from './helpers.js';
import { classifyAnalyticsLike } from '../src/trackers.js';
import { findFormPages } from '../src/crawl.js';
import { DISCLOSURE } from '../src/patterns.js';

let srv;
const scans = {};
before(async () => {
  srv = await startServer();
  for (const name of ['selfhosted', 'zhfooter', 'ambiguous']) scans[name] = await scanFixture(`${srv.base}/${name}/index.html`);
});
after(() => srv && srv.close());

const r = (f, id) => scans[f].by[id];
const st = (f, id, status) => {
  const x = r(f, id);
  assert.equal(x.status, status, `${f} ${id}: 期望 ${status}，实际 ${x.status}；evidence=${JSON.stringify(x.evidence)} note=${x.note}`);
};

// 误报：页脚"隐私政策 / Datenschutz / Cookie Policy"链接文字、正文里普通的"同意"被当作 Cookie 告知，
// 导致没有横幅、没有追踪的页面 C-01/C-03/C-04/C-05 变成 manual。
test('页脚隐私链接与普通"同意"字样不算 Cookie 告知 → C-01..C-05 na', () => {
  assert.equal(scans.zhfooter.ctx.home.hasConsentText, false);
  for (const id of ['C-01', 'C-03', 'C-04', 'C-05']) st('zhfooter', id, 'na');
});
test('正文里真正的 Cookie 告知文字仍会触发 manual（不回退）', () => {
  assert.equal(scans.ambiguous.ctx.home.hasConsentText, true);
  st('ambiguous', 'C-01', 'manual');
});

// 漏报：清单外的自建统计（sendBeacon 到 .../analytics-ingest）被当作"未发现追踪"，C-02 直接 pass、C-01 na。
test('清单外的统计上报 → C-02 manual（不再 pass）并列出端点', () => {
  st('selfhosted', 'C-02', 'manual');
  assert.match(r('selfhosted', 'C-02').evidence.join(' '), /analytics-ingest/);
});
test('无横幅 + 清单外统计 → C-01 manual（不再 na）；无 Cookie 告知文字 → C-03 仍为 na', () => {
  st('selfhosted', 'C-01', 'manual');
  assert.match(r('selfhosted', 'C-01').evidence.join(' '), /疑似统计上报/);
  st('selfhosted', 'C-03', 'na');
});
test('classifyAnalyticsLike 只认路径中的统计词、只看 fetch/xhr/ping/image', () => {
  assert.ok(classifyAnalyticsLike({ url: 'https://x.example/functions/v1/analytics-ingest', type: 'ping' }));
  assert.ok(classifyAnalyticsLike({ url: 'https://example.com/api/event', type: 'fetch' }));
  assert.equal(classifyAnalyticsLike({ url: 'https://example.com/analytics/', type: 'document' }), null);
  assert.equal(classifyAnalyticsLike({ url: 'https://example.com/blog/tracking-numbers', type: 'fetch' }), null);
  assert.equal(classifyAnalyticsLike({ url: 'https://example.com/api/products', type: 'fetch' }), null);
  // 已在追踪清单里的不重复列出
  assert.equal(classifyAnalyticsLike({ url: 'https://www.google-analytics.com/g/collect', type: 'ping' }), null);
});

// 漏报：收集邮箱的表单在"合作申请"页而不在联系页，F-01 报 na。
test('联系页之外的合作申请页表单也会被检查 → F-01 fail', () => {
  st('selfhosted', 'F-01', 'fail');
  assert.match(r('selfhosted', 'F-01').evidence.join(' '), /partners\.html/);
});
test('findFormPages 只挑同站、像表单页的链接，排除已抓取页面', () => {
  const links = [
    { text: 'Partner programme', href: 'https://example.com/partners/' },
    { text: 'Request a quote', href: 'https://example.com/q#top' },
    { text: 'News', href: 'https://example.com/news/' },
    { text: 'Partner', href: 'https://other.example/partners/' },
    { text: 'Contact', href: 'https://example.com/contact/' },
  ];
  const got = findFormPages(links, 'https://example.com/', new Set(['https://example.com/contact/']));
  assert.deepEqual(got.map((x) => x.href), ['https://example.com/partners/', 'https://example.com/q']);
});

// 漏报：公司地址只写在联系页，且是"Room/Block + 号"格式，I-01/I-02 找不到地址。
test('联系页上的"Room 12, Block B, …"地址会被识别 → I-02 manual 且含地址', () => {
  st('selfhosted', 'I-02', 'manual');
  assert.match(r('selfhosted', 'I-02').evidence.join(' '), /地址（联系页）/);
});
test('地址正则："Room/Suite + 号, 名称" 命中，普通句子不命中', () => {
  assert.ok(DISCLOSURE.address.test('Room 305, Block C, Example Innovation Centre, Sampletown'));
  assert.ok(DISCLOSURE.address.test('Suite 200, Harbour Tower, Exampleton'));
  assert.equal(DISCLOSURE.address.test('See Block 5 of the agreement'), false);
  assert.equal(DISCLOSURE.address.test('Floor plan 3 is attached'), false);
});

test('新 fixture 没有 error 结果', () => {
  for (const [name, s] of Object.entries(scans)) {
    assert.deepEqual(s.results.filter((x) => x.status === 'error').map((x) => `${x.id}:${x.note}`), [], name);
  }
});

test('findFormPages 不把 "Industrial" 里的 trial 当成试用页', () => {
  const got = findFormPages([{ text: 'Enterprise / Industrial', href: 'https://example.com/products/enterprise-industrial/' }, { text: 'Free trial', href: 'https://example.com/start/' }], 'https://example.com/');
  assert.deepEqual(got.map((x) => x.href), ['https://example.com/start/']);
});
