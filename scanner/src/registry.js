// 读取 rules/registry.yaml（只读契约）
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import YAML from 'yaml';

export const DEFAULT_REGISTRY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../rules/registry.yaml');

export async function loadRegistry(file = process.env.SCC_REGISTRY || DEFAULT_REGISTRY) {
  const doc = YAML.parse(await readFile(file, 'utf8'));
  if (!doc || !Array.isArray(doc.rules)) throw new Error(`registry 格式错误：${file}`);
  for (const r of doc.rules) {
    for (const k of ['id', 'category', 'missing', 'markets', 'level', 'check']) {
      if (r[k] == null) throw new Error(`registry 规则 ${r.id || '?'} 缺字段 ${k}`);
    }
  }
  return { version: doc.version, rules: doc.rules.filter((r) => !r.deprecated) };
}
