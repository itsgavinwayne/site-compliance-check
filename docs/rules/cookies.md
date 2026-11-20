# Cookie 与追踪（C-）

在用户终端写入或读取信息（Cookie、localStorage、像素、SDK）之前是否取得了有效同意，以及美国各州的"退出"机制。EU 的核心依据是 ePrivacy 指令第 5(3) 条加 GDPR 的同意标准；UK 是 PECR reg 6（2026-02-05 起经 DUAA 2025 修订，新增统计分析等例外）。

> 本文档由 `rules/registry.yaml` 整理而成，以登记表为准。依据要点为概括，不是法规原文；本工具不构成法律意见。

| 编号 | 缺少什么 | 影响市场 | 级别 | 检查方式 |
|---|---|---|---|---|
| [C-01](#c-01) | 没有 Cookie 同意横幅 | EU UK | 必须 | 自动 |
| [C-02](#c-02) | 用户同意前已加载统计/广告类 Cookie 或脚本 | EU UK | 必须 | 自动 |
| [C-03](#c-03) | 横幅没有拒绝按钮，或拒绝比接受更难操作 | EU UK | 必须 | 自动 |
| [C-04](#c-04) | 同意选项默认勾选，或不能按类别选择 | EU UK | 必须 | 自动 + 人工确认 |
| [C-05](#c-05) | 同意后没有入口修改或撤回同意 | EU UK | 必须 | 自动 + 人工确认 |
| [C-06](#c-06) | 没有 Cookie 政策（名称、提供方、用途、有效期） | EU UK | 必须 | 自动 |
| [C-07](#c-07) | 无法出示用户同意记录 | EU UK | 必须 | 人工 |
| [C-08](#c-08) | 第三方嵌入（YouTube、Google 地图、Google Fonts 等）在同意前加载 | EU UK | 必须 | 自动 |
| [C-09](#c-09) | 没有 "Do Not Sell or Share My Personal Information" 链接 | US | 视情况 | 自动 |
| [C-10](#c-10) | 未响应浏览器 GPC（全局隐私控制）信号 | US | 视情况 | 自动 + 人工确认 |
| [C-11](#c-11) | 未公示通过标签、SDK 向第三方发送的用户信息（日本外部送信规律） | JP | 视情况 | 人工 |

## C-01

**缺少什么**：没有 Cookie 同意横幅

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动

**依据要点**：

- ePrivacy 指令 2002/58/EC（2009/136/EC 修订），第 5(3) 条
- 德国 TDDDG（原 TTDSG），§25
- 英国 PECR（经 Data (Use and Access) Act 2025 第 112 条替换），reg 6；附表 A1（例外）
- ICO 存储与访问技术指南，How do we manage consent in practice?

**说明**：UK：DUAA 2025 自 2026-02-05 起新增例外（统计分析、网站外观/功能），条件是清楚告知并提供简单免费的反对方式（附表 A1，https://www.legislation.gov.uk/ukpga/2025/18/schedule/12）。只用这类例外技术的 UK 网站可以不弹同意横幅，但仍须告知并提供反对方式；广告类追踪仍须事先同意。EU 的 Digital Omnibus 修改 Cookie 规则的提案截至 2026-10 尚未通过，ePrivacy 第 5(3) 条照常适用。

**判定方法**：用无痕窗口首次打开网站：使用非必要 Cookie/追踪技术的，首屏应出现可操作的同意界面（接受、拒绝、设置）。网站确实只用严格必要的 Cookie，可以不弹横幅，此时判"不适用"。只有一行"继续浏览即同意"的提示条，判不通过。

**出处**：

- [ePrivacy 指令 2002/58/EC（2009/136/EC 修订） 第 5(3) 条](https://eur-lex.europa.eu/eli/dir/2002/58/2009-12-19/eng)（核实于 2026-11-20）
- [德国 TDDDG（原 TTDSG） §25](https://www.gesetze-im-internet.de/ttdsg/__25.html)（核实于 2026-11-20）
- [英国 PECR（经 Data (Use and Access) Act 2025 第 112 条替换） reg 6；附表 A1](https://www.legislation.gov.uk/ukpga/2025/18/section/112)（核实于 2026-11-20）
- [ICO 存储与访问技术指南 How do we manage consent in practice?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/)（核实于 2026-11-20）

## C-02

**缺少什么**：用户同意前已加载统计/广告类 Cookie 或脚本

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动

**依据要点**：

- 自建统计即使不写 Cookie，只要网站脚本让浏览器把时区、语言、UA 等信息或标识符发回服务器，就属于第 5(3) 条的"获取访问"（EDPB 指南 2/2023 第 32–33、63 段；基于 IP 的追踪见第 54–55 段）。属于该条范围不等于一定要征得同意，还要看能否适用豁免（第 56 段），由人工判定。出处：https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf（核实于 2026-11-20）

- ePrivacy 指令 2002/58/EC，第 5(3) 条
- GDPR，第 6(1) 条；第 7 条
- 英国 PECR reg 6 及附表 A1，reg 6；附表 A1
- ICO 存储与访问技术指南，须事先取得同意；非豁免项默认关闭
- CNIL Cookie 指南与建议（délibérations 2020-091 / 2020-092），同意前不得写入需同意的追踪器

**说明**：UK：DUAA 2025 附表 A1 允许统计分析类技术在满足条件时免于同意（自 2026-02-05 起），条件包括清楚告知、数据只用于改进服务、提供简单免费的反对方式。UK 网站同意前加载统计脚本时，要人工确认是否满足这些条件；广告类不在豁免内。

**判定方法**：无痕窗口打开首页，不点任何按钮，等待加载完成后检查 Cookie、localStorage 和网络请求：出现 _ga、_gid、_fbp、广告/统计域名请求，判不通过；只有会话、负载均衡、安全、同意状态等严格必要项，判通过。

**出处**：

- [ePrivacy 指令 2002/58/EC 第 5(3) 条](https://eur-lex.europa.eu/eli/dir/2002/58/2009-12-19/eng)（核实于 2026-11-20）
- [GDPR 第 6(1) 条；第 7 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [英国 PECR reg 6 及附表 A1 reg 6；附表 A1](https://www.legislation.gov.uk/ukpga/2025/18/schedule/12)（核实于 2026-11-20）
- [ICO 存储与访问技术指南 须事先取得同意；非豁免项默认关闭](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/)（核实于 2026-11-20）
- [CNIL Cookie 指南与建议（délibérations 2020-091 / 2020-092） 同意前不得写入需同意的追踪器](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/lignes-directrices-modificatives-et-recommandation)（核实于 2026-11-20）

## C-03

**缺少什么**：横幅没有拒绝按钮，或拒绝比接受更难操作

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动

**依据要点**：

- GDPR，第 4(11) 条、第 7 条（自由给予的同意）
- EDPB Cookie 横幅工作组报告（2023-01-18），Type A：有接受按钮的层级却没有拒绝选项
- CNIL Cookie 建议，拒绝须与接受同样容易
- ICO 存储与访问技术指南，拒绝须与接受同样容易、同样醒目

**说明**：EDPB 报告是各国监管机构的共同立场，不是有约束力的法律；报告称"绝大多数"机构认为缺少拒绝选项构成违规，并且针对的是"任何有接受按钮的层级"。CNIL 建议在法国属软法，有约束力的是法国《信息与自由法》第 82 条。

**判定方法**：横幅第一层有"接受全部"时，同一层也应有"拒绝全部"（或同等含义），按钮大小、颜色、显眼程度相当，点击次数相同。只能在第二层才能拒绝，或拒绝只是一个灰色小字链接，判不通过。

**出处**：

- [GDPR 第 4(11) 条、第 7 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [EDPB Cookie 横幅工作组报告（2023-01-18） Type A：有接受按钮的层级却没有拒绝选项](https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf)（核实于 2026-11-20）
- [CNIL Cookie 建议 拒绝须与接受同样容易](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/lignes-directrices-modificatives-et-recommandation)（核实于 2026-11-20）
- [ICO 存储与访问技术指南 拒绝须与接受同样容易、同样醒目](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/)（核实于 2026-11-20）

## C-04

**缺少什么**：同意选项默认勾选，或不能按类别选择

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动 + 人工确认

**依据要点**：

- GDPR，第 4(11) 条；鉴于条款第 32 条（预勾选不构成同意；多个目的须分别同意）
- 欧盟法院 C-673/17 Planet49 案（2019-10-01），判决主文：预勾选复选框不构成有效同意
- EDPB Cookie 横幅工作组报告，Type B：预勾选框
- ICO 存储与访问技术指南，非豁免项须默认关闭

**说明**："按类别选择"的依据是同意须具体（GDPR 第 4(11) 条），且鉴于条款第 32 条要求处理有多个目的时逐一取得同意。

**判定方法**：打开横幅的"设置/偏好"层：除"严格必要"外，统计、营销等类别都应默认关闭，且可以分别开关。有类别默认打开，或只有"全部接受/全部拒绝"、没有分类选项，判不通过。

**出处**：

- [GDPR 第 4(11) 条；鉴于条款第 32 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [欧盟法院 C-673/17 Planet49 案（2019-10-01） 判决主文：预勾选复选框不构成有效同意](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62017CJ0673)（核实于 2026-11-20）
- [EDPB Cookie 横幅工作组报告 Type B：预勾选框](https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf)（核实于 2026-11-20）
- [ICO 存储与访问技术指南 非豁免项须默认关闭](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/)（核实于 2026-11-20）

## C-05

**缺少什么**：同意后没有入口修改或撤回同意

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动 + 人工确认

**依据要点**：

- GDPR，第 7(3) 条（撤回须与给予同样容易）
- UK GDPR，第 7 条
- EDPB Cookie 横幅工作组报告，Type K：撤回须随时可及
- CNIL Cookie 建议，同意可随时撤回，入口随时可及

**判定方法**：接受 Cookie 后，在任意页面（通常是页脚链接或悬浮图标）能重新打开 Cookie 设置并改为拒绝；改完后追踪请求随即停止。只能通过清浏览器缓存撤回，或入口藏在隐私政策正文里，判不通过。

**出处**：

- [GDPR 第 7(3) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [UK GDPR 第 7 条](https://www.legislation.gov.uk/eur/2016/679/article/7)（核实于 2026-11-20）
- [EDPB Cookie 横幅工作组报告 Type K：撤回须随时可及](https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf)（核实于 2026-11-20）
- [CNIL Cookie 建议 同意可随时撤回，入口随时可及](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/lignes-directrices-modificatives-et-recommandation)（核实于 2026-11-20）

## C-06

**缺少什么**：没有 Cookie 政策（名称、提供方、用途、有效期）

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动

**依据要点**：

- ePrivacy 指令 2002/58/EC，第 5(3) 条（须提供清晰全面的信息）
- 欧盟法院 C-673/17 Planet49 案，判决主文：须告知 Cookie 有效期及第三方能否访问
- 英国 PECR reg 6，reg 6（须提供清晰全面的信息）

**说明**：扫描器只能判断链接是否存在；内容是否完整、是否与实际相符需人工核对。

**判定方法**：能找到 Cookie 政策（独立页面或隐私政策中的专门章节），按 Cookie 或类别列出：名称、提供方（自有/第三方）、用途、有效期。缺有效期或缺第三方信息，或列表与实际写入的 Cookie 明显不符，判不通过。

**出处**：

- [ePrivacy 指令 2002/58/EC 第 5(3) 条](https://eur-lex.europa.eu/eli/dir/2002/58/2009-12-19/eng)（核实于 2026-11-20）
- [欧盟法院 C-673/17 Planet49 案 判决主文：须告知 Cookie 有效期及第三方能否访问](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62017CJ0673)（核实于 2026-11-20）
- [英国 PECR reg 6 reg 6](https://www.legislation.gov.uk/ukpga/2025/18/section/112)（核实于 2026-11-20）

## C-07

**缺少什么**：无法出示用户同意记录

**影响市场**：EU UK　**级别**：必须　**检查方式**：人工

**依据要点**：

- GDPR，第 7(1) 条（须能证明已取得同意）；第 5(2) 条
- ICO 同意指南，How should we obtain, record and manage consent?

**判定方法**：请运营方导出若干条同意记录，每条应能看出：谁（匿名 ID 即可）、何时、当时看到的横幅版本/文案、同意了哪些类别、之后是否撤回。拿不出记录，或记录只有"已同意"没有时间和版本，判不通过。

**出处**：

- [GDPR 第 7(1) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [ICO 同意指南 How should we obtain, record and manage consent?](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/how-should-we-obtain-record-and-manage-consent/)（核实于 2026-11-20）

## C-08

**缺少什么**：第三方嵌入（YouTube、Google 地图、Google Fonts 等）在同意前加载

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动

**依据要点**：

- ePrivacy 指令 2002/58/EC，第 5(3) 条
- GDPR，第 6(1) 条
- 慕尼黑地区法院 LG München I，2022-01-20 判决，3 O 17493/20（Google Fonts），动态加载 Google Fonts 传输访客 IP，不能以正当利益为由
- ICO 存储与访问技术指南，社交插件、嵌入视频等使用非豁免技术时须取得同意

**说明**：LG München 判决是单个地区法院的判决，不是有约束力的先例，但德国以此为由的警告函很多。UK 部分以 ICO 指南为依据，适用于会写入/读取非豁免 Cookie 的嵌入（如 YouTube、地图）；纯字体请求在 UK 是否构成违规未见判例。

**判定方法**：无痕窗口打开页面不点同意，检查是否已有请求发往 youtube.com、google.com/maps、fonts.googleapis.com、fonts.gstatic.com 等第三方。有则判不通过。改用 youtube-nocookie、点击后再加载（两步加载）、或把字体放在自己服务器上的，判通过。

**出处**：

- [ePrivacy 指令 2002/58/EC 第 5(3) 条](https://eur-lex.europa.eu/eli/dir/2002/58/2009-12-19/eng)（核实于 2026-11-20）
- [GDPR 第 6(1) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [慕尼黑地区法院 LG München I，2022-01-20 判决，3 O 17493/20（Google Fonts） 动态加载 Google Fonts 传输访客 IP，不能以正当利益为由](https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612)（核实于 2026-11-20）
- [ICO 存储与访问技术指南 社交插件、嵌入视频等使用非豁免技术时须取得同意](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/how-do-we-manage-consent-in-practice/)（核实于 2026-11-20）

## C-09

**缺少什么**：没有 "Do Not Sell or Share My Personal Information" 链接

**影响市场**：US　**级别**：视情况　**检查方式**：自动

**适用条件**：达到加州等州隐私法的营收或数据量门槛

**依据要点**：

- 加州 CCPA，§1798.120(a)；§1798.135(a)(1)–(3)
- CCPA 实施条例，11 CCR §7013
- CPPA 门槛调整公告，2025-01-01 起年收入门槛 26,625,000 美元

**说明**：§1798.135(b) 允许企业改为完全依靠退出偏好信号（GPC）处理退出请求而不放链接，此时本条可判"不适用"，但须通过 C-10。门槛每逢奇数年按 CPI 调整，2027-01-01 可能再调。

**判定方法**：先确认是否适用：企业达到 CCPA 门槛（年收入超过门槛、每年买卖/共享 10 万以上消费者或家庭的数据、或一半以上收入来自出售/共享数据之一），且出售或"共享"（跨情境行为广告）个人信息。适用时，首页应有"Do Not Sell or Share My Personal Information"链接（或 §1798.135(a)(3) 允许的合并链接），点开能直接提交退出请求，即通过。

**出处**：

- [加州 CCPA §1798.120(a)；§1798.135(a)(1)–(3)](https://cppa.ca.gov/pdf/20260101_ccpa_statute.pdf)（核实于 2026-11-20）
- [CCPA 实施条例 11 CCR §7013](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf)（核实于 2026-11-20）
- [CPPA 门槛调整公告 2025-01-01 起年收入门槛 26,625,000 美元](https://cppa.ca.gov/regulations/cpi_adjustment.html)（核实于 2026-11-20）

## C-10

**缺少什么**：未响应浏览器 GPC（全局隐私控制）信号

**影响市场**：US　**级别**：视情况　**检查方式**：自动 + 人工确认

**适用条件**：达到加州、科罗拉多等州隐私法门槛

**依据要点**：

- CCPA 实施条例，11 CCR §7025(b)（出售/共享的企业须把退出偏好信号当作有效退出请求）
- 加州 CCPA，§1798.135(b)、(e)
- 科罗拉多州总检察长：通用退出机制（4 CCR 904-3 Rule 5），GPC 是目前唯一认可的通用退出机制，2024-07-01 起须接受

**说明**：CPPA 正在就退出偏好信号做初步规则制定（2026 年意见期已结束），§7025 可能修改，需定期复核。

**判定方法**：带 Sec-GPC: 1 请求头并设置 navigator.globalPrivacyControl = true 访问网站，对比不带信号时：广告/跨站追踪请求应停止或明显减少，且网站可显示"已识别您的退出偏好"等提示。追踪请求不变，判不通过。

**出处**：

- [CCPA 实施条例 11 CCR §7025(b)](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf)（核实于 2026-11-20）
- [加州 CCPA §1798.135(b)、(e)](https://cppa.ca.gov/pdf/20260101_ccpa_statute.pdf)（核实于 2026-11-20）
- [科罗拉多州总检察长：通用退出机制（4 CCR 904-3 Rule 5） GPC 是目前唯一认可的通用退出机制，2024-07-01 起须接受](https://coag.gov/uoom/)（核实于 2026-11-20）

## C-11

**缺少什么**：未公示通过标签、SDK 向第三方发送的用户信息（日本外部送信规律）

**影响市场**：JP　**级别**：视情况　**检查方式**：人工

**适用条件**：属于日本電気通信事業法外部送信規律的适用范围（如通过网站提供 SNS、搜索、新闻/策展类网络媒体等服务）

**依据要点**：

- 日本電気通信事業法，第 27 条之 12
- 総務省「外部送信規律」说明页，适用范围与公示事项（2023-06-16 施行）

**说明**：新增条目（S1），check 设为 manual。法条允许"事先通知"或"使用户易于知悉"两种方式；以弹窗等方式事先通知的，也算通过。

**判定方法**：先判断是否在适用范围内（只卖自家商品的网店、普通企业官网、博客不在范围内）。适用时，网站应有日文的公示页面（常见名为"外部送信について"），列出：发送的信息种类、接收方名称、利用目的；用户易于到达（如页脚链接）。没有公示页，或公示内容与网站实际加载的第三方标签不符，判不通过。

**出处**：

- [日本電気通信事業法 第 27 条之 12](https://laws.e-gov.go.jp/api/1/lawdata/359AC0000000086)（核实于 2026-11-20）
- [総務省「外部送信規律」说明页 适用范围与公示事项](https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/gaibusoushin_kiritsu.html)（核实于 2026-11-20）
