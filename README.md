# site-compliance-check

网站上线前**合规**检查：给一个网址，列出缺了什么、会在哪些市场有问题、是什么级别。

> ❌ **C-02** 同意前加载了 `_ga`、`_fbp` → 影响 EU UK ｜ 必须

## 功能

- **只查合规**：隐私政策、Cookie 同意与追踪、GPC、表单与营销、公示信息（Impressum 等）、中国大陆备案、无障碍、素材授权。不涉及 SEO、性能、安全配置，也不给实现方案。
- **不用先选市场**：每条结果直接标出受影响的市场（`EU` `UK` `US` `CN` `DE` `AT` `CH` `KR` `JP` `CA` `GLOBAL`），看报告的人按自己的目标市场取舍。
- **自动 + 人工**：扫描器自动判定能判定的部分（同意前/拒绝后/带 GPC 三种状态下的 Cookie 与请求、关键链接、备案号、axe 无障碍规则等）；只能人工确认的项列成清单。
- **Claude Code skill**：一句"查一下 xx 合规"，跑扫描、解读结果、逐项引导人工确认，汇总成最终报告。

规则共 37 条，唯一来源是 [rules/registry.yaml](rules/registry.yaml)（字段见 [rules/SCHEMA.md](rules/SCHEMA.md)），每条附官方法规出处和核实日期。

## 快速开始

需要 Node.js 20 及以上。

### 1. 安装

```bash
git clone https://github.com/itsgavinwayne/site-compliance-check.git
```

```bash
cd site-compliance-check/scanner
```

```bash
npm install
```

```bash
npx playwright install chromium
```

### 2. 运行扫描

在 `scanner/` 目录下：

```bash
node bin/scc.js https://example.com --out ../reports/example.com
```

会写出 `reports/example.com/report.md`、`report.json` 和 `screenshots/`，同时把 Markdown 报告打印到标准输出。其他参数（`--json`、`--timeout`、`--settle`、`--no-axe`）见 [scanner/README.md](scanner/README.md)。

`reports/` 已在 `.gitignore` 中，真实站点的报告不要提交。

### 3. 使用 Claude Code skill

在仓库根目录把 skill 链接到个人 skill 目录：

```bash
mkdir -p ~/.claude/skills && ln -s "$(pwd)/skill/site-compliance-check" ~/.claude/skills/site-compliance-check
```

然后在 Claude Code 里说"查一下 https://example.com 的合规"。Skill 会在第一次运行时安装依赖，把报告写到 `reports/<host>-<日期>/`，引导你确认人工项，最后生成 `final.md`，每条标明结论来源（自动 / 人工确认 / 未确认）。也可以作为项目 skill 使用，见 [skill/README.md](skill/README.md)。

## 报告示例

[examples/](examples/) 里是用公开网站试跑的输出：

- [examples/example.com/report.md](examples/example.com/report.md)：几乎没有内容的示例域名，展示"缺什么"的样子；
- [examples/www.gov.uk/report.md](examples/www.gov.uk/report.md)：有标准接受/拒绝 Cookie 横幅的网站。

报告按"必须 → 视情况 → 建议"排序，每条一行；只能人工确认的项单独列出。

## 规则与人工清单

- [docs/checklist.md](docs/checklist.md)：可勾选的人工检查清单，含判定方法和主要出处，由登记表生成；
- [docs/rules/](docs/rules/README.md)：按分类整理的规则依据文档；
- [rules/registry.yaml](rules/registry.yaml)：规则登记表。

改了登记表后重新生成清单，并校验两者一致（不一致时退出码为 1，可接入 CI）：

```bash
node scripts/gen-checklist.js
```

```bash
node scripts/gen-checklist.js --check
```

在仓库根目录执行，需先在 `scanner/` 下 `npm install`（脚本复用其 `yaml` 依赖）。也可在 `scanner/` 下用 `npm run checklist` / `npm run checklist:check`。

## 局限

- 自动检查只覆盖一部分要求。隐私政策内容是否完整、同意记录、素材授权等只能人工确认；hybrid 类规则扫描器只给信号，不会判"通过"。
- 只扫首页和自动发现的关键页（隐私政策、Cookie 政策、Impressum、条款、无障碍声明、联系页），不会遍历全站；其他页面的表单、嵌入需人工检查。
- 追踪器和第三方嵌入按已知域名与 Cookie 名清单识别（`scanner/src/trackers.js`），未收录的工具识别不到。
- Cookie 横幅靠已知 CMP 选择器和启发式识别，自制横幅可能识别不到，此时相关项为"需人工确认"。
- axe-core 只能发现部分 WCAG 问题，键盘操作、读屏等需人工审查。
- 扫描从你所在的网络发起；按地区展示不同横幅的网站，结果可能和目标市场用户看到的不同。国内站从境外访问可能超时（记为"出错"，不会当作通过）。
- 法规会变化。每条依据都有核实日期，部分条目标了"待核实"（见 [docs/rules/README.md](docs/rules/README.md)），需要定期复核。

## 免责声明

本项目及其报告不构成法律意见，也不保证网站合规。检查结论只反映扫描当时的状态和登记表收录的规则。正式上线前请咨询专业律师。

## License

MIT
