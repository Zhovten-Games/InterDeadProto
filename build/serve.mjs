import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
export async function serve(directory, { port = 0, prefix = '/' } = {}) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    try {
      if (!url.pathname.startsWith(prefix)) {
        response.writeHead(404);
        response.end();
        return;
      }
      const relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
      const file = path.resolve(directory, relative);
      if (!file.startsWith(path.resolve(directory) + path.sep) || !(await stat(file)).isFile()) {
        response.writeHead(404);
        response.end();
        return;
      }
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.end(await readFile(file));
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
}
