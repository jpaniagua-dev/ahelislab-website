import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, sep } from 'node:path';

// Only publish a locally verified, signed neutral installer. Client builds never enter this path.
export async function loadDownload(manifestPath, directory, { verifySignature = verifyWindowsSignature } = {}) {
  if (!manifestPath) return null;
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const { version, url, sha256, product, publisher } = manifest;
  if (product !== 'Ahelis Vault' || !/^\d+\.\d+\.\d+$/.test(version) || !/^[a-f0-9]{64}$/.test(sha256) || typeof publisher !== 'string' || !publisher.trim()) throw new Error('Invalid public Vault download manifest.');
  if (typeof url !== 'string' || !new RegExp(`^/downloads/${version.replaceAll('.', '\\.')}/[A-Za-z0-9._-]+\\.exe$`).test(url)) throw new Error('Download URL must identify a versioned public installer.');
  const root = resolve(directory);
  const file = resolve(root, `.${url}`);
  if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) throw new Error('Public installer is missing.');
  if (createHash('sha256').update(await readFile(file)).digest('hex') !== sha256) throw new Error('Public installer checksum mismatch.');
  await verifySignature(file, publisher);
  return { version, url, sha256, size: (await stat(file)).size, file };
}

function verifyWindowsSignature(file, publisher) {
  if (process.platform !== 'win32') throw new Error('Public download activation requires Authenticode verification on Windows. Build previews without a manifest elsewhere.');
  const script = "$s = Get-AuthenticodeSignature -LiteralPath $env:VAULT_VERIFY_INSTALLER; $v = (Get-Item -LiteralPath $env:VAULT_VERIFY_INSTALLER).VersionInfo; [pscustomobject]@{status=[string]$s.Status; subject=$s.SignerCertificate.Subject; product=$v.ProductName} | ConvertTo-Json -Compress";
  const signature = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', env: { ...process.env, VAULT_VERIFY_INSTALLER: file } }));
  if (signature.status !== 'Valid' || signature.subject !== publisher || signature.product !== 'Ahelis Vault') throw new Error('Public installer signature, publisher or product mismatch.');
}
