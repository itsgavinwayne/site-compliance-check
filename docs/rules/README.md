# 规则依据文档

每个分类一份，内容由 [`rules/registry.yaml`](../../rules/registry.yaml) 整理；两者不一致时以登记表为准。

| 分类 | 文档 | 条目 |
|---|---|---|
| 隐私政策 | [privacy-policy.md](privacy-policy.md) | P-01 – P-10 |
| Cookie 与追踪 | [cookies.md](cookies.md) | C-01 – C-11 |
| 表单与营销 | [forms.md](forms.md) | F-01 – F-05 |
| 公示信息 | [disclosure.md](disclosure.md) | I-01 – I-04 |
| 中国大陆专项 | [china.md](china.md) | CN-01 – CN-04 |
| 无障碍 | [accessibility.md](accessibility.md) | A-01 – A-02 |
| 素材授权 | [licensing.md](licensing.md) | L-01 |

## 核实方式

- 依据只取自官方来源：法规原文（EUR-Lex、legislation.gov.uk、gesetze-im-internet.de、fedlex、law.go.kr、e-Gov、govinfo/eCFR、国务院/工信部/网信办官网等），以及监管机构指南（EDPB、ICO、CNIL、CPPA、FTC、DOJ、科罗拉多州总检察长、魁北克 CAI、総務省）。
- 每条依据的 `verified_at` 是实际打开官方页面核对的日期。法规会更新，复核时以此日期为起点。
- 官方页面打不开、条文没读到的，不写进 `basis`，在该条 `notes` 里标"待核实"并写明原因。

## 待核实清单（截至 2026-11-20）

| 涉及条目 | 内容 | 原因 |
|---|---|---|
| P-01、P-03、P-08 | 加州 CalOPPA（Bus. & Prof. Code §22575）：隐私政策张贴、第三方类别、生效日期、Do Not Track 披露 | leginfo.legislature.ca.gov 有机器人验证，未能读取原文 |
| P-07 | GB/T 35273-2020《个人信息安全规范》是否要求中文版 | 未取得标准全文 |
| P-09 | 魁北克 CQLR c P-39.1 的具体条号；巴西 LGPD 第 41 条 §1 | legisquebec、planalto.gov.br 无法访问 |
| I-03 | 奥地利 ECG §5、MedienG §25、UGB §14 的条文内容；德国 MStV §18 | RIS 有机器人验证；MStV 不在联邦法规门户 |
| CN-02 | 要求在首页显示公安备案号并链接 beian.mps.gov.cn 的官方依据 | 公安部令第 33 号只规定备案义务；平台页面无法抓取 |
| F-03 | 《广告法》第 43 条现行文本（是否受 2021 年修正影响） | npc.gov.cn 无法访问，转载页修正记录只到 2018 年 |
| A-01 | EN 301 549 V4.1.1（WCAG 2.2）在官方公报引用的日期 | 只见于成员国机构页面，未见官方公报 |

## 市场代码

本次新增了 `CH`（瑞士）、`KR`（韩国）、`JP`（日本）、`CA`（加拿大）四个市场代码。`rules/SCHEMA.md` 和 `PLAN.md` §3.1 的代码表需要同步，这两个文件不在 S1 的修改范围内。

> 本工具及文档不构成法律意见。
