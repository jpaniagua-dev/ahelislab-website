import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createContactServer, loadConfig } from '../server/contact.mjs';

const origin = 'https://ahelislab.ch';
const config = { apiKey: 'test-only', from: 'Ahelis Lab <contact@example.com>', to: 'hello@ahelislab.ch', allowedOrigins: [origin, 'https://vault.ahelislab.ch'], timeoutMs: 100 };
const enquiry = () => ({ name: 'Visitor', email: 'visitor@example.com', project: 'website', message: 'A new website enquiry.', locale: 'en', requestId: randomUUID(), company: '' });
async function withServer(run, fetchImpl = async () => Response.json({ id: 'test-id' })) {
  const server = createContactServer(config, { fetchImpl, log: () => {} });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/api/contact`;
  const post = (body = enquiry(), headers = {}) => fetch(url, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  try { await run(post, url); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('sends to the fixed studio inbox and uses the visitor only as Reply-To', async () => {
  let captured;
  await withServer(async post => {
    const response = await post({ ...enquiry(), to: 'attacker@example.com', message: '<script>Untrusted text</script>' });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).code, 'sent');
    assert.deepEqual(captured.payload.to, ['hello@ahelislab.ch']);
    assert.equal(captured.payload.reply_to, 'visitor@example.com');
    assert.ok(captured.payload.text.includes('<script>Untrusted text</script>'));
    assert.equal(captured.payload.html, undefined);
    assert.equal(captured.payload.subject, 'Ahelis Lab — A website');
  }, async (_, request) => { captured = { payload: JSON.parse(request.body), headers: request.headers }; return Response.json({ id: 'test-id' }); });
});

test('unchanged retries use the same provider idempotency key', async () => {
  const keys = [];
  await withServer(async post => {
    const body = enquiry();
    await post(body); await post(body);
    assert.equal(keys[0], keys[1]);
    assert.ok(keys[0].startsWith(`ahelis-contact/${body.requestId}/`));
  }, async (_, request) => { keys.push(request.headers['Idempotency-Key']); return Response.json({ id: 'same-id' }); });
});

test('rejects cross-origin and missing-origin requests before provider calls', async () => {
  await withServer(async post => {
    assert.equal((await post(enquiry(), { Origin: 'https://other.example' })).status, 403);
    assert.equal((await post(enquiry(), { Origin: '' })).status, 403);
  }, () => { throw new Error('Provider must not be called'); });
});

test('rejects header injection, invalid projects, empty messages and the honeypot', async () => {
  await withServer(async post => {
    for (const changes of [{ email: 'visitor@example.com\r\nBcc: other@example.com' }, { project: '__proto__' }, { message: ' ' }, { company: 'bot' }]) {
      assert.equal((await post({ ...enquiry(), ...changes })).status, 400);
    }
  }, () => { throw new Error('Provider must not be called'); });
});

test('rejects non-JSON and oversized payloads', async () => {
  await withServer(async post => {
    assert.equal((await post(enquiry(), { 'Content-Type': 'text/plain' })).status, 415);
    assert.equal((await post({ ...enquiry(), message: 'a'.repeat(40000) })).status, 413);
  });
});

test('provider rejection or a missing identifier never produces success', async () => {
  for (const reply of [() => Response.json({ error: 'rejected' }, { status: 403 }), () => Response.json({})]) {
    await withServer(async post => {
      const response = await post();
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), { ok: false, code: 'send_failed' });
    }, reply);
  }
});

test('transport errors do not expose internal details', async () => {
  await withServer(async post => {
    const response = await post();
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('private transport detail'));
  }, () => { throw new Error('private transport detail'); });
});

test('rate limits protect the fixed inbox', async () => {
  await withServer(async post => {
    for (let i = 0; i < 5; i++) assert.equal((await post()).status, 200);
    const response = await post();
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('retry-after'), '600');
  });
});

test('credentials are mandatory and destinations are never environment-controlled', () => {
  assert.throws(() => loadConfig({}));
  const values = loadConfig({ RESEND_API_KEY: 'test-only', CONTACT_FROM: 'Studio <contact@example.com>', CONTACT_TO: 'attacker@example.com' });
  assert.equal(values.to, 'hello@ahelislab.ch');
  assert.throws(() => loadConfig({ RESEND_API_KEY: 'test-only', CONTACT_FROM: 'bad\r\nvalue' }));
});

test('Vault enquiries accept the explicitly configured product origin and keep the fixed recipient', async () => {
  let payload;
  await withServer(async post => {
    assert.equal((await post({ ...enquiry(), project: 'vault' }, { Origin: 'https://vault.ahelislab.ch' })).status, 200);
    assert.equal(payload.subject, 'Ahelis Lab — Ahelis Vault');
    assert.deepEqual(payload.to, ['hello@ahelislab.ch']);
    assert.equal((await post({ ...enquiry(), project: 'vault' }, { Origin: 'https://untrusted.ahelislab.ch' })).status, 403);
  }, async (_, request) => { payload = JSON.parse(request.body); return Response.json({ id: 'vault-test' }); });
});
