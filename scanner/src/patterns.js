// 多语言链接/按钮文字识别：中/英/德/法/西/意/荷/葡（另含少量日文）。
// 所有正则大小写不敏感；文字先做 normalize（小写、合并空白）。

export const normalize = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();

// 关键页面：text = 链接文字/aria-label/title，href = 链接地址
export const KEY_PAGES = {
  privacy: {
    text: /privacy|隐私|隱私|个人信息保护|個人資料|datenschutz|confidentialit[ée]|vie priv[ée]e|donn[ée]es personnelles|privacidad|protecci[óo]n de datos|riservatezza|informativa (sulla )?privacy|privacybeleid|privacyverklaring|privacidade|prote[çc][ãa]o de dados|プライバシー/i,
    href: /privacy|datenschutz|privacidad|privacidade|confidentialite|privacybeleid|privacyverklaring|riservatezza|yinsi|personal-information-protection/i,
  },
  cookie: {
    text: /cookie|クッキー/i,
    href: /cookie/i,
    // 排除"Cookie 设置"类按钮，那是 C-05 的再次打开入口，不是政策页
    exclude: /setting|einstellung|设置|設定|preference|manage|param[eè]tre|configur|instellingen|impostazioni|personaliz|anpassen|choices|ajustes|g[ée]rer|verwalten|beheren|gestisci|gerir/i,
  },
  impressum: {
    text: /impressum|imprint|anbieterkennzeichnung|legal notice|site notice|mentions l[ée]gales|aviso legal|note legali|colofon|informa[çc][õo]es legais/i,
    href: /impressum|imprint|legal-notice|mentions-legales|aviso-legal|note-legali|colofon/i,
  },
  terms: {
    text: /terms|conditions of use|legal|\bagb\b|nutzungsbedingungen|gesch[äa]ftsbedingungen|条款|條款|用户协议|用戶協議|服务协议|服務協議|法律声明|法律聲明|使用协议|免责声明|conditions g[ée]n[ée]rales|\bcgu\b|\bcgv\b|t[ée]rminos|condiciones|termini|condizioni|voorwaarden|termos|利用規約/i,
    href: /terms|tos\b|legal|agb|conditions|nutzungsbedingungen|terminos|condiciones|termini|condizioni|voorwaarden|termos|tiaokuan|xieyi|agreement/i,
  },
  accessibility: {
    text: /accessibilit|barrierefrei|无障碍|無障礙|accessibilit[ée]|accesibilidad|accessibilit[àa]|toegankelijkheid|acessibilidade|アクセシビリティ/i,
    href: /accessibility|barrierefreiheit|accessibilite|accesibilidad|accessibilita|toegankelijkheid|acessibilidade|wuzhangai/i,
  },
  contact: {
    text: /^(contact( us)?|kontakt|联系我们|聯絡我們|联系|contacto|contatti|contato|contactez-nous|nous contacter)$/i,
    href: /contact|kontakt|contacto|contatti|contato|lianxi/i,
  },
};

// C-09 "Do Not Sell or Share"
export const DO_NOT_SELL = /do not sell|do not share|don'?t sell|your (california )?privacy choices|opt[- ]out of (the )?(sale|sharing)|limit the use of my sensitive/i;

// C-05 再次打开同意设置的入口
export const CONSENT_REOPEN_TEXT = /cookie[- ]?(settings|preferences|einstellungen|设置|設定|instellingen|impostazioni|param[eè]tres|configuraci[óo]n|prefer[eê]ncias)|manage (cookies|consent|cookie)|cookie choices|consent (settings|preferences)|privacy (settings|preferences|choices)|datenschutz-?einstellungen|einwilligung (ändern|widerrufen)|change (your )?consent|g[ée]rer (les )?cookies|gestione (dei )?cookie|cookies? beheren|gestionar cookies|隐私设置|同意设置|管理\s*cookie/i;
export const CONSENT_REOPEN_CODE = /showPreferences|Cookiebot\.(renew|show)|OneTrust\.ToggleInfoDisplay|__cmp\(|UC_UI\.show|klaro\.show|CookieConsent\.(show|showPreferences)|tarteaucitron\.userInterface\.openPanel|cookieyes|revisitCkyConsent|termly|iubenda/i;

// 横幅按钮分类
export const BUTTON = {
  reject: /reject|decline|refuse|deny|disagree|no,? thanks|only (strictly )?(necessary|essential)|(necessary|essential) (cookies )?only|use necessary|continue without|ablehnen|nur (notwendige|erforderliche|essenzielle)|alle ablehnen|拒绝|拒絕|不同意|仅必要|僅必要|仅限必要|refuser|tout refuser|continuer sans accepter|rechazar|rechazar todo|solo necesarias|rifiuta|rifiuto|solo necessari|weigeren|afwijzen|alleen noodzakelijk|rejeitar|recusar|apenas necess[áa]rios|拒否/i,
  accept: /accept|agree|allow( all)?|got it|i understand|^ok(ay)?$|consent|akzeptieren|zustimmen|einverstanden|alle annehmen|erlauben|同意|接受|允许|知道了|accepter|j'accepte|tout accepter|aceptar|acepto|accetta|accetto|accepteren|akkoord|aceitar|concordo|同意する/i,
  settings: /setting|customi[sz]e|manage|preference|options|more (options|choices)|details|einstellung|anpassen|verwalten|设置|設定|自定义|管理|param[eè]tr|personnaliser|g[ée]rer|configur|personaliz|ajustes|gestisci|impostazioni|personalizza|instellingen|aanpassen|beheren|prefer[eê]ncias|gerir|カスタマイズ/i,
};

// 横幅文字启发式
export const CONSENT_TEXT = /cookie|consent|gdpr|tracking|datenschutz|einwilligung|同意|隐私|隱私|confidentialit|consentement|consentimiento|consenso|toestemming|consentimento|traceurs|rastreo|tracciamento/i;

// 横幅识别不到时，用来判断"页面上是否有 Cookie 告知文字"（→ manual 而非 na）。
// 比 CONSENT_TEXT 严格：不含"隐私 / datenschutz / confidentialité"等几乎每个页脚都有的隐私政策链接词，
// 也不含单独的"同意 / consent"（表单同意勾选框常见）；并且只看链接以外的文字（见 extract.js）。
export const AMBIENT_CONSENT_TEXT = /cookie|クッキー|\bgdpr\b|einwilligung|consentement|consentimiento|toestemming|consentimento|traceurs|tracciamento/i;

// F-02 营销/订阅类复选框
export const MARKETING = /newsletter|marketing|promotion|promotional|offers|updates|subscribe|news|mailing|newsletter|werbung|angebote|abonnieren|营销|推广|订阅|訂閱|优惠|推送|offres|actualit[ée]s|ofertas|promociones|suscrib|offerte|promozion|iscriv|aanbiedingen|nieuwsbrief|novidades|promo[çc][õo]es|inscrever/i;

// F-01 个人信息字段
export const PI_FIELD_NAME = /e-?mail|mail|phone|tel|mobile|手机|电话|電話|邮箱|郵箱|telefon|t[ée]l[ée]phone|tel[ée]fono|telefono|telefoon|telefone|name|姓名|名字|address|地址|whatsapp|wechat|微信/i;

// P-08 更新日期
export const UPDATED_DATE = /(last (updated|modified|revised)|updated( on)?|effective (date|as of|from)|revised|stand|zuletzt (aktualisiert|ge[äa]ndert)|g[üu]ltig ab|更新日期|更新时间|更新於|最近更新|最后更新|最後更新|生效日期|修订日期|derni[èe]re mise [àa] jour|mis [àa] jour le|en vigueur|[úu]ltima actualizaci[óo]n|actualizad[oa]|ultimo aggiornamento|aggiornat[oa]|laatst bijgewerkt|bijgewerkt op|[úu]ltima atualiza[çc][ãa]o|atualizad[oa])[:：\s]*[^\n]{0,40}?(\d{4}[-./年]\s?\d{1,2}([-./月]\s?\d{1,2}日?)?|\d{1,2}[-./]\s?\d{1,2}[-./]\s?\d{2,4}|\d{1,2}\.?\s+[a-zäéû]+\.?\s+\d{4}|[a-z]+\.?\s+\d{1,2},?\s+\d{4}|[a-zäéû]+\s+\d{4})/i;

// I-01 / I-02 公示信息信号
export const DISCLOSURE = {
  company: /\b[\p{Lu}][\p{L}0-9&.,' -]{1,60}?\s(GmbH|AG|UG|KG|OHG|e\.K\.|SE|Ltd\.?|Limited|LLP|PLC|plc|Inc\.?|LLC|Corp\.?|S\.?A\.?S?|SARL|S\.?r\.?l\.?|S\.?L\.?|B\.?V\.?|N\.?V\.?|Lda\.?|S\.?p\.?A\.?|Oy|AB|ApS|A\/S)\b|[一-龥]{2,30}(有限公司|股份有限公司|有限责任公司)/u,
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  // 街道+门牌号 / 行首或逗号后的"邮编 城市"（排除年份）/ 英国邮编 / 中文地址
  address: /[\p{L}-]*(stra[ßs]e|str\.|weg|platz|gasse|allee|damm)\s*\d+|\d+[a-z]?,?\s+[\p{L}' ]{2,30}\s([Ss]treet|[Rr]oad|[Aa]venue|[Ll]ane|[Dd]rive|[Ss]quare)\b|\b([Rr]ue|[Cc]alle|[Aa]venida|[Vv]ia|[Vv]iale|[Rr]ua|[Ss]traat|[Ll]aan)\s+[\p{L}' ]{2,30}\s?\d+|(^|[,·|]\s*)(?!(19|20)\d{2}\b)\d{4,5}\s[\p{Lu}][\p{Ll}]+|\b[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}\b|[一-龥]{2,}(省|市)[一-龥]{1,20}(区|县|路|街)[一-龥\d]{0,20}号?|\b([Rr]oom|[Ss]uite|[Uu]nit|[Ff]loor|[Ff]lat|[Bb]lock|[Bb]uilding)\s+[A-Z]?\d+[A-Z]?\b[^\n]{0,80}?,\s*[\p{Lu}][\p{L}' -]{2,40}/mu,
  registration: /(handelsregister|registergericht|amtsgericht|\bHR[AB]\s?\d+|company (no\.?|number|registration)|registered in england|companies house|registration (no\.?|number)|\bRCS\b|\bSIRE[NT]\b|\bKvK\b|registro (mercantil|delle imprese)|\bCIF\b|\bNIF\b|统一社会信用代码|registered number|reg\.? no)/i,
  vat: /(USt-?IdNr|Umsatzsteuer-?Identifikationsnummer|\bVAT\b|TVA|\bIVA\b|\bBTW\b|P\.?\s?IVA|\b(DE|AT|FR|NL|IT|ES|BE|IE|GB)\s?[0-9A-Z]{8,12}\b)/,
  registeredAddress: /registered (office|address)|eingetragener sitz|sitz der gesellschaft|siège social|注册地址/i,
};

// 中国备案
export const ICP = /[一-龥]ICP[备證证]\s*\d{6,}\s*号(\s*-\s*\d+)?|[一-龥]ICP[备證证]\s*\d{6,}/;
export const GONGAN = /[一-龥]公网安备\s*\d{10,}\s*号?/;

// F-01 / F-02 额外抓取的"可能有表单"的同站页面（联系页之外）：合作申请、询价、试用、订阅等
export const FORM_PAGE = {
  text: /\b(partners?|partner programme|reseller|distributor|quote|quotation|inquiry|enquiry|inquire|enquire|request|demo|trial|apply|application|sign ?up|register|subscribe|newsletter|oem|odm|anfrage|angebot|registrieren|devis|inscription|presupuesto|solicitud|preventivo|richiesta|offerte|aanvraag|or[çc]amento)\b|询价|咨询|合作|申请|留言|订阅|报价|试用|注册/i,
  href: /(^|[/_.-])(partners?|reseller|distributor|quote|inquiry|enquiry|request|demo|trial|apply|signup|sign-up|register|subscribe|newsletter|oem|odm|oem-odm|anfrage|devis|presupuesto|preventivo|offerte|orcamento)([/_.-]|$)/i,
};
