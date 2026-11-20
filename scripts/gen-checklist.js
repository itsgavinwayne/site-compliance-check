#!/usr/bin/env node
// 从 rules/registry.yaml 生成 docs/checklist.md（人工检查清单）。
//   node scripts/gen-checklist.js            生成/覆盖 docs/checklist.md
//   node scripts/gen-checklist.js --check    只校验：清单与登记表不一致时退出码 1（可接 CI）
//   node scripts/gen-checklist.js --stdout   打印到标准输出，不写文件
// 可选：--registry <file>  --out <file>
// 依赖：复用 scanner/ 的 yaml 包（先在 scanner/ 下 npm install）。
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REGISTRY = path.join(ROOT, 'rules/registry.yaml');
const DEFAULT_OUT = path.join(ROOT, 'docs/checklist.md');

function loadYaml() {
  const require = createRequire(path.join(ROOT, 'scanner/package.json'));
  try {
    return require('yaml');
  } catch {
    console.error('找不到 yaml 依赖。请先运行：cd scanner && npm install');
    process.exit(2);
  }
}

// 与 PLAN.md §3.1 / rules/SCHEMA.md 保持一致
const MARKETS = [
  ['GLOBAL', '全球通用'],
  ['EU', '欧盟 / 欧洲经济区'],
  ['UK', '英国'],
  ['US', '美国（含州法，如加州）'],
  ['CN', '中国大陆'],
  ['DE', '德国'],
  ['AT', '奥地利'],
  ['CH', '瑞士'],
  ['KR', '韩国'],
  ['JP', '日本'],
  ['CA', '加拿大（含魁北克）'],
];
const CATEGORIES = [
  ['privacy-policy', '隐私政策', 'privacy-policy.md'],
  ['cookies', 'Cookie 与追踪', 'cookies.md'],
  ['forms', '表单与营销', 'forms.md'],
  ['disclosure', '公示信息', 'disclosure.md'],
  ['china', '中国大陆专项', 'china.md'],
  ['accessibility', '无障碍', 'accessibility.md'],
  ['licensing', '素材授权', 'licensing.md'],
];
const LEVEL = { must: '必须', conditional: '视情况', recommended: '建议' };
const CHECK = { auto: '自动', hybrid: '扫描 + 人工确认', manual: '人工' };
const REQUIRED = ['id', 'category', 'missing', 'markets', 'level', 'check'];

// 压成一行；YAML 折叠（>-）在中文换行处留下的空格一并去掉
const one = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
  .replace(/([\u3000-\u303f\uff00-\uffef]) /g, '$1')
  .replace(/([\u4e00-\u9fff]) (?=[\u4e00-\u9fff])/g, '$1')
  .replace(/ (?=[\uff08\u300c])/g, '');
const byId = (a, b) => a.id.localeCompare(b.id, 'en', { numeric: true });

export function render(doc) {
  if (!doc || !Array.isArray(doc.rules)) throw new Error('registry 格式错误：缺少 rules 列表');
  for (const r of doc.rules) {
    for (const k of REQUIRED) if (r[k] == null) throw new Error(`规则 ${r.id || '?'} 缺字段 ${k}`);
    if (r.level === 'conditional' && !one(r.condition)) throw new Error(`规则 ${r.id} 为 conditional 但缺 condition`);
  }
  const ids = doc.rules.map((r) => r.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`规则编号重复：${[...new Set(dup)].join(', ')}`);

  const active = doc.rules.filter((r) => !r.deprecated);
  const deprecated = doc.rules.filter((r) => r.deprecated).sort(byId);
  const known = new Set(MARKETS.map(([c]) => c));
  const unknownMarkets = [...new Set(active.flatMap((r) => r.markets))].filter((m) => !known.has(m)).sort();

  const L = [];
  L.push('# 上线前合规人工检查清单', '');
  L.push('<!-- 本文件由 scripts/gen-checklist.js 从 rules/registry.yaml 生成，请勿手改；改登记表后重新运行脚本。 -->', '');
  L.push(`登记表版本 \`${doc.version ?? '未标注'}\`，共 ${active.length} 条规则。每条格式：**编号** 缺少什么 → 影响市场 ｜ 级别 ｜ 检查方式。`);
  L.push('通过就打勾；"自动"项可先看扫描器报告，"人工"项只能人工确认。依据详情见 [docs/rules/](rules/README.md)。', '');
  L.push('> 只检查合规，不给实现方案。本清单不构成法律意见，正式上线前请咨询专业律师。', '');

  L.push('## 市场代码', '', '| 代码 | 含义 |', '|---|---|');
  for (const [c, n] of MARKETS) L.push(`| \`${c}\` | ${n} |`);
  for (const c of unknownMarkets) L.push(`| \`${c}\` | （未在 SCHEMA.md 登记的代码） |`);
  L.push('');
  L.push('级别：**必须** = 缺失即有违规风险；**视情况** = 满足"条件"时为必须；**建议** = 有诉讼风险或属行业惯例。', '');
  L.push('检查方式：**自动** = 扫描器可独立判定；**扫描 + 人工确认** = 扫描器给出信号，需人确认内容；**人工** = 只能人工确认。', '');

  const cats = [...CATEGORIES];
  for (const c of new Set(active.map((r) => r.category))) {
    if (!cats.some(([k]) => k === c)) cats.push([c, c, null]);
  }
  for (const [key, name, file] of cats) {
    const rules = active.filter((r) => r.category === key).sort(byId);
    if (!rules.length) continue;
    L.push(`## ${name}`, '');
    if (file) L.push(`依据文档：[docs/rules/${file}](rules/${file})`, '');
    for (const r of rules) {
      L.push(`- [ ] **${r.id}** ${one(r.missing)} → 影响 ${r.markets.join(' ')} ｜ ${LEVEL[r.level] || r.level} ｜ ${CHECK[r.check] || r.check}`);
      if (r.level === 'conditional') L.push(`  - 条件：${one(r.condition)}`);
      L.push(`  - 判定方法：${one(r.how_to_verify) || '（登记表未填写，待补）'}`);
      const b = Array.isArray(r.basis) ? r.basis.find((x) => x && x.url) : null;
      if (b) {
        const label = [one(b.law), one(b.article)].filter(Boolean).join(' ');
        L.push(`  - 主要出处：[${label.replace(/[[\]]/g, '')}](${b.url})${b.verified_at ? `（核实 ${b.verified_at}）` : ''}`);
      } else {
        L.push('  - 主要出处：待核实');
      }
    }
    L.push('');
  }

  if (deprecated.length) {
    L.push('## 已废弃（编号保留，不再检查）', '');
    for (const r of deprecated) L.push(`- ~~**${r.id}** ${one(r.missing)}~~`);
    L.push('');
  }
  return L.join('\n');
}

function parseArgs(argv) {
  const o = { check: false, stdout: false, registry: DEFAULT_REGISTRY, out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') o.check = true;
    else if (a === '--stdout') o.stdout = true;
    else if (a === '--registry') o.registry = path.resolve(argv[++i]);
    else if (a === '--out') o.out = path.resolve(argv[++i]);
    else { console.error(`未知参数 ${a}\n用法：node scripts/gen-checklist.js [--check] [--stdout] [--registry file] [--out file]`); process.exit(2); }
  }
  return o;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const YAML = loadYaml();
  const md = render(YAML.parse(await readFile(o.registry, 'utf8')));
  if (o.stdout) { process.stdout.write(md); return; }
  if (o.check) {
    let cur = null;
    try { cur = await readFile(o.out, 'utf8'); } catch {}
    if (cur === md) { console.log(`✅ ${path.relative(ROOT, o.out)} 与登记表一致`); return; }
    console.error(`❌ ${path.relative(ROOT, o.out)} 与 ${path.relative(ROOT, o.registry)} 不一致${cur == null ? '（清单不存在）' : ''}。请运行：node scripts/gen-checklist.js`);
    if (cur != null) {
      const a = cur.split('\n'), b = md.split('\n');
      const diffs = [];
      for (let i = 0; i < Math.max(a.length, b.length) && diffs.length < 5; i++) {
        if (a[i] !== b[i]) diffs.push(`  第 ${i + 1} 行\n    现有：${a[i] ?? '（无）'}\n    应为：${b[i] ?? '（无）'}`);
      }
      console.error(diffs.join('\n'));
    }
    process.exit(1);
  }
  await mkdir(path.dirname(o.out), { recursive: true });
  await writeFile(o.out, md);
  console.log(`已写入 ${path.relative(ROOT, o.out)}`);
}

main().catch((e) => { console.error(`生成失败：${e && e.message || e}`); process.exit(1); });
