"""Restricted VPS receiver. Install root-owned and invoke through receive.sh.
Publishes only the three fixed website roots; restores previous links on failure.
No vhost, certificate, secret, private application or database is replaced.
"""
import base64
import datetime as dt
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.request

TARGETS = {
    'dist': ('/srv/ahelislab-website', 'https://ahelislab.ch'),
    'dist-vault': ('/srv/ahelis-vault-website', 'https://vault.ahelislab.ch'),
    'dist-business': ('/srv/ahelis-business-website', 'https://business.ahelislab.ch'),
}
MAX_ARCHIVE = 128 * 1024 * 1024
MAX_EXPANDED = 512 * 1024 * 1024
POLICY = (r"default-src 'self'; script-src 'self'(?: 'sha256-[A-Za-z0-9+/]{43}=')+; "
          r"style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; "
          r"connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def unpack(archive_path, destination):
    """Validate every member before extraction; never accept links or special files."""
    with tarfile.open(archive_path) as archive:
        members = archive.getmembers()
        require(len(members) <= 10000, 'Too many archive entries.')
        require(sum(item.size for item in members) <= MAX_EXPANDED, 'Archive expands beyond its limit.')
        names = set()
        for member in members:
            path = PurePosixPath(member.name)
            require(re.fullmatch(r'[A-Za-z0-9._/-]+', member.name) is not None, 'Invalid archive path.')
            require(not path.is_absolute() and '..' not in path.parts and '.' not in path.parts, 'Unsafe archive path.')
            require(member.name not in names, 'Duplicate archive entry.')
            names.add(member.name)
            allowed = path.parts and (path.parts[0] in TARGETS or member.name in ('server/contact.mjs', 'release.json'))
            require(allowed and member.isfile(), 'Unexpected archive member or non-regular file.')
        archive.extractall(destination, filter='data')
    manifest = json.loads((destination / 'release.json').read_text(encoding='utf-8'))
    require(re.fullmatch(r'(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[A-Za-z0-9.-]+)?', manifest['version']) is not None, 'Invalid version.')
    require(re.fullmatch(r'[0-9a-f]{40}', manifest['commit']) is not None, 'Invalid commit.')
    require(set(manifest['files']) == names - {'release.json'}, 'Manifest does not match archive files.')
    for name, checksum in manifest['files'].items():
        require(re.fullmatch(r'[0-9a-f]{64}', checksum) is not None, 'Invalid checksum.')
        require(digest((destination / name).read_bytes()) == checksum, f'Checksum mismatch: {name}')
    require('server/contact.mjs' in manifest['files'], 'Contact service is missing.')
    return manifest


def security_headers(directory):
    lines = (directory / '_headers').read_text(encoding='utf-8').split('\n/assets/*', 1)[0].splitlines()[1:]
    headers = {}
    for line in lines:
        if line.strip():
            name, value = line.strip().split(': ', 1)
            require(name not in headers and not any(char in value for char in '\\"$\r\n'), 'Unsafe security header.')
            headers[name] = value
    fixed = {'Strict-Transport-Security': 'max-age=31536000',
             'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
             'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'X-Robots-Tag': 'noindex, nofollow'}
    require(set(headers) == set(fixed) | {'Content-Security-Policy'}, 'Unexpected security header set.')
    require(all(headers[key] == value for key, value in fixed.items()), 'Security headers changed unexpectedly.')
    require(re.fullmatch(POLICY, headers['Content-Security-Policy']) is not None, 'Unsupported CSP.')
    return headers


def verify_builds(payload):
    builds = {}
    for name, (_, origin) in TARGETS.items():
        directory = payload / name
        info = json.loads((directory / 'build-info.json').read_text(encoding='utf-8'))
        require(info['siteUrl'] == origin and info['agencyUrl'] == 'https://ahelislab.ch', 'Build origin mismatch.')
        require(info['indexable'] is False, 'Indexing requires a separately approved deployment policy.')
        require(info['pages'] and info['errors'] == ['/404.html', '/en/404.html'], 'Invalid page manifest.')
        require(set(info['assets']) == {'css', 'js'}, 'Unexpected asset manifest.')
        require(all(re.fullmatch(r'site\.[0-9a-f]{10}\.(?:css|js)', asset) for asset in info['assets'].values()), 'Unsafe asset path.')
        for path in info['pages'] + info['errors']:
            require(re.fullmatch(r'/(?:[a-z0-9-]+/)*(?:404\.html)?', path) is not None, 'Unsafe page route.')
            html = (directory / (path.lstrip('/') + ('' if path.endswith('.html') else 'index.html'))).read_text(encoding='utf-8')
            schema = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
            require(schema is not None, 'Page schema is missing.')
            token = base64.b64encode(hashlib.sha256(schema[1].encode()).digest()).decode()
            require(f"'sha256-{token}'" in security_headers(directory)['Content-Security-Policy'], 'Page CSP hash mismatch.')
        redirects = ['/confidentialite/', '/en/privacy/'] if name == 'dist' else ['/privacy/', '/confidentialite/', '/en/privacy/']
        expected = {path: 'https://ahelislab.ch/privacy/' for path in redirects}
        require(info['redirects'] == expected, 'Unexpected redirect destinations.')
        config = ''.join(f'location = {path} {{ return 301 {target}; }}\n' for path, target in expected.items())
        require((directory / 'nginx-redirects.conf').read_text(encoding='utf-8') == config, 'Unexpected Nginx redirect directives.')
        # Regenerate trusted header directives instead of accepting executable Nginx syntax.
        config = ''.join(f'add_header {key} "{value}" always;\n' for key, value in security_headers(directory).items())
        (directory / 'nginx-security-headers.conf').write_text(config)
        builds[name] = info
    return builds


def activate(releases, previous, switch, reload_nginx, restart_contact, check, contact_changed):
    """Rollback partial switches, Nginx failures, readiness failures and HTTP regressions."""
    changed = []
    try:
        for name, release in releases.items():
            switch(name, release)
            changed.append(name)
        reload_nginx()
        if contact_changed:
            restart_contact()
        check()
    except BaseException:
        for name in reversed(changed):
            switch(name, previous[name])
        reload_nginx()
        if contact_changed:
            restart_contact()
        raise


def get(url):
    request = urllib.request.Request(url, headers={'Accept-Encoding': 'identity', 'User-Agent': 'Ahelis-deployment-check'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                return response.status, response.read(), response.headers
        except urllib.error.HTTPError as error:
            return error.code, error.read(), error.headers
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(1)


def verify_page(url, expected_status, expected_content, headers):
    """Allow old Nginx workers to drain, while retaining exact response checks."""
    for attempt in range(10):
        status, content, actual_headers = get(url)
        mismatch = ('Unexpected HTTP status' if status != expected_status else
                    'Published HTML mismatch' if digest(content) != digest(expected_content) else
                    'Published headers mismatch' if any(actual_headers.get(key) != value for key, value in headers.items()) else None)
        if mismatch is None:
            return
        if attempt < 9:
            time.sleep(0.2)
    raise ValueError(f'{mismatch}: {url}')


def smoke(payload, builds):
    checked = 0
    for name, info in builds.items():
        origins = ['https://ahelislab.ch', 'https://ahelis.ch'] if name == 'dist' else [TARGETS[name][1]]
        headers = security_headers(payload / name)
        for origin in origins:
            for path in info['pages'] + info['errors']:
                expected_file = payload / name / (path.lstrip('/') + ('' if path.endswith('.html') else 'index.html'))
                verify_page(origin + path, 404 if path in info['errors'] else 200, expected_file.read_bytes(), headers)
                checked += 1
            for asset in info['assets'].values():
                status, content, _ = get(origin + '/assets/' + asset)
                require(status == 200 and digest(content) == digest((payload / name / 'assets' / asset).read_bytes()), 'Published asset mismatch.')
    require(get('http://127.0.0.1:4201/health/ready')[0] == 200, 'Contact service is not ready.')
    require(get('https://business.ahelislab.ch/login')[0] == 200, 'Business login is unavailable.')
    require(get('https://business.ahelislab.ch/manager')[0] == 200, 'Business manager route is unavailable.')
    require(get('https://business.ahelislab.ch/api/categories')[0] == 401, 'Business authentication protection failed.')
    print(f'Published HTML, security headers and assets verified: {checked} pages; contact and private routes passed.')


def deploy(payload, manifest, builds):
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    name = f"{manifest['version']}-{manifest['commit'][:12]}-{stamp}"
    previous, releases = {}, {}
    for site, (base, _) in TARGETS.items():
        root = Path(base)
        require(root.is_dir() and not root.is_symlink(), 'Unexpected website root.')
        previous[site] = (root / 'current').resolve(strict=True)
        require(previous[site].parent == root / 'releases', 'Current release escapes the website root.')
        releases[site] = root / 'releases' / name
        require(not releases[site].exists(), 'Release already exists.')
    old_downloads = previous['dist-vault'] / 'dist-vault/downloads'
    if old_downloads.exists():
        require(all((payload / 'dist-vault/downloads' / path.relative_to(old_downloads)).is_file()
                    for path in old_downloads.rglob('*') if path.is_file()), 'Refusing to remove an active Vault installer.')
    contact_changed = digest((payload / 'server/contact.mjs').read_bytes()) != digest((previous['dist'] / 'server/contact.mjs').read_bytes())
    for site, release in releases.items():
        release.mkdir(mode=0o750)
        shutil.copytree(payload / site, release / site)
        if site == 'dist':
            (release / 'server').mkdir()
            shutil.copyfile(payload / 'server/contact.mjs', release / 'server/contact.mjs')
            shutil.copyfile(payload / site / 'nginx-security-headers.conf', release / 'nginx-security-headers.conf')
        for path in [release, *release.rglob('*')]:
            os.chown(path, 0, __import__('grp').getgrnam('www-data').gr_gid)
            path.chmod(0o750 if path.is_dir() else 0o640)
    receipt = Path('/var/backups/ahelis-websites') / name
    receipt.mkdir(mode=0o700, parents=True)
    (receipt / 'previous-releases.json').write_text(json.dumps({key: str(value) for key, value in previous.items()}, indent=2))

    def switch(site, target):
        root = Path(TARGETS[site][0])
        temporary = root / ('current.next-' + manifest['commit'][:12])
        temporary.symlink_to(target)
        os.replace(temporary, root / 'current')

    def reload_nginx():
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)

    activate(releases, previous, switch, reload_nginx,
             lambda: subprocess.run(['systemctl', 'restart', 'ahelis-contact.service'], check=True),
             lambda: smoke(payload, builds), contact_changed)
    (receipt / 'deployed.json').write_text(json.dumps({'version': manifest['version'], 'commit': manifest['commit'], 'release': name}, indent=2))
    print(f'Deployed {name}; previous releases retained in {receipt}.')


def main():
    import fcntl
    require(os.geteuid() == 0, 'Receiver must run as root through its restricted entry point.')
    with open('/run/lock/ahelis-websites-deploy.lock', 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        with tempfile.TemporaryDirectory(prefix='ahelis-websites-') as work:
            directory = Path(work)
            archive = directory / 'payload.tgz'
            with archive.open('wb') as output:
                total = 0
                while chunk := sys.stdin.buffer.read(1024 * 1024):
                    total += len(chunk)
                    require(total <= MAX_ARCHIVE, 'Archive exceeds its upload limit.')
                    output.write(chunk)
            payload = directory / 'payload'
            payload.mkdir()
            manifest = unpack(archive, payload)
            builds = verify_builds(payload)
            deploy(payload, manifest, builds)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Website deployment failed: {error}', file=sys.stderr)
        sys.exit(1)
