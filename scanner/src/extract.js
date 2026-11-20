// 在浏览器页面内执行的 DOM 提取函数（通过 page.evaluate / frame.evaluate 注入）。
// 注意：本函数会被序列化后在页面中运行，不能引用外部变量；正则以 [source, flags] 传入。
import { KEY_PAGES, BUTTON, CONSENT_TEXT, AMBIENT_CONSENT_TEXT, CONSENT_REOPEN_TEXT, CONSENT_REOPEN_CODE, MARKETING, PI_FIELD_NAME, DO_NOT_SELL } from './patterns.js';

const rx = (r) => [r.source, r.flags];

export const PATTERN_ARGS = {
  reject: rx(BUTTON.reject),
  accept: rx(BUTTON.accept),
  settings: rx(BUTTON.settings),
  consentText: rx(CONSENT_TEXT),
  ambientConsent: rx(AMBIENT_CONSENT_TEXT),
  reopenText: rx(CONSENT_REOPEN_TEXT),
  reopenCode: rx(CONSENT_REOPEN_CODE),
  marketing: rx(MARKETING),
  piField: rx(PI_FIELD_NAME),
  privacyText: rx(KEY_PAGES.privacy.text),
  privacyHref: rx(KEY_PAGES.privacy.href),
  doNotSell: rx(DO_NOT_SELL),
};

/** 页面内运行：返回链接、表单、横幅、复选框等结构化信息 */
export function extractInPage(P) {
  const R = Object.fromEntries(Object.entries(P).map(([k, [s, f]]) => [k, new RegExp(s, f)]));
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  // 遍历含 open shadow DOM 的所有元素
  const all = [];
  (function walk(root) {
    for (const el of root.querySelectorAll('*')) {
      all.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  })(document);

  const visible = (el) => {
    if (!el || !el.getClientRects || el.getClientRects().length === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement || (e.getRootNode && e.getRootNode().host)) {
      const s = getComputedStyle(e);
      if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) return false;
    }
    return true;
  };
  const textOf = (el) => norm(el.innerText || el.textContent || el.value || '');
  const labelOf = (el) => norm([textOf(el), el.getAttribute && el.getAttribute('aria-label'), el.getAttribute && el.getAttribute('title'), el.value && el.type !== 'checkbox' ? el.value : ''].filter(Boolean).join(' '));
  const contains = (a, b) => {
    for (let e = b; e; e = e.parentElement || (e.getRootNode && e.getRootNode() !== document && e.getRootNode().host)) if (e === a) return true;
    return false;
  };
  let sccId = 0;
  const mark = (el) => {
    if (!el.getAttribute('data-scc')) el.setAttribute('data-scc', 'e' + (++sccId) + '_' + Math.random().toString(36).slice(2, 7));
    return `[data-scc="${el.getAttribute('data-scc')}"]`;
  };
  const isFooter = (el) => {
    for (let e = el; e; e = e.parentElement) {
      if (e.tagName === 'FOOTER' || e.getAttribute('role') === 'contentinfo' || /(^|[\s_-])footer/i.test((e.id || '') + ' ' + (typeof e.className === 'string' ? e.className : ''))) return true;
    }
    return false;
  };

  // ---------- Cookie 横幅 ----------
  const KNOWN = ['#onetrust-banner-sdk', '#CybotCookiebotDialog', '#usercentrics-root', '#uc-banner', '.cc-window', '#cookie-law-info-bar', '.cky-consent-container', '.cmplz-cookiebanner', '#didomi-notice', '#didomi-host', '.qc-cmp2-container', '#truste-consent-track', '#iubenda-cs-banner', '.klaro .cookie-notice', '#klaro', '#cookiescript_injected', '#BorlabsCookieBox', '#cookie-notice', '#cookie-banner', '#cookieConsent', '#cookie-consent', '#gdpr-cookie-message', '#tarteaucitronAlertBig', '#axeptio_overlay', '.termly-styles-root', '#CookieBanner', '.cookie-banner', '.cookie-consent', '#cookiebanner', '.fc-consent-root', '#hs-eu-cookie-confirmation', '#moove_gdpr_cookie_info_bar'];
  const knownSet = new Set();
  for (const sel of KNOWN) { try { for (const el of document.querySelectorAll(sel)) knownSet.add(el); } catch { /* bad selector */ } }
  const clickables = (root) => all.filter((el) => contains(root, el) && el !== root && el.matches && el.matches('button, a, [role=button], input[type=button], input[type=submit], [tabindex]') && visible(el) && labelOf(el).length > 0 && labelOf(el).length < 80);
  const classify = (t) => (R.reject.test(t) ? 'reject' : R.settings.test(t) ? 'settings' : R.accept.test(t) ? 'accept' : 'other');

  const candidates = [];
  for (const el of all) {
    if (!el.matches || ['HTML', 'BODY', 'SCRIPT', 'STYLE', 'HEAD'].includes(el.tagName)) continue;
    const known = knownSet.has(el);
    const s = getComputedStyle(el);
    const fixed = s.position === 'fixed' || s.position === 'sticky';
    const dialog = /dialog|alertdialog/.test(el.getAttribute('role') || '') || el.getAttribute('aria-modal') === 'true' || el.tagName === 'DIALOG';
    const named = /cookie|consent|gdpr|cmp|privacy/i.test((el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '') + ' ' + (el.getAttribute('aria-label') || ''));
    if (!known && !fixed && !dialog && !named) continue;
    if (!visible(el)) continue;
    const t = textOf(el);
    if (t.length < 10 || t.length > 5000 || !R.consentText.test(t)) continue;
    const btns = clickables(el);
    if (!btns.length) continue;
    const kinds = btns.map((b) => classify(labelOf(b)));
    const score = (known ? 100 : 0) + (fixed || dialog ? 20 : 0) + (named ? 10 : 0) + kinds.filter((k) => k !== 'other').length * 5;
    candidates.push({ el, score, len: t.length, btns, kinds });
  }
  candidates.sort((a, b) => b.score - a.score || b.len - a.len);
  let banner = null;
  if (candidates.length && candidates[0].kinds.some((k) => k !== 'other')) {
    const c = candidates[0];
    const r = c.el.getBoundingClientRect();
    banner = {
      selector: mark(c.el),
      text: textOf(c.el).slice(0, 400),
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      buttons: c.btns.map((b, i) => {
        const br = b.getBoundingClientRect();
        return { text: labelOf(b).slice(0, 80), kind: c.kinds[i], tag: b.tagName.toLowerCase(), selector: mark(b), area: Math.round(br.width * br.height) };
      }),
    };
  }

  // ---------- 链接 ----------
  const links = [];
  for (const a of all) {
    if (!a.matches || !a.matches('a[href], button, [role=button], [role=link]')) continue;
    const href = a.href ? String(a.href) : '';
    const text = labelOf(a).slice(0, 160);
    if (!text && !href) continue;
    links.push({
      text,
      href,
      onclick: (a.getAttribute('onclick') || '').slice(0, 200),
      inFooter: isFooter(a),
      inBanner: !!(banner && contains(document.querySelector(banner.selector), a)),
      visible: visible(a),
      tag: a.tagName.toLowerCase(),
    });
    if (links.length > 3000) break;
  }

  // ---------- 复选框（供 C-04 设置层对比） ----------
  const checkboxLabel = (el) => {
    const l = (el.labels && el.labels[0] && textOf(el.labels[0])) || el.getAttribute('aria-label') || (el.closest('label') && textOf(el.closest('label')));
    if (l) return norm(l).slice(0, 160);
    const p = el.parentElement && el.parentElement.parentElement;
    return p ? textOf(p).slice(0, 160) : '';
  };
  const checkboxes = [];
  for (const el of all) {
    if (!el.matches || !el.matches('input[type=checkbox], [role=switch], [role=checkbox]')) continue;
    // 自定义开关常把原生 input 隐藏，看其 label 是否可见
    const vis = visible(el) || (el.labels && el.labels[0] && visible(el.labels[0])) || (el.parentElement && visible(el.parentElement));
    if (!vis) continue;
    const checked = el.tagName === 'INPUT' ? el.checked : el.getAttribute('aria-checked') === 'true';
    const disabled = el.disabled || el.getAttribute('aria-disabled') === 'true';
    checkboxes.push({ key: mark(el), label: checkboxLabel(el), checked, disabled });
  }

  // ---------- 表单（F-01 / F-02） ----------
  const forms = [];
  const formRoots = new Set([...document.querySelectorAll('form')]);
  for (const inp of all) {
    if (!inp.matches || !inp.matches('input[type=email], input[type=tel]') || inp.closest('form')) continue;
    let c = inp.parentElement;
    for (let i = 0; c && i < 6 && !c.querySelector('button, input[type=submit]'); i++) c = c.parentElement;
    if (c) formRoots.add(c);
  }
  let fi = 0;
  for (const f of formRoots) {
    if (!visible(f)) continue;
    const fields = [...f.querySelectorAll('input, textarea, select')]
      .filter((i) => !['hidden', 'submit', 'button', 'checkbox', 'radio'].includes(i.type))
      .map((i) => ({ type: i.type || i.tagName.toLowerCase(), name: i.name || i.id || '', label: norm((i.labels && i.labels[0] && textOf(i.labels[0])) || i.placeholder || i.getAttribute('aria-label') || '').slice(0, 80) }));
    const hasPI = fields.some((x) => x.type === 'email' || x.type === 'tel' || R.piField.test(x.name + ' ' + x.label)) && fields.some((x) => x.type === 'email' || x.type === 'tel' || /mail|phone|tel|电话|邮箱|手机/i.test(x.name + ' ' + x.label));
    if (!fields.length) continue;
    // 附近 = 表单内 或 表单父级两层内
    let scope = f;
    for (let i = 0; i < 2; i++) {
      const par = scope.parentElement;
      if (!par || ['BODY', 'HTML', 'MAIN'].includes(par.tagName) || par.querySelectorAll('a[href]').length > 15 || textOf(par).length > 3000) break;
      scope = par;
    }
    const near = [...scope.querySelectorAll('a[href]')].filter((a) => R.privacyText.test(labelOf(a)) || R.privacyHref.test(a.href || ''));
    const cbs = [...f.querySelectorAll('input[type=checkbox]')].map((el) => {
      const label = checkboxLabel(el);
      return { label, checked: el.checked, name: el.name || '', marketing: R.marketing.test(label + ' ' + (el.name || '')) };
    });
    forms.push({ index: fi++, tag: f.tagName.toLowerCase(), fields, hasPI, privacyLinks: near.map((a) => ({ text: labelOf(a).slice(0, 80), href: a.href })), checkboxes: cbs, text: textOf(f).slice(0, 200) });
  }

  // ---------- C-05 再次打开入口 ----------
  const bannerEl = banner && document.querySelector(banner.selector);
  const reopen = [];
  for (const el of all) {
    if (!el.matches || !el.matches('a, button, [role=button], [onclick]')) continue;
    if (bannerEl && contains(bannerEl, el)) continue;
    const t = labelOf(el);
    const code = (el.getAttribute('onclick') || '') + ' ' + (el.getAttribute('href') || '') + ' ' + (el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '');
    if ((t && t.length < 80 && R.reopenText.test(t)) || R.reopenCode.test(code) || /ot-sdk-show-settings|ot-floating-button|CookiebotWidget|cky-btn-revisit|cmplz-manage-consent|uc-privacy-button|termly-display-preferences/i.test(code)) {
      reopen.push({ text: t.slice(0, 80), code: code.trim().slice(0, 120) });
    }
  }

  const footerEls = all.filter((e) => e.tagName === 'FOOTER' || e.getAttribute('role') === 'contentinfo');
  const alternates = [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => ({ hreflang: l.getAttribute('hreflang'), href: l.href }));
  const bodyText = norm(document.body ? document.body.innerText : '').slice(0, 200000);
  // 链接以外的可见文字：页脚"隐私政策 / Cookie Policy"等链接文字不算 Cookie 告知
  const nonLinkText = [];
  if (document.body) {
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n && nonLinkText.length < 20000; n = tw.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest('a, script, style, noscript, template') || !visible(p)) continue;
      const t = norm(n.nodeValue);
      if (t) nonLinkText.push(t);
    }
  }
  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.getAttribute('lang') || '',
    alternates,
    bodyText,
    footerText: footerEls.map(textOf).join(' \n ').slice(0, 20000),
    footerHtmlLinks: footerEls.flatMap((f) => [...f.querySelectorAll('a[href]')].map((a) => a.href)).slice(0, 500),
    hasConsentText: R.ambientConsent.test(nonLinkText.join(' ')),
    banner,
    bannerCandidates: candidates.length,
    links,
    checkboxes,
    forms,
    reopen,
  };
}
