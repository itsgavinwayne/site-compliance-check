import { test } from 'node:test';
import assert from 'node:assert/strict';
import { line, sortResults, buildJson, buildMarkdown } from '../src/report.js';

const r = (o) => ({ evidence: [], note: '', markets: ['EU', 'UK'], automated: true, check: 'auto', ...o });

test('单行格式：❌ C-02 <缺少什么>：<证据> → 影响 EU UK ｜ 必须', () => {
  const s = line(r({ id: 'C-02', status: 'fail', level: 'must', missing: '用户同意前已加载统计/广告类 Cookie 或脚本', evidence: ['同意前已加载 Cookie：`_ga`、`_fbp`'] }));
  assert.equal(s, '❌ C-02 用户同意前已加载统计/广告类 Cookie 或脚本：同意前已加载 Cookie：`_ga`、`_fbp` → 影响 EU UK ｜ 必须');
});

test('排序：必须 → 视情况 → 建议，再按分类', () => {
  const rows = [
    r({ id: 'I-04', category: 'disclosure', level: 'recommended' }),
    r({ id: 'A-02', category: 'accessibility', level: 'conditional' }),
    r({ id: 'C-01', category: 'cookies', level: 'must' }),
    r({ id: 'P-01', category: 'privacy-policy', level: 'must' }),
    r({ id: 'C-09', category: 'cookies', level: 'conditional' }),
    r({ id: 'C-10', category: 'cookies', level: 'conditional' }),
  ];
  assert.deepEqual(sortResults(rows).map((x) => x.id), ['P-01', 'C-01', 'C-09', 'C-10', 'A-02', 'I-04']);
});

test('Markdown 末尾列出人工确认项', () => {
  const ctx = { url: 'http://x.test', finalUrl: 'http://x.test', startedAt: 't', states: {}, keyPages: {}, errors: {} };
  const results = [
    r({ id: 'C-02', category: 'cookies', status: 'fail', level: 'must', missing: 'm' }),
    r({ id: 'P-08', category: 'privacy-policy', status: 'manual', level: 'recommended', missing: 'm2', check: 'hybrid' }),
    r({ id: 'L-01', category: 'licensing', status: 'manual', level: 'must', missing: 'm3', check: 'manual', automated: false }),
  ];
  const md = buildMarkdown(buildJson(ctx, results));
  const i = md.indexOf('## 需人工确认');
  assert.ok(i > md.indexOf('❌ C-02'));
  assert.ok(md.indexOf('🔍 P-08') > i);
  assert.ok(md.indexOf('- [ ] L-01') > i);
});
