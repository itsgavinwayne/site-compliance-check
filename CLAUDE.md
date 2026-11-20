# 项目约定

- 计划与分工见 `PLAN.md`；规则唯一来源 `rules/registry.yaml`，字段见 `rules/SCHEMA.md`。
- 只做合规检查，不写 SEO/性能/实现建议。
- 公开仓库：不提交私人或客户站点名、真实试跑报告（放 `reports/`，已忽略）、密钥、个人信息。
- 法规依据必须来自官方来源（法规原文、监管机构指南），写明核实日期；查不到就标注待核实，不凭记忆。
- 扫描器：Node 20 ESM，Playwright；检查出错时状态为 `error`，绝不默认 `pass`。
- 各工作流只改 PLAN.md 中分配给自己的文件；完成后开 PR 到 `main`，不直接推 main。
