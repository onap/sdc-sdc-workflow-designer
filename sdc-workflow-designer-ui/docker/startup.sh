#!/bin/sh
set -eu

: "${BACKEND:?BACKEND must specify the backend URL}"
cd "${JETTY_BASE}"

store_path() {
  case "$1" in
    /*) printf '%s' "$1" ;;
    *) printf '%s/%s' "$JETTY_BASE" "$1" ;;
  esac
}

set -- "-DproxyTo=$BACKEND"
if [ -n "${KEYSTORE_PATH:-}" ]; then
  set -- "$@" "-DkeystorePath=$(store_path "$KEYSTORE_PATH")" \
    "-DkeystorePassword=${KEYSTORE_PASS:-}" "-DkeyManagerPassword=${KEYSTORE_PASS:-}"
fi
if [ -n "${TRUSTSTORE_PATH:-}" ]; then
  set -- "$@" "-DtruststorePath=$(store_path "$TRUSTSTORE_PATH")" \
    "-DtruststorePassword=${TRUSTSTORE_PASS:-}"
fi
if [ -n "${TRUST_ALL:-}" ]; then
  set -- "$@" "-DsslTrustAll=$TRUST_ALL"
fi

set -- "$@" -jar "${JETTY_HOME}/start.jar"

if [ "${IS_HTTPS:-false}" = "true" ]; then
  : "${KEYSTORE_PATH:?KEYSTORE_PATH is required for frontend HTTPS}"
  : "${KEYSTORE_PASS:?KEYSTORE_PASS is required for frontend HTTPS}"
  # Module activation is idempotent; keep secrets in JVM arguments, not start.d files.
  java -jar "${JETTY_HOME}/start.jar" --add-modules=https
  set -- "$@" "jetty.sslContext.keyStorePath=$(store_path "$KEYSTORE_PATH")" \
    "jetty.sslContext.keyStorePassword=$KEYSTORE_PASS" \
    "jetty.sslContext.keyManagerPassword=$KEYSTORE_PASS"
  if [ -n "${TRUSTSTORE_PATH:-}" ]; then
    set -- "$@" "jetty.sslContext.trustStorePath=$(store_path "$TRUSTSTORE_PATH")" \
      "jetty.sslContext.trustStorePassword=${TRUSTSTORE_PASS:-}"
  fi
fi

# JAVA_OPTIONS intentionally accepts a whitespace-separated list of JVM arguments.
# Disable filename expansion while retaining that existing interface.
set -f
exec java ${JAVA_OPTIONS:-} "$@" \
  jetty.server.default.showContexts=false jetty.httpConfig.sendServerVersion=false
