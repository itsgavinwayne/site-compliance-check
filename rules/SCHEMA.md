# registry.yaml 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 唯一编号，如 `C-02`。发布后不复用、不改含义 |
| `category` | 是 | `privacy-policy` / `cookies` / `forms` / `disclosure` / `china` / `accessibility` / `licensing` |
| `missing` | 是 | "缺少什么"——报告里直接显示的那句话 |
| `markets` | 是 | 受影响市场：`GLOBAL` `EU` `UK` `US` `CN` `DE` `AT`（可扩充，新增代码需同步本表） |
| `level` | 是 | `must` / `conditional` / `recommended` |
| `condition` | level=conditional 时必填 | 何种情况下变为必须 |
| `check` | 是 | `auto` / `hybrid` / `manual` |
| `basis` | 定稿时必填 | 依据列表，每项：`law`（法规名）、`article`（条款）、`url`（官方来源）、`verified_at`（YYYY-MM-DD） |
| `how_to_verify` | 定稿时必填 | 人工如何判定通过/不通过 |
| `notes` | 否 | 补充说明、例外情况 |
| `deprecated` | 否 | `true` 表示废弃，保留编号 |

## 契约

- 扫描器以 `id` 为键实现检查（`scanner/src/checks/<id>.js`），读取 `missing` / `markets` / `level` 生成报告。
- 修改已有规则的 `markets` 或 `level` 必须在 PR 描述里说明理由。
