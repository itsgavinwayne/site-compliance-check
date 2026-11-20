// 已知统计/广告追踪与第三方嵌入清单，用于 C-02（同意前追踪）与 C-08（同意前第三方嵌入）。
// 清单刻意保守：只收录用途明确的域名/Cookie 名，宁可漏判也不误判；漏判的部分由人工复核。
// 新增条目时写清 vendor 和 kind（analytics / ads / embed）。

/** 追踪域名：匹配 host 等于该域名或为其子域名；可选 path 前缀进一步限定 */
export const TRACKER_HOSTS = [
  // Google
  { host: 'google-analytics.com', vendor: 'Google Analytics', kind: 'analytics' },
  { host: 'analytics.google.com', vendor: 'Google Analytics', kind: 'analytics' },
  { host: 'googletagmanager.com', vendor: 'Google Tag Manager', kind: 'analytics' },
  { host: 'doubleclick.net', vendor: 'Google Ads (DoubleClick)', kind: 'ads' },
  { host: 'googleadservices.com', vendor: 'Google Ads', kind: 'ads' },
  { host: 'googlesyndication.com', vendor: 'Google AdSense', kind: 'ads' },
  { host: 'adservice.google.com', vendor: 'Google Ads', kind: 'ads' },
  { host: 'www.google.com', path: '/pagead/', vendor: 'Google Ads', kind: 'ads' },
  { host: 'www.google.com', path: '/ads/', vendor: 'Google Ads', kind: 'ads' },
  // Meta
  { host: 'connect.facebook.net', vendor: 'Meta Pixel', kind: 'ads' },
  { host: 'www.facebook.com', path: '/tr', vendor: 'Meta Pixel', kind: 'ads' },
  // Microsoft
  { host: 'clarity.ms', vendor: 'Microsoft Clarity', kind: 'analytics' },
  { host: 'bat.bing.com', vendor: 'Microsoft Ads (UET)', kind: 'ads' },
  // LinkedIn / X / TikTok / Pinterest / Snap / Reddit
  { host: 'snap.licdn.com', vendor: 'LinkedIn Insight', kind: 'ads' },
  { host: 'px.ads.linkedin.com', vendor: 'LinkedIn Insight', kind: 'ads' },
  { host: 'ads-twitter.com', vendor: 'X (Twitter) Ads', kind: 'ads' },
  { host: 'analytics.twitter.com', vendor: 'X (Twitter) Ads', kind: 'ads' },
  { host: 'analytics.tiktok.com', vendor: 'TikTok Pixel', kind: 'ads' },
  { host: 'ct.pinterest.com', vendor: 'Pinterest Tag', kind: 'ads' },
  { host: 'sc-static.net', vendor: 'Snap Pixel', kind: 'ads' },
  { host: 'tr.snapchat.com', vendor: 'Snap Pixel', kind: 'ads' },
  { host: 'redditstatic.com', path: '/ads', vendor: 'Reddit Pixel', kind: 'ads' },
  { host: 'alb.reddit.com', vendor: 'Reddit Pixel', kind: 'ads' },
  // 行为分析 / 产品分析
  { host: 'hotjar.com', vendor: 'Hotjar', kind: 'analytics' },
  { host: 'hotjar.io', vendor: 'Hotjar', kind: 'analytics' },
  { host: 'mouseflow.com', vendor: 'Mouseflow', kind: 'analytics' },
  { host: 'fullstory.com', vendor: 'FullStory', kind: 'analytics' },
  { host: 'crazyegg.com', vendor: 'Crazy Egg', kind: 'analytics' },
  { host: 'cdn.segment.com', vendor: 'Segment', kind: 'analytics' },
  { host: 'api.segment.io', vendor: 'Segment', kind: 'analytics' },
  { host: 'mixpanel.com', vendor: 'Mixpanel', kind: 'analytics' },
  { host: 'amplitude.com', vendor: 'Amplitude', kind: 'analytics' },
  { host: 'heapanalytics.com', vendor: 'Heap', kind: 'analytics' },
  { host: 'mc.yandex.ru', vendor: 'Yandex Metrica', kind: 'analytics' },
  { host: 'mc.yandex.com', vendor: 'Yandex Metrica', kind: 'analytics' },
  { host: 'quantserve.com', vendor: 'Quantcast', kind: 'ads' },
  { host: 'scorecardresearch.com', vendor: 'Comscore', kind: 'analytics' },
  { host: 'matomo.cloud', vendor: 'Matomo Cloud', kind: 'analytics' },
  { host: 'hs-analytics.net', vendor: 'HubSpot Analytics', kind: 'analytics' },
  { host: 'hs-scripts.com', vendor: 'HubSpot', kind: 'analytics' },
  // 广告网络
  { host: 'criteo.com', vendor: 'Criteo', kind: 'ads' },
  { host: 'criteo.net', vendor: 'Criteo', kind: 'ads' },
  { host: 'taboola.com', vendor: 'Taboola', kind: 'ads' },
  { host: 'outbrain.com', vendor: 'Outbrain', kind: 'ads' },
  { host: 'adnxs.com', vendor: 'Xandr', kind: 'ads' },
  { host: 'amazon-adsystem.com', vendor: 'Amazon Ads', kind: 'ads' },
  // 中国常见
  { host: 'hm.baidu.com', vendor: '百度统计', kind: 'analytics' },
  { host: 'cnzz.com', vendor: 'CNZZ/友盟', kind: 'analytics' },
  { host: 'umeng.com', vendor: '友盟', kind: 'analytics' },
  { host: 'zz.bdstatic.com', vendor: '百度推送', kind: 'analytics' },
  { host: 'tajs.qq.com', vendor: '腾讯分析', kind: 'analytics' },
];

/** 第三方嵌入：同意前加载即向第三方传输访客 IP（C-08） */
export const EMBED_HOSTS = [
  { host: 'youtube.com', vendor: 'YouTube', kind: 'embed' },
  { host: 'youtube-nocookie.com', vendor: 'YouTube (nocookie)', kind: 'embed' },
  { host: 'ytimg.com', vendor: 'YouTube', kind: 'embed' },
  { host: 'googlevideo.com', vendor: 'YouTube', kind: 'embed' },
  { host: 'maps.googleapis.com', vendor: 'Google Maps', kind: 'embed' },
  { host: 'maps.gstatic.com', vendor: 'Google Maps', kind: 'embed' },
  { host: 'www.google.com', path: '/maps', vendor: 'Google Maps', kind: 'embed' },
  { host: 'maps.google.com', vendor: 'Google Maps', kind: 'embed' },
  { host: 'fonts.googleapis.com', vendor: 'Google Fonts', kind: 'embed' },
  { host: 'fonts.gstatic.com', vendor: 'Google Fonts', kind: 'embed' },
  { host: 'use.typekit.net', vendor: 'Adobe Fonts', kind: 'embed' },
  { host: 'player.vimeo.com', vendor: 'Vimeo', kind: 'embed' },
  { host: 'vimeocdn.com', vendor: 'Vimeo', kind: 'embed' },
  { host: 'platform.twitter.com', vendor: 'X (Twitter) embed', kind: 'embed' },
  { host: 'www.instagram.com', path: '/embed', vendor: 'Instagram embed', kind: 'embed' },
  { host: 'www.facebook.com', path: '/plugins', vendor: 'Facebook plugin', kind: 'embed' },
  { host: 'www.google.com', path: '/recaptcha', vendor: 'Google reCAPTCHA', kind: 'embed' },
  { host: 'www.gstatic.com', path: '/recaptcha', vendor: 'Google reCAPTCHA', kind: 'embed' },
  { host: 'open.spotify.com', path: '/embed', vendor: 'Spotify embed', kind: 'embed' },
  { host: 'disqus.com', vendor: 'Disqus', kind: 'embed' },
  { host: 'api.map.baidu.com', vendor: '百度地图', kind: 'embed' },
  { host: 'map.qq.com', vendor: '腾讯地图', kind: 'embed' },
  { host: 'webapi.amap.com', vendor: '高德地图', kind: 'embed' },
];

/** 追踪类 Cookie 名（精确名或前缀/正则） */
export const TRACKER_COOKIES = [
  { re: /^_ga($|_)/, vendor: 'Google Analytics', kind: 'analytics' },
  { re: /^_gid$/, vendor: 'Google Analytics', kind: 'analytics' },
  { re: /^_gat/, vendor: 'Google Analytics', kind: 'analytics' },
  { re: /^_gcl_/, vendor: 'Google Ads', kind: 'ads' },
  { re: /^(IDE|test_cookie|DSID)$/, vendor: 'Google Ads (DoubleClick)', kind: 'ads' },
  { re: /^_fbp$|^_fbc$/, vendor: 'Meta Pixel', kind: 'ads' },
  { re: /^_hj/, vendor: 'Hotjar', kind: 'analytics' },
  { re: /^_clck$|^_clsk$/, vendor: 'Microsoft Clarity', kind: 'analytics' },
  { re: /^_uet(sid|vid)$/, vendor: 'Microsoft Ads (UET)', kind: 'ads' },
  { re: /^li_sugr$|^_li_ss|^bcookie$|^lidc$/, vendor: 'LinkedIn', kind: 'ads' },
  { re: /^_ttp$|^_tt_enable_cookie$/, vendor: 'TikTok Pixel', kind: 'ads' },
  { re: /^_pin_unauth$|^_pinterest_ct/, vendor: 'Pinterest Tag', kind: 'ads' },
  { re: /^_scid/, vendor: 'Snap Pixel', kind: 'ads' },
  { re: /^_rdt_uuid$/, vendor: 'Reddit Pixel', kind: 'ads' },
  { re: /^ajs_(anonymous|user)_id$/, vendor: 'Segment', kind: 'analytics' },
  { re: /^mp_.*_mixpanel$/, vendor: 'Mixpanel', kind: 'analytics' },
  { re: /^AMP_|^amp_/, vendor: 'Amplitude', kind: 'analytics' },
  { re: /^_ym_/, vendor: 'Yandex Metrica', kind: 'analytics' },
  { re: /^hubspotutk$|^__hs(tc|sc)$/, vendor: 'HubSpot', kind: 'analytics' },
  { re: /^_pk_(id|ses)/, vendor: 'Matomo', kind: 'analytics' },
  { re: /^Hm_(lvt|lpvt)_/, vendor: '百度统计', kind: 'analytics' },
  { re: /^CNZZDATA|^UM_distinctid$/, vendor: 'CNZZ/友盟', kind: 'analytics' },
];

function hostMatches(host, entryHost) {
  return host === entryHost || host.endsWith('.' + entryHost);
}

function matchList(list, url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.toLowerCase();
  for (const e of list) {
    if (!hostMatches(host, e.host)) continue;
    if (e.path && !u.pathname.startsWith(e.path)) continue;
    return { vendor: e.vendor, kind: e.kind, host };
  }
  return null;
}

/** 请求 URL 是否命中追踪域名 */
export const classifyTracker = (url) => matchList(TRACKER_HOSTS, url);
/** 请求 URL 是否命中第三方嵌入域名 */
export const classifyEmbed = (url) => matchList(EMBED_HOSTS, url);

/** Cookie 名是否为已知追踪 Cookie */
export function classifyCookie(name) {
  for (const e of TRACKER_COOKIES) if (e.re.test(name)) return { vendor: e.vendor, kind: e.kind };
  return null;
}

/** 汇总某状态下的追踪信号：命中的请求与 Cookie */
export function trackerSignals(state) {
  const requests = [];
  const seen = new Set();
  for (const r of state.requests || []) {
    const m = classifyTracker(r.url);
    if (m && !seen.has(m.host)) { seen.add(m.host); requests.push({ ...m, url: r.url }); }
  }
  const cookies = [];
  for (const c of state.cookies || []) {
    const m = classifyCookie(c.name);
    if (m) cookies.push({ ...m, name: c.name, domain: c.domain });
  }
  return { requests, cookies, any: requests.length + cookies.length > 0 };
}

export function embedSignals(state) {
  const out = [];
  const seen = new Set();
  for (const r of state.requests || []) {
    const m = classifyEmbed(r.url);
    if (m && !seen.has(m.vendor + m.host)) { seen.add(m.vendor + m.host); out.push({ ...m, url: r.url }); }
  }
  return out;
}

/** 粗略的可注册域名（eTLD+1），用于区分第一方/第三方 */
const TWO_LEVEL = /\.(co|com|net|org|gov|edu|ac|or|ne)\.[a-z]{2}$/;
export function siteOf(host) {
  host = String(host || '').toLowerCase();
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host === 'localhost') return host;
  const parts = host.split('.');
  return parts.slice(TWO_LEVEL.test(host) ? -3 : -2).join('.');
}

/** 列出所有第三方请求域名（辅助人工核对 P-03 / P-06） */
export function thirdPartyHosts(requests, firstPartyUrl) {
  let first;
  try { first = siteOf(new URL(firstPartyUrl).hostname); } catch { return []; }
  const hosts = new Set();
  for (const r of requests || []) {
    try {
      const u = new URL(r.url);
      if (!/^https?:$/.test(u.protocol)) continue;
      if (siteOf(u.hostname) !== first) hosts.add(u.hostname);
    } catch { /* ignore */ }
  }
  return [...hosts].sort();
}

/** 常见 CMP（同意管理平台）脚本域名：出现即说明站点装了同意工具（C-01 判定辅助） */
export const CMP_HOSTS = [
  'cookielaw.org', 'onetrust.com', 'cookiebot.com', 'cookiebot.eu', 'usercentrics.eu', 'usercentrics.com',
  'consensu.org', 'didomi.io', 'iubenda.com', 'termly.io', 'cookieyes.com', 'trustarc.com', 'truste.com',
  'privacy-mgmt.com', 'cookie-script.com', 'osano.com', 'consentmanager.net', 'cookiefirst.com',
  'cookiehub.net', 'complianz.io', 'axept.io', 'sourcepoint.com', 'borlabs.io', 'klaro.org', 'kiprotect.com',
];

export function cmpSignals(requests) {
  const out = new Set();
  for (const r of requests || []) {
    try {
      const h = new URL(r.url).hostname;
      for (const c of CMP_HOSTS) if (h === c || h.endsWith('.' + c)) out.add(h);
    } catch { /* ignore */ }
  }
  return [...out];
}
