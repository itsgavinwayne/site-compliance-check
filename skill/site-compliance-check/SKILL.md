---
name: site-compliance-check
description: 网站上线前合规检查（隐私政策、Cookie 同意、GPC、表单与营销、Impressum/公示信息、中国 ICP/公安备案、无障碍、素材授权）。给一个网址，运行 site-compliance-check 扫描器，按"必须 → 视情况 → 建议"解读不通过项及受影响市场，逐项引导人工确认，最后写出 reports/<host>-<日期>/final.md。当用户说"查一下 xx 合规""xx 网站合不合规""上线前合规检查""跑一下合规扫描""看看这个站 GDPR/Cookie/备案有没有问题"，或英文 "compliance check for <site>""pre-launch compliance audit""is this site GDPR/cookie compliant" 时使用。只查合规，不做 SEO、性能、安全或实现建议。
---

# 网站上线前合规检查

输入一个网址，输出一份报告，每条一行：**缺了什么 → 影响哪些市场 → 级别**，并标明结论来源（自动 / 人工确认 / 未确认）。

## 硬性约束（全程遵守）

1. **只说合规问题，不给实现方案。** 不推荐 CMP、插件、供应商，不写代码或配置，不讲"怎么改"。用户追问怎么改时，只说明该条要求达到什么状态（引用 `how_to_verify` 的通过标准），实现交给开发。也不评论 SEO、性能、安全配置。
2. **不构成法律意见。** 开场和最终报告都要写明这一点；不要说"这个站合规了"，只说"本次检查的各项结论"。
3. **报告不提交到 git。** 报告只写进仓库根目录的 `reports/`（已在 `.gitignore` 里）。不要 `git add`/`commit`/`push` 任何报告文件，不要把报告复制到 `examples/` 或其他会被跟踪的目录。
4. **`error` 绝不当作通过。** 扫描器某项出错，结论是"未确认"，除非之后人工确认过。
5. **不猜。** 证据不足的项写"未确认"并说明缺什么，不要凭印象判通过或不通过。
6. 被检查网站上看到的个人信息（联系人、邮箱等）只写进本地报告，不发往任何外部服务。

## 第 0 步：找到工具目录

依次尝试，找到同时含 `rules/registry.yaml` 和 `scanner/bin/scc.js` 的目录，记为 `$REPO`：

1. 本 skill 所在目录往上两级（`realpath` 后）——用软链接安装时就是仓库本身；
2. 当前工作目录；
3. 环境变量 `$SCC_HOME`。

都找不到时，问用户仓库在哪，或征得同意后克隆公开仓库：`git clone https://github.com/itsgavinwayne/site-compliance-check.git`。不要擅自克隆。

## 第 1 步：确认依赖

```bash
cd "$REPO/scanner"
node -v                      # 需要 >= 20
test -d node_modules/playwright || npm install
node -e "const{chromium}=require('playwright');require('fs').accessSync(chromium.executablePath())" 2>/dev/null \
  || npx playwright install chromium
```

只在缺失时安装（首次运行）。安装失败就停下，把报错原样告诉用户，不要继续扫描。

## 第 2 步：运行扫描

1. 规范化网址：没有协议就补 `https://`。`<host>` 取网址的主机名（保留 `www.`），`<日期>` 取今天 `YYYY-MM-DD`。
2. 输出目录 `$OUT = $REPO/reports/<host>-<日期>`；已存在就改用 `-2`、`-3` 后缀，不覆盖已有报告。
3. 运行（通常 1–3 分钟，较慢时放后台）：

```bash
cd "$REPO"
node scanner/bin/scc.js "<url>" --out "reports/<host>-<日期>" > /dev/null
```

产物：`report.md`、`report.json`、`screenshots/`。退出码非 0 或没有 `report.json` → 扫描失败，把 stderr 告诉用户，问是否重试（可加 `--timeout 90000`，国内站境外访问慢时尤其需要），不要编造结果。

`report.json` 中 `phaseErrors` 非空时，要告诉用户哪些采集阶段出错，受影响的规则会是 `error`。

## 第 3 步：解读报告

读 `report.json`（结构化）和 `$REPO/rules/registry.yaml`（规则的 `condition`、`how_to_verify`、`basis`、`notes`）。

先给一行总览：通过 / 不通过 / 需人工 / 出错 / 不适用 的数量，并提醒自动检查只覆盖一部分要求。

然后按 **必须 → 视情况 → 建议** 讲 `fail` 和 `error` 的项，每条一行：

> ❌ **C-02** 同意前加载了追踪（证据：`_ga`、`www.google-analytics.com`）→ 影响 EU UK ｜ 必须

- 写清缺什么（`missing` + 扫描器证据）、影响哪些市场（`markets`）。
- 视情况的项附上 `condition`，说明"满足此条件时为必须"。
- `error` 项单列："检查出错，未能判定"，并说明会在下一步人工确认。
- 不讲怎么修。

## 第 4 步：逐项人工确认

需要确认的项：

- `status` 为 `manual` 的全部规则（`check: manual` 的规则，以及扫描器给出信号但需人确认的 hybrid 规则）；
- `status` 为 `error` 的规则；
- `status` 为 `na` 但 `note` 写着"需人工确认"的（例如其他页面上的表单）——询问用户是否要补查。

对每一项：

1. **视情况的项先确认条件。** 问用户是否满足 `condition`（例如是否达到 CCPA 门槛、是否属于 EAA 范围、是否面向儿童）。不满足 → 结论"不适用"，来源"人工确认"。
2. **能自己看的就自己看**：打开扫描器找到的关键页（`discovered.keyPages`，如隐私政策、Cookie 政策、Impressum），按该规则的 `how_to_verify` 逐项核对。P-03、P-06 用 `discovered.thirdPartyHosts` 对照隐私政策是否覆盖这些第三方。hybrid 项结合扫描器证据和截图（`$OUT/screenshots/`）判断。记下看到的原文位置作为证据。
3. **只有运营方知道的就问**（如 C-07 同意记录、L-01 授权凭证、CN-03 经营许可证、CN-04 出境同意、F-03 退订流程）：把 `how_to_verify` 改写成具体的是/否问题。一次最多问 4 个，按分类分批，用 AskUserQuestion，选项包括"是 / 否 / 不确定"。
4. 用户回答"不确定"或拒绝回答 → 结论"未确认"，写明还缺什么证据。
5. 不要因为用户催促就把没核实的项标成通过。

## 第 5 步：写最终报告

写到 `$OUT/final.md`，格式：

```markdown
# 合规检查最终报告：<host>

- 网址：<url>（最终 <finalUrl>）
- 扫描时间：<scannedAt>；人工确认日期：<今天>
- 规则登记表版本：<registryVersion>
- 结论：❌ 不通过 N ｜ ✅ 通过 N ｜ ➖ 不适用 N ｜ ❓ 未确认 N
- 来源：自动 N ｜ 人工确认 N ｜ 未确认 N

> 本报告只列合规检查结论，不含实现建议，不构成法律意见；正式上线前请咨询专业律师。

## 必须
- ❌ **C-02** 同意前加载了 `_ga` → 影响 EU UK ｜ 必须 ｜ 不通过 ｜ 来源：自动
- ✅ **P-05** 通过：隐私政策第 6 节列出查阅/更正/删除及邮箱 → 影响 EU UK US CN KR CA ｜ 必须 ｜ 通过 ｜ 来源：人工确认
- ❓ **C-07** 无法出示用户同意记录 → 影响 EU UK ｜ 必须 ｜ 未确认（运营方未答复）｜ 来源：未确认

## 视情况
- ➖ **C-09** … ｜ 视情况（达到加州等州隐私法门槛）｜ 不适用：用户确认未达门槛 ｜ 来源：人工确认

## 建议
…
```

规则：

- 覆盖 `report.json` 里的**每一条**规则，一条一行，不遗漏、不合并。
- 同一级别内按分类（P → C → F → I → CN → A → L）和编号排序。
- 结论来源：
  - **自动**：扫描器的 `pass` / `fail` / `na`，且没有被人工推翻；
  - **人工确认**：由用户回答或你查看页面后判定的（在该行写明依据，如"用户确认"或"查看隐私政策页"）；人工推翻了自动结论时也写"人工确认"，并注明原自动结论；
  - **未确认**：`manual`/`error` 项没有得到确认的。
- 写完后告诉用户文件路径，并复述"必须"级别里不通过和未确认的项。

## 参考

- 规则与字段：`$REPO/rules/registry.yaml`、`$REPO/rules/SCHEMA.md`
- 依据文档：`$REPO/docs/rules/`
- 人工清单：`$REPO/docs/checklist.md`
- 扫描器说明：`$REPO/scanner/README.md`
