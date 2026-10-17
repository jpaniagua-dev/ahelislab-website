"""Exercise archive boundaries and rollback without a VPS, credentials or real data.
Run: python3 -m unittest discover -s tests -p test_deploy.py.
"""
import hashlib
import base64
import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('website_receiver', Path(__file__).resolve().parents[1] / 'deploy/receive.py')
receiver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(receiver)


class DeploymentTests(unittest.TestCase):
    def archive(self, members, checksums=None):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        directory = Path(temporary.name)
        archive = directory / 'payload.tgz'
        manifest = {'version': '0.11.0', 'commit': 'a' * 40,
                    'files': checksums if checksums is not None else {name: hashlib.sha256(data).hexdigest() for name, data, kind in members if kind == 'file'}}
        with tarfile.open(archive, 'w:gz') as output:
            for name, data, kind in members + [('release.json', json.dumps(manifest).encode(), 'file')]:
                entry = tarfile.TarInfo(name)
                if kind == 'symlink':
                    entry.type = tarfile.SYMTYPE
                    entry.linkname = '/etc/passwd'
                else:
                    entry.size = len(data)
                output.addfile(entry, io.BytesIO(data) if kind == 'file' else None)
        destination = directory / 'payload'
        destination.mkdir()
        return archive, destination

    def test_manifest_checksums_and_contact_are_required(self):
        archive, destination = self.archive([('dist/index.html', b'public page', 'file'), ('server/contact.mjs', b'// synthetic', 'file')])
        self.assertEqual(receiver.unpack(archive, destination)['version'], '0.11.0')
        archive, destination = self.archive([('server/contact.mjs', b'// synthetic', 'file')], {'server/contact.mjs': '0' * 64})
        with self.assertRaisesRegex(ValueError, 'Checksum mismatch'):
            receiver.unpack(archive, destination)

    def test_traversal_links_duplicates_and_unexpected_members_are_rejected(self):
        for members in [[('../escape', b'x', 'file')], [('/etc/passwd', b'x', 'file')],
                        [('dist/link', b'', 'symlink')], [('server/private.env', b'x', 'file')],
                        [('dist/index.html', b'a', 'file'), ('dist/index.html', b'b', 'file')]]:
            with self.subTest(members=members):
                archive, destination = self.archive(members)
                with self.assertRaises(ValueError):
                    receiver.unpack(archive, destination)
                self.assertEqual(list(destination.iterdir()), [])

    def test_nginx_header_injection_and_csp_weakening_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            common = "/*\n  Strict-Transport-Security: max-age=31536000\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Robots-Tag: noindex, nofollow\n"
            for policy in ['unsafe', 'default-src https://attacker.example', '"; include /etc/private; #', '$request_uri']:
                (directory / '_headers').write_text(common + '  Content-Security-Policy: ' + policy + '\n')
                with self.subTest(policy=policy), self.assertRaises(ValueError):
                    receiver.security_headers(directory)

    def test_utf8_page_schemas_and_generated_headers_are_accepted(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            schema = json.dumps({'name': 'T\u00e9moin fran\u00e7ais'}, ensure_ascii=False)
            token = base64.b64encode(hashlib.sha256(schema.encode('utf-8')).digest()).decode()
            policy = (f"default-src 'self'; script-src 'self' 'sha256-{token}'; style-src 'self' 'unsafe-inline'; "
                      "img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; "
                      "base-uri 'self'; form-action 'self'; frame-ancestors 'self'")
            for name, (_, origin) in receiver.TARGETS.items():
                directory = root / name
                (directory / 'en').mkdir(parents=True)
                for page in ['index.html', '404.html', 'en/404.html']:
                    (directory / page).write_text('<script type="application/ld+json">' + schema + '</script>', encoding='utf-8')
                redirects = ['/confidentialite/', '/en/privacy/'] if name == 'dist' else ['/privacy/', '/confidentialite/', '/en/privacy/']
                mapping = {path: 'https://ahelislab.ch/privacy/' for path in redirects}
                info = {'siteUrl': origin, 'agencyUrl': 'https://ahelislab.ch', 'indexable': False,
                        'pages': ['/'], 'errors': ['/404.html', '/en/404.html'], 'redirects': mapping,
                        'assets': {'css': 'site.abcdef1234.css', 'js': 'site.abcdef1234.js'}}
                (directory / 'build-info.json').write_text(json.dumps(info), encoding='utf-8')
                (directory / '_headers').write_text('/*\n  Strict-Transport-Security: max-age=31536000\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Robots-Tag: noindex, nofollow\n  Content-Security-Policy: ' + policy + '\n', encoding='utf-8')
                (directory / 'nginx-redirects.conf').write_text(''.join(f'location = {path} {{ return 301 {target}; }}\n' for path, target in mapping.items()), encoding='utf-8')
            self.assertEqual(set(receiver.verify_builds(root)), set(receiver.TARGETS))

    def test_failed_public_check_restores_all_previous_releases(self):
        current = {'agency': 'old-agency', 'business': 'old-business'}
        previous = dict(current)
        reloads, restarts = [], []
        def check():
            raise ValueError('Synthetic HTTP regression')
        with self.assertRaisesRegex(ValueError, 'Synthetic HTTP regression'):
            receiver.activate({'agency': 'new-agency', 'business': 'new-business'}, previous,
                              lambda name, value: current.__setitem__(name, value),
                              lambda: reloads.append(dict(current)), lambda: restarts.append(True), check, True)
        self.assertEqual(current, previous)
        self.assertEqual(len(reloads), 2)
        self.assertEqual(len(restarts), 2)

    def test_partial_switch_failure_restores_only_the_switched_site(self):
        current = {'agency': 'old-agency', 'business': 'old-business'}
        previous = dict(current)
        def switch(name, value):
            if value == 'new-business':
                raise OSError('Synthetic switch failure')
            current[name] = value
        with self.assertRaises(OSError):
            receiver.activate({'agency': 'new-agency', 'business': 'new-business'}, previous,
                              switch, lambda: None, lambda: None, lambda: None, False)
        self.assertEqual(current, previous)


if __name__ == '__main__':
    unittest.main()
