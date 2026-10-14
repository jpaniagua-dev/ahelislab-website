// Build and serve the static website locally without third-party dependencies.
// Usage: node scripts/dev.mjs [--port 3000] [--host 0.0.0.0]. Stop with Ctrl+C.
import { createServer, request as proxyRequest } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { build, projectRoot } from './build.mjs';

await build();
const root = resolve(projectRoot, 'dist');
const args = process.argv.slice(2);
const argValue = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : args.find(arg => arg.startsWith(`${name}=`))?.split('=')[1]; };
const port = Number(argValue('--port') || process.env.PORT || 3000);
const host = argValue('--host') || '0.0.0.0';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const server = createServer(async (request, response) => {
  if (request.url === '/api/contact') {
    const upstream = proxyRequest(new URL('/api/contact', process.env.CONTACT_API_ORIGIN || 'http://127.0.0.1:4201'), { method: request.method, headers: request.headers }, proxied => {
      response.writeHead(proxied.statusCode, proxied.headers);
      proxied.pipe(response);
    });
    upstream.on('error', () => { response.writeHead(502, { 'Content-Type': 'application/json' }); response.end('{"ok":false,"code":"send_failed"}'); });
    request.pipe(upstream);
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(`${root}${sep}`)) { response.writeHead(403); response.end(); return; }
    let code = 200;
    try { if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html'); }
    catch { code = 404; path = resolve(root, pathname.startsWith('/en/') ? 'en/404.html' : '404.html'); }
    const content = await readFile(path);
    response.writeHead(code, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(content);
  } catch { response.writeHead(400); response.end('Bad request'); }
});
server.listen(port, host, () => console.log(`Ahelis Lab listening on ${host}:${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
