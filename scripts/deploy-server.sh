#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/var/www/tiza}"
API_SERVICE_NAME="${API_SERVICE_NAME:-tiza-api}"
WEBSITE_SERVICE_NAME="${WEBSITE_SERVICE_NAME:-tiza-web}"
API_DIR="${API_DIR:-${DEPLOY_ROOT}/api}"
ADMIN_PUBLIC_DIR="${ADMIN_PUBLIC_DIR:-${DEPLOY_ROOT}/admin}"
WEBSITE_DIR="${WEBSITE_DIR:-${DEPLOY_ROOT}/web}"
DEPLOY_CONFIGS_TGZ="${DEPLOY_CONFIGS_TGZ:-/tmp/tiza-deploy-configs.tgz}"
ADMIN_BUILD_TGZ="${ADMIN_BUILD_TGZ:-/tmp/tiza-admin-build.tgz}"
WEBSITE_BUILD_TGZ="${WEBSITE_BUILD_TGZ:-/tmp/tiza-website-build.tgz}"
API_JAR="${API_JAR:-/tmp/tiza-app.jar}"

mkdir -p "${DEPLOY_ROOT}/deploy" "${API_DIR}" "${ADMIN_PUBLIC_DIR}" "${WEBSITE_DIR}"

cp "${API_JAR}" "${API_DIR}/app.jar"

rm -rf "${ADMIN_PUBLIC_DIR}"
mkdir -p "${ADMIN_PUBLIC_DIR}"
tar -xzf "${ADMIN_BUILD_TGZ}" -C "${ADMIN_PUBLIC_DIR}"

rm -rf "${WEBSITE_DIR}"
mkdir -p "${WEBSITE_DIR}"
tar -xzf "${WEBSITE_BUILD_TGZ}" -C "${WEBSITE_DIR}"

rm -rf "${DEPLOY_ROOT}/deploy"
mkdir -p "${DEPLOY_ROOT}/deploy"
tar -xzf "${DEPLOY_CONFIGS_TGZ}" -C "${DEPLOY_ROOT}/deploy"

cd "${WEBSITE_DIR}"
npm ci --omit=dev

if command -v systemctl >/dev/null 2>&1; then
  restart_service() {
    local service_name="$1"

    if ! sudo systemctl restart "${service_name}"; then
      echo "Failed to restart ${service_name}" >&2
      sudo systemctl status "${service_name}" --no-pager -l || true
      sudo journalctl -xeu "${service_name}" --no-pager -n 80 || true
      exit 1
    fi
  }

  restart_service "${API_SERVICE_NAME}"
  restart_service "${WEBSITE_SERVICE_NAME}"
fi
