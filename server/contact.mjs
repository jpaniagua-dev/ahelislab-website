// Receive contact enquiries and send a single email through Resend.
// Usage: node server/contact.mjs with the protected environment described in deploy/README.md.
// Rollback: stop this service and restore the previous static release and vhost.
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const projects = {
  website: ['Un site web', 'A website'], redesign: ['Une refonte', 'A redesign'],
  design: ['Du design UX/UI', 'UX/UI design'], custom: ['Une application sur mesure', 'A custom application'],
  automation: ['De l’IA ou de l’automatisation', 'AI or automation'], explore: ['Une idée à explorer', 'An idea to explore']
};
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const maxBodyBytes = 32 * 1024;
class RequestError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}

export function loadConfig(env = process.env) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.CONTACT_FROM?.trim();
  const to = 'hello@ahelislab.ch';
  const allowedOrigins = (env.CONTACT_ALLOWED_ORIGINS || 'https://ahelis.ch,https://ahelislab.ch').split(',').map(value => value.trim());
  if (!apiKey || !from || /[\r\n]/.test(from)) throw new Error('RESEND_API_KEY and CONTACT_FROM are required.');
  const sender = from.match(/<([^<>]+)>$/)?.[1] || from;
  if (!emailPattern.test(sender)) throw new Error('CONTACT_FROM must contain a valid sender address.');
  for (const origin of allowedOrigins) if (new URL(origin).origin !== origin) throw new Error('CONTACT_ALLOWED_ORIGINS must contain exact origins.');
  const port = Number(env.CONTACT_PORT || 4201);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('CONTACT_PORT is invalid.');
  return { apiKey, from, to, allowedOrigins, port, timeoutMs: 10000 };
}

function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError(400, 'invalid');
  const read = (field, max, min = 1) => {
    if (typeof body[field] !== 'string') throw new RequestError(400, 'invalid');
    const value = body[field].trim();
    if (value.length < min || value.length > max || /\u0000/.test(value)) throw new RequestError(400, 'invalid');
    return value;
  };
  const name = read('name', 120);
  const email = read('email', 254);
  const project = read('project', 20);
  const message = read('message', 8000);
  const locale = read('locale', 2);
  const requestId = read('requestId', 36);
  if (!emailPattern.test(email) || /[\r\n]/.test(name) || !Object.hasOwn(projects, project) || !['fr', 'en'].includes(locale) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId) || body.company) throw new RequestError(400, 'invalid');
  return { name, email, project, message, locale, requestId };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let exceeded = false;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        chunks.length = 0;
        if (!exceeded) reject(new RequestError(413, 'too_large'));
        exceeded = true;
      } else if (!exceeded) chunks.push(chunk);
    });
    request.on('end', () => {
      if (exceeded) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new RequestError(400, 'invalid')); }
    });
    request.on('error', () => reject(new RequestError(400, 'invalid')));
  });
}

export function createContactServer(config, { fetchImpl = fetch, now = Date.now, log = console.log } = {}) {
  const attempts = new Map();
  let globalWindow = { start: now(), count: 0 };
  const reply = (response, status, code) => {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...(status === 429 ? { 'Retry-After': '600' } : {}) });
    response.end(JSON.stringify({ ok: status === 200, code }));
  };
  const server = createServer(async (request, response) => {
    try {
      if (request.url === '/health/ready' && request.method === 'GET') return reply(response, 200, 'ready');
      if (request.url !== '/api/contact') throw new RequestError(404, 'not_found');
      if (request.method !== 'POST') throw new RequestError(405, 'method');
      if (!config.allowedOrigins.includes(request.headers.origin)) throw new RequestError(403, 'origin');
      if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '')) throw new RequestError(415, 'content_type');
      // Nginx overwrites X-Real-IP; the service listens on loopback only.
      const ip = String(request.headers['x-real-ip'] || request.socket.remoteAddress);
      const ipKey = createHash('sha256').update(ip).digest('hex');
      const time = now();
      for (const [key, value] of attempts) if (time - value.start > 600000) attempts.delete(key);
      const window = attempts.get(ipKey) || { start: time, count: 0 };
      if (time - globalWindow.start > 3600000) globalWindow = { start: time, count: 0 };
      if (window.count >= 5 || globalWindow.count >= 60 || attempts.size >= 10000) throw new RequestError(429, 'rate_limited');
      window.count++;
      globalWindow.count++;
      attempts.set(ipKey, window);
      const body = validate(await readBody(request));
      const project = projects[body.project][body.locale === 'fr' ? 0 : 1];
      const text = `Ahelis Lab — Contact\n\n${body.name}\n${body.email}\n${project}\n\n${body.message}`;
      const payload = { from: config.from, to: [config.to], reply_to: body.email, subject: `Ahelis Lab — ${project}`, text };
      // Reuse the same provider key when retrying an unchanged enquiry.
      const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
      const upstream = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `ahelis-contact/${body.requestId}/${digest}` },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(config.timeoutMs)
      });
      const result = await upstream.json().catch(() => ({}));
      if (!upstream.ok || typeof result.id !== 'string' || !result.id || result.error) {
        log(JSON.stringify({ event: 'contact_send_failed', providerStatus: upstream.status }));
        throw new RequestError(502, 'send_failed');
      }
      // Never log enquiry contents, addresses or visitor IPs.
      log(JSON.stringify({ event: 'contact_send_accepted', emailId: result.id }));
      return reply(response, 200, 'sent');
    } catch (error) {
      if (!(error instanceof RequestError)) log(JSON.stringify({ event: 'contact_send_failed', code: 'transport' }));
      return reply(response, error.status || 502, error.code || 'send_failed');
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = loadConfig();
  createContactServer(config).listen(config.port, '127.0.0.1', () => console.log(`Contact API listening on loopback:${config.port}`));
}
