import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';
import { config } from './config.js';
import { logger } from './logger.js';
import {
  getStatus,
  getTop,
  getTimeline,
  getRecentEvents,
  getSuggestions,
} from './analysis/queries.js';

const HOST = '127.0.0.1';
const PORT = Number(process.env.ACTIONSPY_UI_PORT) || 3046;
const WEB_DIR = path.join(config.projectRoot, 'web', 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.map':  'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
};

let startedAt = null;

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  });
  res.end(payload);
}

function notFound(res) {
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('404\n');
}

function serveStatic(reqUrl, res) {
  let urlPath = decodeURIComponent(reqUrl.pathname);
  if (urlPath.includes('..')) return notFound(res);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(WEB_DIR, urlPath);
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const indexPath = path.join(WEB_DIR, 'index.html');
      fs.stat(indexPath, (err2, s2) => {
        if (err2 || !s2.isFile()) {
          res.writeHead(503, { 'content-type': 'text/plain' });
          res.end(
            'Dashboard not built yet. Run:\n  cd web && npm install && npm run build\n'
          );
          return;
        }
        streamFile(indexPath, res);
      });
      return;
    }
    streamFile(filePath, res);
  });
}

function streamFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'content-type': type,
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  fs.createReadStream(filePath).pipe(res);
}

function handle(req, res) {
  const reqUrl = new URL(req.url, `http://${HOST}:${PORT}`);
  const p = reqUrl.pathname;
  const q = Object.fromEntries(reqUrl.searchParams);

  try {
    if (p === '/api/status') {
      const status = getStatus();
      status.uptime_seconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      status.started_at = startedAt;
      return json(res, 200, status);
    }
    if (p === '/api/top') {
      const type = q.type || 'zsh';
      return json(res, 200, { type, days: Number(q.days) || 14, rows: getTop({ type, days: q.days, limit: q.limit }) });
    }
    if (p === '/api/timeline') {
      const type = q.type || 'zsh';
      return json(res, 200, { type, days: Number(q.days) || 7, buckets: getTimeline({ type, days: q.days }) });
    }
    if (p === '/api/events') {
      const type = q.type || 'zsh';
      return json(res, 200, { type, rows: getRecentEvents({ type, limit: q.limit }) });
    }
    if (p === '/api/suggest') {
      return json(res, 200, getSuggestions({ days: q.days, limit: q.limit }));
    }
    if (p.startsWith('/api/')) {
      return json(res, 404, { error: 'unknown endpoint', path: p });
    }
    serveStatic(reqUrl, res);
  } catch (err) {
    logger.error('http handler error', { path: p, err: err.message });
    json(res, 500, { error: err.message });
  }
}

let server = null;

export function startServer() {
  if (server) return server;
  server = http.createServer(handle);
  server.on('error', (err) => logger.error('http server error', { err: err.message }));
  server.listen(PORT, HOST, () => {
    startedAt = Date.now();
    logger.info('http server listening', { host: HOST, port: PORT, web_dir: WEB_DIR });
  });
  return server;
}

export async function stopServer() {
  if (!server) return;
  await new Promise((resolve) => server.close(resolve));
  server = null;
}
