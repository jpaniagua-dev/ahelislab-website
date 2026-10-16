import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { loadDownload } from '../src/vault/download.mjs';
import { vaultPages } from '../src/vault/site.mjs';

test('unconfigured downloads remain unavailable in both languages', async () => {
  assert.equal(await loadDownload(undefined, 'unused'), null);
  const pages = vaultPages({ download: null, email: 'hello@ahelislab.ch' }).filter(p => p.basePath === '/telecharger/');
  for (const page of pages) assert.ok(!page.content.includes('href="/downloads/'));
});

test('rejects private paths, missing files, mismatched hashes and invalid signatures', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vault-web-download-'));
  const manifestPath = join(root, 'manifest.json');
  const bytes = Buffer.from('Fictional installer fixture, not executable');
  const manifest = { product: 'Ahelis Vault', version: '0.4.0', url: '/downloads/0.4.0/Ahelis-Vault-setup.exe', sha256: createHash('sha256').update(bytes).digest('hex'), publisher: 'CN=Example Publisher' };
  const save = value => writeFile(manifestPath, JSON.stringify(value));
  const acceptSignature = { verifySignature: async () => {} };
  try {
    for (const change of [{ url: '/clients/private.exe' }, { url: '/downloads/0.4.0/../private.exe' }, { product: 'Client Vault' }]) {
      await save({ ...manifest, ...change });
      await assert.rejects(loadDownload(manifestPath, root, acceptSignature));
    }
    await save(manifest);
    await assert.rejects(loadDownload(manifestPath, root, acceptSignature));
    await mkdir(join(root,'downloads/0.4.0'), { recursive: true });
    await writeFile(join(root, `.${manifest.url}`), bytes);
    await save({ ...manifest, sha256: '0'.repeat(64) });
    await assert.rejects(loadDownload(manifestPath, root, acceptSignature), /checksum/);
    await save(manifest);
    await assert.rejects(loadDownload(manifestPath, root, { verifySignature: async () => { throw Error('Invalid signature'); } }), /Invalid signature/);
    // Signature boundary is mocked; no real installer is published by this test.
    const download = await loadDownload(manifestPath, root, acceptSignature);
    assert.equal(download.size, bytes.length);
    for (const page of vaultPages({ download, email: 'hello@ahelislab.ch' }).filter(p => p.basePath === '/telecharger/')) {
      assert.ok(page.content.includes(manifest.url) && page.content.includes(manifest.sha256));
      assert.ok(!page.content.includes('coming soon.') && !page.content.includes('bientôt disponible.'));
    }
    await assert.rejects(loadDownload(manifestPath, root));
  } finally { await rm(root, { recursive: true, force: true }); }
});
