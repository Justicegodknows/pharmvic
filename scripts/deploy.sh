#!/usr/bin/env bash
# scripts/deploy.sh — Build, tag and push the pharmvic app image to
# DigitalOcean Container Registry (registry.digitalocean.com/pharmvic).
#
# Usage:
#   bash scripts/deploy.sh            # pushes as :latest
#   bash scripts/deploy.sh v1.2.3     # pushes as :v1.2.3 AND :latest
#
# Required env var:
#   DO_REGISTRY_TOKEN  — DigitalOcean API token with registry read+write scope.
#                        Load from .env.local or set in CI secrets.

set -euo pipefail

REGISTRY="registry.digitalocean.com"
REGISTRY_NAME="pharmvic"
IMAGE_NAME="pharmvic"
FULL_IMAGE="${REGISTRY}/${REGISTRY_NAME}/${IMAGE_NAME}"
TAG="${1:-latest}"

# ── 1. Resolve credentials ────────────────────────────────────────────────────
if [[ -z "${DO_REGISTRY_TOKEN:-}" ]]; then
    # Try loading from .env.local for local dev convenience
    ENV_FILE="$(dirname "$0")/../.env.local"
    if [[ -f "$ENV_FILE" ]]; then
        # shellcheck disable=SC1090
        set -a && source "$ENV_FILE" && set +a
    fi
fi

if [[ -z "${DO_REGISTRY_TOKEN:-}" ]]; then
    echo "ERROR: DO_REGISTRY_TOKEN is not set." >&2
    echo "  Set it in .env.local or as a CI/CD secret." >&2
    exit 1
fi

# DOCR authenticates with your account email as username and API token as password.
# DO_REGISTRY_USERNAME defaults to DO_REGISTRY_TOKEN for token-only setups (CI/CD);
# set it to your email address for personal account logins.
DOCR_USERNAME="${DO_REGISTRY_USERNAME:-${DO_REGISTRY_TOKEN}}"

# ── 2. Authenticate with DOCR ────────────────────────────────────────────────
echo "→ Logging in to ${REGISTRY} as ${DOCR_USERNAME%%:*}..."
echo "${DO_REGISTRY_TOKEN}" | docker login "${REGISTRY}" \
    --username "${DOCR_USERNAME}" \
    --password-stdin

# ── 3. Build ──────────────────────────────────────────────────────────────────
# NEXT_PUBLIC_* vars must be present at build time — they are baked into the
# compiled JS bundle by Next.js and cannot be injected at container runtime.
echo "→ Building ${FULL_IMAGE}:${TAG}..."
docker build \
    --platform linux/amd64 \
    --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
    --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-}" \
    --tag "${FULL_IMAGE}:${TAG}" \
    "$(dirname "$0")/.."

# ── 4. Tag :latest when a versioned tag was given ────────────────────────────
if [[ "${TAG}" != "latest" ]]; then
    docker tag "${FULL_IMAGE}:${TAG}" "${FULL_IMAGE}:latest"
fi

# ── 5. Push ───────────────────────────────────────────────────────────────────
echo "→ Pushing ${FULL_IMAGE}:${TAG}..."
docker push "${FULL_IMAGE}:${TAG}"

if [[ "${TAG}" != "latest" ]]; then
    echo "→ Pushing ${FULL_IMAGE}:latest..."
    docker push "${FULL_IMAGE}:latest"
fi

echo ""
echo "✓ Deploy complete: ${FULL_IMAGE}:${TAG}"
echo ""
echo "To run on a production host:"
echo "  export DO_REGISTRY_TOKEN=<token>"
echo "  echo \$DO_REGISTRY_TOKEN | docker login ${REGISTRY} -u \$DO_REGISTRY_TOKEN --password-stdin"
echo "  IMAGE_TAG=${TAG} docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull app"
echo "  IMAGE_TAG=${TAG} docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
