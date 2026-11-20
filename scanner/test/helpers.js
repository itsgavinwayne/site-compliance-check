// 测试工具：本地静态服务器 + 扫描封装
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collect } from '../src/crawl.js';
import { loadRegistry } from '../src/registry.js';
import { runAll } from '../src/run.js';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png' };

export async function startServer() {
  const log = [];
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost');
    log.push({ path: u.pathname, headers: req.headers });
    let p = decodeURIComponent(u.pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(FIXTURES, path.normalize(p));
    if (!file.startsWith(FIXTURES)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/html' }).end('<!doctype html><title>404</title><h1>Not found</h1>');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, log, close: () => new Promise((r) => server.close(r)) };
}

export const TEST_OPTS = { offline: true, settle: 200, idle: 1500, timeout: 15000 };

export async function scanFixture(url, opts = {}) {
  const registry = await loadRegistry();
  const ctx = await collect(url, { ...TEST_OPTS, ...opts });
  const results = await runAll(registry, ctx);
  const by = Object.fromEntries(results.map((r) => [r.id, r]));
  return { ctx, results, by };
}
