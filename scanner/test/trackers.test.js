import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyTracker, classifyEmbed, classifyCookie, siteOf, thirdPartyHosts } from '../src/trackers.js';

test('追踪域名', () => {
  assert.equal(classifyTracker('https://www.google-analytics.com/g/collect').vendor, 'Google Analytics');
  assert.equal(classifyTracker('https://www.facebook.com/tr?id=1').vendor, 'Meta Pixel');
  assert.equal(classifyTracker('https://www.facebook.com/somepage'), null);
  assert.equal(classifyTracker('https://hm.baidu.com/hm.js?x').vendor, '百度统计');
  assert.equal(classifyTracker('https://notgoogle-analytics.com/'), null);
});
test('第三方嵌入', () => {
  assert.equal(classifyEmbed('https://fonts.gstatic.com/s/roboto.woff2').vendor, 'Google Fonts');
  assert.equal(classifyEmbed('https://www.youtube-nocookie.com/embed/x').vendor, 'YouTube (nocookie)');
  assert.equal(classifyEmbed('https://www.google.com/maps/embed?pb=1').vendor, 'Google Maps');
  assert.equal(classifyEmbed('https://www.google.com/search'), null);
});
test('Cookie 名', () => {
  for (const n of ['_ga', '_ga_ABC123', '_gid', '_fbp', '_hjSessionUser_1', 'Hm_lvt_abc', '_gcl_au']) assert.ok(classifyCookie(n), n);
  for (const n of ['session', 'consent', 'csrftoken', '_gallery']) assert.equal(classifyCookie(n), null, n);
});
test('第一方/第三方', () => {
  assert.equal(siteOf('www.example.co.uk'), 'example.co.uk');
  assert.deepEqual(thirdPartyHosts([{ url: 'https://cdn.example.com/a.js' }, { url: 'https://fonts.gstatic.com/x' }], 'https://www.example.com/'), ['fonts.gstatic.com']);
});
