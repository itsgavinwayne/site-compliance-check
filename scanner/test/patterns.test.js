// 真实站点试跑中发现的误判，固化为回归用例
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UPDATED_DATE, DISCLOSURE, KEY_PAGES, BUTTON, ICP, GONGAN } from '../src/patterns.js';
import C04 from '../src/checks/C-04.js';

test('P-08 日期：标签与日期分行也能识别', () => {
  for (const t of ['Last updated:\n1 June 2025', '最后更新：2026年1月15日', 'Stand: 01.02.2024', 'Dernière mise à jour : 12 mars 2024']) assert.ok(UPDATED_DATE.test(t), t);
  assert.ok(!UPDATED_DATE.test('the ‘last updated’ date at the bottom of this page will also change.'));
});

test('I-01 地址：年份 + 标题不算地址', () => {
  assert.ok(!DISCLOSURE.address.test('3 September 2024\nRelated content'));
  for (const t of ['Musterstraße 1', '10 Downing Street', 'SW1A 2AA', '1010 Wien', '上海市浦东新区世纪大道100号']) assert.ok(DISCLOSURE.address.test(t), t);
});

test('多语言关键页面文字', () => {
  for (const t of ['Privacy Policy', '隐私政策', 'Datenschutzerklärung', 'Politique de confidentialité', 'Política de privacidad', 'Informativa sulla privacy', 'Privacyverklaring', 'Política de Privacidade']) assert.ok(KEY_PAGES.privacy.text.test(t), t);
  for (const t of ['Impressum', 'Imprint', 'Mentions légales', 'Aviso legal']) assert.ok(KEY_PAGES.impressum.text.test(t), t);
  for (const t of ['Terms of Use', 'AGB', '用户协议', 'Conditions générales', 'Términos y condiciones', 'Algemene voorwaarden']) assert.ok(KEY_PAGES.terms.text.test(t), t);
  for (const t of ['Accessibility statement', 'Erklärung zur Barrierefreiheit', '无障碍声明', 'Déclaration d’accessibilité', 'Toegankelijkheidsverklaring']) assert.ok(KEY_PAGES.accessibility.text.test(t), t);
  assert.ok(KEY_PAGES.cookie.exclude.test('cookie settings'));
});

test('横幅按钮分类：拒绝优先于接受', () => {
  for (const t of ['Reject all', 'Alle ablehnen', '拒绝', 'Tout refuser', 'Rechazar todo', 'Rifiuta', 'Weigeren', 'Rejeitar', 'Only necessary cookies', 'Nur notwendige Cookies']) assert.ok(BUTTON.reject.test(t), t);
  for (const t of ['Accept all', 'Alle akzeptieren', '接受', 'Tout accepter', 'Aceptar', 'Accetta', 'Accepteren', 'Aceitar']) assert.ok(BUTTON.accept.test(t) && !BUTTON.reject.test(t), t);
});

test('备案号正则', () => {
  assert.ok(ICP.test('京ICP备12345678号-1'));
  assert.ok(ICP.test('粤ICP备2020123456号'));
  assert.ok(GONGAN.test('京公网安备11010502030000号'));
  assert.ok(!ICP.test('ICP 12345'));
});

test('C-04：横幅无分类开关但有其他入口（如 GOV.UK 的 View cookies）→ manual 而非 fail', async () => {
  const ctx = { home: { banner: { buttons: [{ text: 'Accept', kind: 'accept' }, { text: 'Reject', kind: 'reject' }, { text: 'View cookies', kind: 'other' }] } }, settingsProbe: { firstLayer: [], settingsLayer: [], settingsButton: null }, states: {}, errors: {} };
  assert.equal((await C04(ctx)).status, 'manual');
  ctx.home.banner.buttons.pop();
  assert.equal((await C04(ctx)).status, 'fail');
});
