# Claude Code skill：site-compliance-check

让 Claude Code 听到"查一下 xx 合规""上线前合规检查"时，自动跑扫描器、解读报告、逐项引导人工确认，最后在 `reports/<host>-<日期>/final.md` 写出最终报告。流程见 [site-compliance-check/SKILL.md](site-compliance-check/SKILL.md)。

Skill 本身不含扫描器，要用到本仓库的 `scanner/` 和 `rules/`。下面的安装方式都假设你已经克隆了仓库。

## 方式一：装成个人 skill（任何目录下都能用）

用软链接，这样 skill 能顺着链接找到仓库，仓库更新后也不用重装：

```bash
mkdir -p ~/.claude/skills
ln -s "$(pwd)/skill/site-compliance-check" ~/.claude/skills/site-compliance-check
```

在仓库根目录执行。如果改用复制（`cp -R`），skill 找不到仓库，需要设置环境变量 `SCC_HOME` 指向仓库根目录，或者在仓库目录里启动 Claude Code。

## 方式二：作为项目 skill（只在本仓库里用）

```bash
mkdir -p .claude/skills
ln -s ../../skill/site-compliance-check .claude/skills/site-compliance-check
```

在仓库根目录执行。`.claude/skills/` 是你本地的配置，不需要提交。

## 使用

在 Claude Code 里直接说：

- "查一下 https://example.com 的合规"
- "这个站上线前做个合规检查：example.com"

第一次运行时 skill 会在 `scanner/` 下执行 `npm install` 和 `npx playwright install chromium`。

## 注意

- 报告写在 `reports/`，已被 `.gitignore` 忽略，不要提交。
- Skill 只说合规问题，不给实现方案。
- 结果不构成法律意见。
