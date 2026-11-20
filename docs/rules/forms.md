# 表单与营销（F-）

收集个人信息的表单在收集时是否告知、营销同意是否自愿且不捆绑、营销邮件能否退订、敏感信息和儿童信息是否单独取得同意。

> 本文档由 `rules/registry.yaml` 整理而成，以登记表为准。依据要点为概括，不是法规原文；本工具不构成法律意见。

| 编号 | 缺少什么 | 影响市场 | 级别 | 检查方式 |
|---|---|---|---|---|
| [F-01](#f-01) | 收集个人信息的表单旁没有隐私政策链接 | GLOBAL | 必须 | 自动 |
| [F-02](#f-02) | 营销订阅默认勾选，或与提交捆绑 | EU UK | 必须 | 自动 |
| [F-03](#f-03) | 营销邮件没有退订方式 | GLOBAL | 必须 | 人工 |
| [F-04](#f-04) | 收集敏感个人信息未单独取得同意 | CN EU UK | 必须 | 人工 |
| [F-05](#f-05) | 收集儿童个人信息未取得监护人同意，或没有专门的儿童隐私规则 | US EU UK CN KR | 视情况 | 人工 |

## F-01

**缺少什么**：收集个人信息的表单旁没有隐私政策链接

**影响市场**：GLOBAL　**级别**：必须　**检查方式**：自动

**依据要点**：

- GDPR，第 13(1) 条（在收集时告知）；第 12(1) 条
- 《个人信息保护法》，第 17 条（处理前告知）
- 加州 CCPA / 实施条例，§1798.100(a)；11 CCR §7012（收集时或之前告知）

**说明**：GLOBAL 依据是"收集时告知"原则；CCPA 的收集时告知只约束达到门槛的企业。

**判定方法**：所有收集姓名、邮箱、电话等的表单（联系、询价、订阅、注册），在提交按钮附近应有指向隐私政策的链接或简短告知。链接可点开，即通过；表单附近什么都没有，判不通过。

**出处**：

- [GDPR 第 13(1) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [《个人信息保护法》 第 17 条](https://www.miit.gov.cn/zwgk/zcwj/flfg/art/2022/art_04a0f1fb5df244e39688fd5372623a8d.html)（核实于 2026-11-20）
- [加州 CCPA / 实施条例 §1798.100(a)；11 CCR §7012](https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf)（核实于 2026-11-20）

## F-02

**缺少什么**：营销订阅默认勾选，或与提交捆绑

**影响市场**：EU UK　**级别**：必须　**检查方式**：自动

**依据要点**：

- GDPR，鉴于条款第 32 条；第 7(2)、7(4) 条
- ePrivacy 指令 2002/58/EC，第 13(1)、13(2) 条
- 英国 PECR，reg 22

**说明**："软性同意"例外：已在销售或洽谈中取得客户邮箱、推广自家同类产品，并在收集时和每封邮件中提供退订，可不经事先同意（ePrivacy 第 13(2) 条、PECR reg 22）。UK 自 2026-02-05 起对慈善机构也有类似例外。

**判定方法**：表单中的"接收营销邮件/订阅资讯"复选框应默认不勾选、可选填；不勾选也能提交表单（如询价、下单）。默认已勾选，或只有勾选营销才能提交，或用一句"提交即同意接收营销信息"代替复选框，判不通过。

**出处**：

- [GDPR 鉴于条款第 32 条；第 7(2)、7(4) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [ePrivacy 指令 2002/58/EC 第 13(1)、13(2) 条](https://eur-lex.europa.eu/eli/dir/2002/58/2009-12-19/eng)（核实于 2026-11-20）
- [英国 PECR reg 22](https://www.legislation.gov.uk/uksi/2003/2426/regulation/22)（核实于 2026-11-20）

## F-03

**缺少什么**：营销邮件没有退订方式

**影响市场**：GLOBAL　**级别**：必须　**检查方式**：人工

**依据要点**：

- 美国 CAN-SPAM Act（15 U.S.C. §7704），§7704(a)(3)–(5)
- FTC《CAN-SPAM Act: A Compliance Guide for Business》，10 个工作日内处理退订
- ePrivacy 指令 2002/58/EC，第 13(2) 条
- GDPR，第 21(2)、21(3) 条
- 英国 PECR，reg 22、reg 23
- 《广告法》，第 43 条

**说明**：扫描器无法收邮件，只能人工测试。《广告法》第 43 条的修正记录只核到 2018 年（npc.gov.cn 无法访问），现行文本待复核。

**判定方法**：订阅一次后收一封营销邮件：邮件里应有可用的退订链接或回复退订方式，点击后不要求登录、不收费即可完成；US 还须有发件人的有效实体邮寄地址。之后不再收到营销邮件（US 为 10 个工作日内）即通过。

**出处**：

- [美国 CAN-SPAM Act（15 U.S.C. §7704） §7704(a)(3)–(5)](https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap103-sec7704.htm)（核实于 2026-11-20）
- [FTC《CAN-SPAM Act: A Compliance Guide for Business》 10 个工作日内处理退订](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)（核实于 2026-11-20）
- [ePrivacy 指令 2002/58/EC 第 13(2) 条](https://eur-lex.europa.eu/eli/dir/2002/58/2009-12-19/eng)（核实于 2026-11-20）
- [GDPR 第 21(2)、21(3) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [英国 PECR reg 22、reg 23](https://www.legislation.gov.uk/uksi/2003/2426/regulation/23)（核实于 2026-11-20）
- [《广告法》 第 43 条](https://www.gov.cn/guoqing/2021-10/29/content_5647620.htm)（核实于 2026-11-20）

## F-04

**缺少什么**：收集敏感个人信息未单独取得同意

**影响市场**：CN EU UK　**级别**：必须　**检查方式**：人工

**依据要点**：

- 《个人信息保护法》，第 28–30 条
- GDPR，第 9(1)、9(2)(a) 条（特殊类别数据须明确同意或其他例外）
- UK GDPR，第 9(1)、9(2)(a) 条

**说明**：EU/UK 的特殊类别数据也可依据第 9(2) 条其他例外（如履行法定义务）处理，此时不需要同意，人工判定时要看运营方的依据。

**判定方法**：找出收集敏感信息的表单（CN：生物识别、宗教、医疗健康、金融账户、行踪、身份证号、不满 14 岁未成年人信息等；EU/UK：健康、生物识别、种族、宗教、性取向等）。提交前应有单独的同意勾选（不与其他条款合并），并告知必要性和影响（CN 第 30 条）。混在总条款里"一揽子同意"，判不通过。

**出处**：

- [《个人信息保护法》 第 28–30 条](https://www.miit.gov.cn/zwgk/zcwj/flfg/art/2022/art_04a0f1fb5df244e39688fd5372623a8d.html)（核实于 2026-11-20）
- [GDPR 第 9(1)、9(2)(a) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [UK GDPR 第 9(1)、9(2)(a) 条](https://www.legislation.gov.uk/eur/2016/679/article/9)（核实于 2026-11-20）

## F-05

**缺少什么**：收集儿童个人信息未取得监护人同意，或没有专门的儿童隐私规则

**影响市场**：US EU UK CN KR　**级别**：视情况　**检查方式**：人工

**适用条件**：网站面向儿童，或明知在收集儿童个人信息（US 未满 13 岁；EU 未满 16 岁，成员国可降至 13 岁；UK 未满 13 岁；CN、KR 未满 14 岁）

**依据要点**：

- 美国 COPPA（15 U.S.C. §6502），§6502(a)(1)
- COPPA Rule（16 CFR Part 312，2025 年修订），§312.4（通知）、§312.5（家长可验证同意）
- GDPR，第 8(1) 条
- UK GDPR，第 8 条
- ICO 适龄设计规范（Children's code），适用于可能被儿童访问的线上服务
- 《个人信息保护法》，第 28、31 条
- 《儿童个人信息网络保护规定》（网信办令第 4 号），第 8、9、10 条
- 韩国《个人信息保护法》，第 22 条之 2

**说明**：新增条目（S1）。COPPA 2025 年修订自 2025-06-23 生效，多数条款须于 2026-04-22 前合规（https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule）。UK 第 8 条的年龄自 2026-04-29 起可由国务大臣以条例在 13–16 岁之间调整，目前仍为 13 岁。

**判定方法**：先判断是否面向儿童（内容、画风、受众）或注册时是否收集年龄/生日。适用时检查：①收集儿童信息前有监护人同意流程（US 须为"可验证"的家长同意）；②有专门的儿童隐私规则（CN 第 31 条、网信办令第 4 号第 8 条）或面向儿童的告知；③有年龄门槛时，未达年龄的用户无法绕过直接提交。缺任一项判不通过。

**出处**：

- [美国 COPPA（15 U.S.C. §6502） §6502(a)(1)](https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap91-sec6502.htm)（核实于 2026-11-20）
- [COPPA Rule（16 CFR Part 312，2025 年修订） §312.4](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312)（核实于 2026-11-20）
- [GDPR 第 8(1) 条](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)（核实于 2026-11-20）
- [UK GDPR 第 8 条](https://www.legislation.gov.uk/eur/2016/679/article/8)（核实于 2026-11-20）
- [ICO 适龄设计规范（Children's code） 适用于可能被儿童访问的线上服务](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/)（核实于 2026-11-20）
- [《个人信息保护法》 第 28、31 条](https://www.miit.gov.cn/zwgk/zcwj/flfg/art/2022/art_04a0f1fb5df244e39688fd5372623a8d.html)（核实于 2026-11-20）
- [《儿童个人信息网络保护规定》（网信办令第 4 号） 第 8、9、10 条](https://www.cac.gov.cn/2019-08/23/c_1124913903.htm)（核实于 2026-11-20）
- [韩国《个人信息保护法》 第 22 条之 2](https://www.law.go.kr/법령/개인정보보호법)（核实于 2026-11-20）
