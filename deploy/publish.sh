#!/usr/bin/env bash
# Publish the verified builds through the restricted SSH receiver.
# Usage: GITHUB_SHA=<full commit> bash deploy/publish.sh. Failures restore previous releases.
set -euo pipefail

SSH_HOST="${WEBSITE_DEPLOY_HOST:-vps.paniagua.ch}"
SSH_PORT="${WEBSITE_DEPLOY_PORT:-1818}"
SSH_USER="${WEBSITE_DEPLOY_USER:-ubuntu}"
COMMIT="${GITHUB_SHA:-$(git rev-parse HEAD)}"
PAYLOAD=$(mktemp -t ahelis-websites-XXXXXX.tgz)
trap 'rm -f -- "$PAYLOAD"' EXIT

python3 deploy/package.py --output "$PAYLOAD" --commit "$COMMIT"
ssh -T -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=15 \
  -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" deploy-websites < "$PAYLOAD"
