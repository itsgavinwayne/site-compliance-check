// 编程接口：scan(url, opts) → { ctx, results, json, markdown }
import { collect } from './crawl.js';
import { loadRegistry } from './registry.js';
import { runAll } from './run.js';
import { buildJson, buildMarkdown, relPaths } from './report.js';

export async function scan(url, opts = {}) {
  const registry = await loadRegistry(opts.registry);
  const ctx = await collect(url, opts);
  const results = relPaths(await runAll(registry, ctx), opts.outDir);
  const json = buildJson(ctx, results, { registryVersion: registry.version });
  return { ctx, results, json, markdown: buildMarkdown(json) };
}
export { collect, loadRegistry, runAll, buildJson, buildMarkdown };
