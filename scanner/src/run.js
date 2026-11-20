// 按 registry 逐条执行检查。异常、缺检查函数、返回值不合法 → error；绝不默认 pass。
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const STATUSES = ['pass', 'fail', 'manual', 'na', 'error'];
const CHECK_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'checks');

export const checkFile = (id) => path.join(CHECK_DIR, `${id}.js`);

export function normalizeResult(r) {
  if (!r || typeof r !== 'object' || !STATUSES.includes(r.status)) {
    return { status: 'error', evidence: [], note: `检查函数返回了无效结果：${JSON.stringify(r)?.slice(0, 100)}` };
  }
  return {
    status: r.status,
    evidence: Array.isArray(r.evidence) ? r.evidence.map(String) : r.evidence ? [String(r.evidence)] : [],
    note: r.note ? String(r.note) : '',
  };
}

const defaultLoader = (id) => {
  if (!existsSync(checkFile(id))) throw new Error(`缺少检查函数 checks/${id}.js`);
  return import(pathToFileURL(checkFile(id)).href);
};

export async function runCheck(rule, ctx, loader = defaultLoader) {
  if (rule.check === 'manual') return { status: 'manual', evidence: [], note: '只能人工确认', automated: false };
  let fn;
  try {
    fn = (await loader(rule.id)).default;
    if (typeof fn !== 'function') throw new Error(`checks/${rule.id}.js 没有默认导出函数`);
  } catch (e) {
    return { status: 'error', evidence: [], note: String(e.message || e), automated: true };
  }
  try {
    return { ...normalizeResult(await fn(ctx)), automated: true };
  } catch (e) {
    return { status: 'error', evidence: [], note: `检查出错：${String((e && e.message) || e).split('\n')[0]}`, automated: true };
  }
}

export async function runAll(registry, ctx, loader) {
  const results = [];
  for (const rule of registry.rules) {
    const r = await runCheck(rule, ctx, loader);
    results.push({ id: rule.id, category: rule.category, missing: rule.missing, markets: rule.markets, level: rule.level, condition: rule.condition || null, check: rule.check, ...r });
  }
  return results;
}
