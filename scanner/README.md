# scanner — 自动扫描器

只做合规检查，不构成法律意见。规则来自 `../rules/registry.yaml`（只读）。

```bash
npm install
npx playwright install chromium
npm test
node bin/scc.js https://example.com            # Markdown 打到标准输出
node bin/scc.js https://example.com --json     # JSON 打到标准输出
node bin/scc.js https://example.com --out out  # 写 out/report.md、report.json、screenshots/
```

参数：`--timeout ms`（单次导航，默认 45000）、`--settle ms`（网络空闲后缓冲，默认 3000）、`--no-axe`。

## 采集

| 状态 | 做法 |
|---|---|
| 同意前 | 全新上下文，不点击，等 networkidle + 缓冲，记录 Cookie、localStorage、全部请求、截图；同时跑 axe、抓关键页面 |
| 设置层 | 新上下文，点横幅上的"设置/自定义"按钮，对比点击前后出现的复选框（C-04） |
| 拒绝后 | 新上下文，点拒绝 → 刷新 → 再访问一个同源内页，只统计点击之后的请求 |
| GPC | 新上下文，所有请求带 `Sec-GPC: 1`，并注入 `navigator.globalPrivacyControl = true` |

横幅识别：已知 CMP 选择器 + 启发式（fixed/sticky/dialog 元素、含同意相关文字、有可分类按钮），会进入 open shadow DOM 和 iframe。
关键页面：隐私政策、Cookie 政策、Impressum、条款、无障碍声明、联系页，链接文字覆盖 中/英/德/法/西/意/荷/葡（见 `src/patterns.js`）。

## 结果状态

`pass` / `fail` / `manual`（需人工）/ `na`（不适用）/ `error`（检查本身出错）。
检查抛异常、缺采集数据、返回值不合法、缺检查函数 → 一律 `error`，不会是 `pass`。
hybrid 规则从不返回 `pass`：有正面信号 → `manual` 并附证据；明确缺失 → `fail`。
横幅识别不到但页面有 CMP 脚本或同意相关文字 → 相关规则 `manual` 并附截图。

## 结构

- `bin/scc.js` CLI
- `src/crawl.js` 各状态采集；`src/extract.js` 页面内 DOM 提取
- `src/checks/<id>.js` 每条 auto/hybrid 规则一个检查函数
- `src/trackers.js` 追踪 / 第三方嵌入 / CMP 域名与 Cookie 名清单
- `src/report.js` Markdown + JSON 报告
- `test/` node:test + 本地静态服务器；fixtures 中所有外部请求在测试里被拦截为空响应（仍会被记录）
