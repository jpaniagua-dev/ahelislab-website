"""Package verified public builds. Run: python3 deploy/package.py --output FILE --commit SHA.
Only the archive is written; remove it to undo packaging. No credentials are included.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import tarfile

ROOT = Path(__file__).resolve().parents[1]


def package(output, commit):
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('A full Git commit is required.')
    version = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
    files = {}
    for directory in ('dist', 'dist-vault', 'dist-business'):
        if not (ROOT / directory / 'build-info.json').is_file():
            raise ValueError(f'Missing build: {directory}')
        for path in sorted((ROOT / directory).rglob('*')):
            if path.is_symlink():
                raise ValueError('Builds cannot contain symlinks.')
            if path.is_file():
                files[path.relative_to(ROOT).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    contact = ROOT / 'server/contact.mjs'
    files['server/contact.mjs'] = hashlib.sha256(contact.read_bytes()).hexdigest()
    manifest = json.dumps({'version': version, 'commit': commit, 'files': files}, sort_keys=True).encode()
    with tarfile.open(output, 'w:gz') as archive:
        for name in files:
            archive.add(ROOT / name, arcname=name, recursive=False)
        entry = tarfile.TarInfo('release.json')
        entry.size = len(manifest)
        entry.mode = 0o640
        archive.addfile(entry, io.BytesIO(manifest))
    print(f'Packaged {version} ({commit[:12]}), {len(files)} public files.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    parser.add_argument('--commit', required=True)
    args = parser.parse_args()
    package(args.output, args.commit)
