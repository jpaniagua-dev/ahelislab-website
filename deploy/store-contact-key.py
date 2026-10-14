#!/usr/bin/env python3
"""Store a dedicated sending key through a hidden SSH terminal prompt.

Usage: sudo python3 store-contact-key.py from an interactive SSH terminal.
Rollback: stop the contact service before removing its protected environment file.
The key is never printed or passed as a command argument.
"""
import getpass
import os
import argparse
import subprocess
from pathlib import Path

target = Path('/etc/ahelis-contact.env')
parser = argparse.ArgumentParser()
parser.add_argument('--replace-provisional', action='store_true')
args = parser.parse_args()
if target.exists() and not args.replace_provisional:
    raise SystemExit('Contact environment already exists; refusing to replace it.')
if args.replace_provisional and subprocess.run(['systemctl', 'is-active', '--quiet', 'ahelis-contact.service']).returncode == 0:
    raise SystemExit('Refusing to replace credentials of a running service.')
key = getpass.getpass('Resend sending key (hidden): ').strip()
if not key.startswith('re_') or len(key) < 20 or any(character.isspace() for character in key):
    raise SystemExit('Invalid sending key format.')
contents = '\n'.join([
    'RESEND_API_KEY=' + key,
    'CONTACT_FROM="Ahelis Lab <hello@ahelislab.ch>"',
    'CONTACT_ALLOWED_ORIGINS=https://ahelis.ch,https://ahelislab.ch',
    'CONTACT_PORT=4201', ''
])
temporary = target.with_suffix('.env.new')
descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(descriptor, 'w') as file:
    file.write(contents)
os.replace(temporary, target)
print('Protected contact environment stored. No credential printed.')
