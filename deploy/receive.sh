#!/usr/bin/env bash
# Forced SSH command installed root-owned; only accepts a website archive on stdin.
# Usage: authorized_keys command restriction. Remove that dedicated key to revoke access.
set -euo pipefail
if [ "${SSH_ORIGINAL_COMMAND:-}" != deploy-websites ]; then
  echo 'Only website deployment is permitted.' >&2
  exit 1
fi
exec sudo -n /usr/bin/python3 /usr/local/lib/ahelis-websites/receive.py
