#!/usr/bin/env bash
# Install the root-owned receiver and a dedicated, forced-command deployment public key.
# Usage: sudo bash deploy/install-receiver.sh /path/to/key.pub. Revoke by removing that key line.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo 'Run the receiver installer as root.' >&2; exit 1; }
[ "$#" = 1 ] || { echo 'Supply the dedicated public key file.' >&2; exit 1; }
ssh-keygen -l -f "$1" >/dev/null
SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
install -d -m 0755 -o root -g root /usr/local/lib/ahelis-websites
install -m 0755 -o root -g root "$SCRIPT_DIR/receive.sh" /usr/local/lib/ahelis-websites/receive.sh
install -m 0644 -o root -g root "$SCRIPT_DIR/receive.py" /usr/local/lib/ahelis-websites/receive.py
python3 - "$1" <<'PY'
from pathlib import Path
import os
import pwd
import re
import sys

public = Path(sys.argv[1]).read_text().strip()
if not re.fullmatch(r'ssh-ed25519 [A-Za-z0-9+/]+=*(?: [^\r\n]+)?', public):
    raise SystemExit('Only a dedicated Ed25519 public key is accepted.')
user = pwd.getpwnam('ubuntu')
directory = Path(user.pw_dir) / '.ssh'
directory.mkdir(mode=0o700, exist_ok=True)
target = directory / 'authorized_keys'
current = target.read_text() if target.exists() else ''
entry = 'restrict,command="/usr/local/lib/ahelis-websites/receive.sh" ' + public
matching = [line for line in current.splitlines() if public.split()[1] in line]
if matching and matching != [entry]:
    raise SystemExit('This key already exists with different restrictions.')
if not matching:
    target.write_text(current.rstrip('\n') + '\n' + entry + '\n')
os.chown(directory, user.pw_uid, user.pw_gid)
directory.chmod(0o700)
os.chown(target, user.pw_uid, user.pw_gid)
target.chmod(0o600)
print('Dedicated website key installed with forced-command and forwarding restrictions.')
PY
