#!/usr/bin/env node
// scc <url> [--out dir] [--json] [--timeout ms] [--settle ms] [--no-axe]
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { scan } from '../src/index.js';

const USAGE = `用法：scc <url> [--out dir] [--json] [--timeout ms] [--settle ms] [--no-axe]

  --out dir     把 report.md、report.json、screenshots/ 写入该目录
  --json        向标准输出打印 JSON（默认打印 Markdown）
  --timeout ms  单次页面导航超时，默认 45000
  --settle ms   网络空闲后的固定等待，默认 3000
  --no-axe      跳过 axe 无障碍检查（A-01 将为 error）

本工具只做合规检查，不构成法律意见。`;

function parse(argv) {
  const o = { url: null, out: null, json: false, opts: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') o.out = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--timeout') o.opts.timeout = Number(argv[++i]);
    else if (a === '--settle') o.opts.settle = Number(argv[++i]);
    else if (a === '--no-axe') o.opts.axe = false;
    else if (a === '-h' || a === '--help') o.help = true;
    else if (a.startsWith('-')) throw new Error(`未知参数 ${a}`);
    else if (!o.url) o.url = a;
    else throw new Error(`多余参数 ${a}`);
  }
  return o;
}

async function main() {
  let a;
  try { a = parse(process.argv.slice(2)); } catch (e) { console.error(e.message + '\n\n' + USAGE); process.exit(2); }
  if (a.help || !a.url) { console.log(USAGE); process.exit(a.help ? 0 : 2); }
  let url = a.url;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { new URL(url); } catch { console.error(`无效网址：${a.url}`); process.exit(2); }
  for (const k of ['timeout', 'settle']) if (a.opts[k] != null && !(a.opts[k] >= 0)) { console.error(`--${k} 需要数字`); process.exit(2); }

  const outDir = a.out ? path.resolve(a.out) : null;
  if (outDir) await mkdir(outDir, { recursive: true });
  const { json, markdown } = await scan(url, { ...a.opts, outDir });
  if (outDir) {
    await writeFile(path.join(outDir, 'report.md'), markdown + '\n');
    await writeFile(path.join(outDir, 'report.json'), JSON.stringify(json, null, 2) + '\n');
    console.error(`已写入 ${path.join(outDir, 'report.md')} 与 report.json`);
  }
  process.stdout.write((a.json ? JSON.stringify(json, null, 2) : markdown) + '\n');
}

main().catch((e) => { console.error(`扫描失败：${e && e.stack || e}`); process.exit(1); });
