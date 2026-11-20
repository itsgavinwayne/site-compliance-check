# 网站上线前合规检查 — 项目计划

## 1. 目标

做一套**只检查合规、不管实现**的网站上线前检查工具：

- 输入：一个网址
- 输出：一份报告，每条一行：**缺了什么 → 影响哪些市场 → 级别**
  > ❌ **C-02** 同意前加载了 `_ga`、`_fbp` → 影响 🇪🇺 EU 🇬🇧 UK ｜ 必须
- 不需要先声明目标市场；报告把每条问题影响到的市场直接列出来，看的人自己判断。
- 不给实现方案（用什么 CMP、怎么写代码是开发的事）。

**不在范围内**：SEO、性能、安全配置、技术选型建议。

## 2. 交付物

| 交付物 | 位置 | 说明 |
|---|---|---|
| 规则登记表 | `rules/registry.yaml` | 所有检查项的唯一来源（编号、缺失描述、影响市场、级别、检查方式、依据） |
| 规则说明文档 | `docs/rules/*.md` | 每类一份，每条附法规原文出处与核实日期 |
| 人工检查清单 | `docs/checklist.md` | 由登记表生成，可打勾 |
| 自动扫描器 | `scanner/` | Node 20 + Playwright 的命令行工具 |
| Claude skill | `skill/site-compliance-check/SKILL.md` | 一句"查一下 xx 合规"就跑扫描 + 引导人工项 |
| 示例报告 | `examples/` | 只用公开示例站，不放任何私人/客户站点 |

## 3. 规则体系

### 3.1 市场代码

| 代码 | 含义 |
|---|---|
| `GLOBAL` | 全球通用 |
| `EU` | 欧盟 / 欧洲经济区 |
| `UK` | 英国 |
| `US` | 美国（含州法，如加州） |
| `CN` | 中国大陆 |
| `DE` / `AT` | 德国 / 奥地利（Impressum 等特有要求） |
| `CH` | 瑞士 |
| `KR` | 韩国 |
| `JP` | 日本 |
| `CA` | 加拿大（含魁北克） |

### 3.2 级别

| 级别 | 含义 |
|---|---|
| `must` 必须 | 缺失即有违规风险 |
| `conditional` 视情况 | 满足 `condition` 时为必须（如达到营收门槛、属于 EAA 范围） |
| `recommended` 建议 | 有诉讼风险或属行业惯例 |

### 3.3 检查方式

| 方式 | 含义 |
|---|---|
| `auto` | 扫描器可以独立判定 通过/不通过 |
| `hybrid` | 扫描器给出信号（如找到链接），最终需人确认内容 |
| `manual` | 只能人工确认（如授权凭证、同意记录） |

### 3.4 分类与编号

| 前缀 | 分类 |
|---|---|
| `P-` | 隐私政策 |
| `C-` | Cookie 与追踪 |
| `F-` | 表单与营销 |
| `I-` | 公示信息 |
| `CN-` | 中国大陆专项 |
| `A-` | 无障碍 |
| `L-` | 素材授权 |

编号一旦发布不复用、不改含义；废弃的规则标 `deprecated: true`。

## 4. 架构

```
site-compliance-check/
├── rules/registry.yaml     ← 契约：规则 id 是扫描器、文档、skill 共同的键
├── rules/SCHEMA.md         ← 字段说明
├── docs/rules/             ← 依据文档（工作流 S1）
├── docs/checklist.md       ← 人工清单（工作流 S3 生成）
├── scanner/                ← 自动扫描器（工作流 S2）
│   ├── package.json
│   ├── bin/scc.js          ← CLI 入口：scc <url> [--out dir] [--json]
│   └── src/
│       ├── crawl.js        ← 打开首页 + 发现隐私/Cookie/Impressum 等关键页
│       ├── checks/<id>.js  ← 每条 auto/hybrid 规则一个检查函数
│       ├── trackers.js     ← 已知追踪/第三方嵌入域名清单
│       └── report.js       ← 输出 Markdown + JSON 报告
├── skill/                  ← Claude skill（工作流 S3）
└── examples/               ← 示例报告
```

### 4.1 扫描器关键设计

- **"同意前"状态**：全新无痕上下文打开页面，不点击任何东西，等待网络空闲 + 固定缓冲时间，记录此时的 Cookie、localStorage、所有网络请求。
- **"拒绝后"状态**：找到横幅上的拒绝按钮并点击，刷新、再访问一个内页，确认追踪请求仍未出现。
- **GPC**：带 `Sec-GPC: 1` 请求头并注入 `navigator.globalPrivacyControl = true` 再跑一遍，对比追踪请求。
- **多语言识别**：链接/按钮文字匹配覆盖 中/英/德/法/西/意/荷/葡 常见写法（如 privacy / 隐私 / Datenschutz / confidentialité）。
- **结果状态**：`pass` / `fail` / `manual`（需人工）/ `na`（不适用，如未发现表单）/ `error`（检查本身出错，不能当作通过）。
- **检查函数接口**：`export default async function check(ctx) → { status, evidence[], note }`，`ctx` 提供页面、各状态的请求/Cookie 快照、已发现的关键页。

### 4.2 各规则的自动化程度（初定，S2 可调整并在 PR 中说明）

| 规则 | 方式 | 扫描器做什么 |
|---|---|---|
| P-01 | auto | 页脚/全页是否有隐私政策链接且可打开（非 404） |
| P-02 ~ P-06 | manual | 内容完整性需人读；扫描器列出发现的第三方域名，辅助核对 P-03/P-06 |
| P-07 | hybrid | 是否存在中文隐私政策页面 |
| P-08 | hybrid | 隐私政策页是否有"最后更新"类日期 |
| C-01 | auto | 首屏是否出现 Cookie 同意横幅（CMP 选择器 + 文字启发式） |
| C-02 | auto | 同意前是否已有追踪类 Cookie 或追踪域名请求 |
| C-03 | auto | 横幅第一层是否有拒绝按钮 |
| C-04 | hybrid | 横幅设置层里的复选框是否默认勾选 |
| C-05 | hybrid | 是否存在"Cookie 设置"类再次打开入口 |
| C-06 | auto | 是否有 Cookie 政策链接（或隐私政策内含 Cookie 章节→hybrid） |
| C-07 | manual | 同意记录只能问运营方 |
| C-08 | auto | 同意前是否请求 YouTube/Google Maps/Google Fonts 等第三方嵌入 |
| C-09 | auto | 页脚是否有 "Do Not Sell or Share" 类链接 |
| C-10 | hybrid | 带 GPC 信号时追踪请求是否减少 |
| F-01 | auto | 含 email/电话字段的表单附近是否有隐私链接 |
| F-02 | auto | 表单里营销类复选框是否默认勾选 |
| F-03 / F-04 | manual | — |
| I-01 / I-02 | hybrid | 页面上是否能找到公司名、地址、注册号模式 |
| I-03 | auto | 是否有 Impressum 链接 |
| I-04 | auto | 是否有条款/法律声明链接 |
| CN-01 | auto | 是否有 ICP 备案号（正则）且链接到 beian.miit.gov.cn |
| CN-02 | auto | 是否有公安备案号且链接到 beian.mps.gov.cn |
| CN-03 / CN-04 | manual | — |
| A-01 | hybrid | axe-core 跑 WCAG 2.1 AA 规则（自动只能覆盖一部分） |
| A-02 | auto | 是否有无障碍声明链接 |
| L-01 | manual | — |

## 5. 分阶段执行

### 阶段 0 — 骨架（✅ 已完成）
- 建仓库、写本计划、`rules/registry.yaml` 骨架（编号/标题/市场/级别/检查方式，依据留空）、推到 GitHub 公开库。

### 阶段 1 — 并行（✅ 已完成：S1 = PR #1，S2 = PR #2）

**S1 法规核对与规则文档**（只改 `rules/registry.yaml` 的 `basis`、`how_to_verify`、`notes` 字段，以及 `docs/rules/`）
1. 逐条查法规原文/监管机构官方指南，填 `basis`：法规名、条款、官方链接、核实日期。
2. 核对每条的 `markets` 和 `level` 是否准确；需要改的在 PR 描述里逐条列出理由（这两个字段是扫描器的契约）。
3. 补漏：查有没有遗漏的常见合规要求（如儿童数据 COPPA、巴西 LGPD、加拿大），有则新增编号。
4. 写 `docs/rules/<分类>.md`：每条 = 缺少什么 / 影响市场 / 依据原文要点 / 人工怎么判定。
- 验收：每条非 deprecated 规则至少 1 个官方来源链接 + 核实日期；无凭印象写的条款号。

**S2 自动扫描器**（只改 `scanner/`、`examples/`；只读 `rules/registry.yaml`）
1. 按 §4.1 搭 CLI；按 §4.2 实现 auto/hybrid 检查。
2. 报告：Markdown（按级别和分类排序，每条一行）+ JSON；manual 规则列为"需人工确认"。
3. 测试：用本地静态 fixture 页面（合规页 / 不合规页）做单元测试，`npm test` 全过。
4. 用 1–2 个公开网站试跑，输出放 `examples/`。
- 验收：`npx scc <url>` 能出报告；每条 auto 规则至少有一个通过和一个不通过的 fixture 测试；检查出错时状态为 `error` 而非 `pass`。

### 阶段 2 — 整合（S1、S2 合并后）

**S3 Skill 与人工清单**
1. 脚本从登记表生成 `docs/checklist.md`。
2. 写 `skill/site-compliance-check/SKILL.md`：跑扫描 → 解读报告 → 逐项引导人工项 → 汇总成最终报告。
3. README 补安装与使用说明。

**S4 真实站点试跑**
- 用你自己的站跑一遍，按误报/漏报修正检查逻辑和规则描述。
- 试跑报告写入 `reports/`（已 gitignore，**不进公开库**）。

### 阶段 3 — 发布
- 打 `v0.1.0` tag，README 写清局限与免责声明。

## 6. 协作约定

- 每个会话在自己的 worktree 分支工作，完成后开 PR 到 `main`；合并由你确认。
- 改动范围严格按上面的"只改"列表，避免冲突。
- 公开仓库：不提交任何私人站点名、客户数据、密钥、真实试跑报告。
- 免责：本工具不构成法律意见。

## 7. 风险

| 风险 | 应对 |
|---|---|
| 法规更新快 | 每条带核实日期；README 写明定期复核 |
| 横幅识别误报/漏报多 | 识别不到时状态为 `manual` 而非 `fail`，并附截图证据 |
| 国内站境外访问慢/被拦 | 扫描器超时设长，超时记 `error` |
| 自动化覆盖有限 | 报告明确区分"自动判定"和"需人工确认" |
