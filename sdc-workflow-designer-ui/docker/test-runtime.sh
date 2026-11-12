#!/bin/sh
# Copyright (C) 2026 Deutsche Telekom AG. Licensed under Apache-2.0.
# Requires a local Docker daemon, curl, Python 3 and JDK 17+ keytool.
set -eu
image=${1:-onap/sdc-workflow-frontend:latest}
prefix=workflow-jetty-$$
fixtures=$(mktemp -d)
cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    docker logs "$prefix-frontend" 2>&1 || true
    docker logs "$prefix-upstream" 2>&1 || true
  fi
  docker rm -f "$prefix-frontend" "$prefix-upstream" >/dev/null 2>&1 || true
  docker network rm "$prefix" >/dev/null 2>&1 || true
  rm -rf "$fixtures"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

for name in server frontend; do
  keytool -genkeypair -alias "$name" -keyalg RSA -dname CN=localhost \
    -ext "SAN=dns:localhost,dns:$prefix-upstream,ip:127.0.0.1" -validity 2 \
    -storetype PKCS12 -keystore "$fixtures/$name.p12" \
    -storepass test-password -keypass test-password -noprompt >/dev/null 2>&1
  keytool -exportcert -rfc -alias "$name" -keystore "$fixtures/$name.p12" \
    -storepass test-password -file "$fixtures/$name.pem" >/dev/null 2>&1
done
keytool -importcert -alias upstream -file "$fixtures/server.pem" \
  -keystore "$fixtures/trust.p12" -storetype PKCS12 -storepass test-password \
  -noprompt >/dev/null 2>&1
chmod 755 "$fixtures"
chmod 644 "$fixtures/"*
cat > "$fixtures/Upstream.java" <<'JAVA'
import com.sun.net.httpserver.*;
import java.net.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.net.ssl.*;
class Upstream {
    public static void main(String[] args) throws Exception {
        KeyStore store = KeyStore.getInstance("PKCS12");
        try (var input = Files.newInputStream(Path.of("/fixtures/server.p12"))) {
            store.load(input, "test-password".toCharArray());
        }
        var keys = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keys.init(store, "test-password".toCharArray());
        var ssl = SSLContext.getInstance("TLS");
        ssl.init(keys.getKeyManagers(), null, null);
        var https = HttpsServer.create(new InetSocketAddress(8443), 0);
        https.setHttpsConfigurator(new HttpsConfigurator(ssl));
        var http = HttpServer.create(new InetSocketAddress(8080), 0);
        for (HttpServer server : new HttpServer[]{http, https}) {
            server.createContext("/base", exchange -> {
                byte[] body = exchange.getRequestBody().readAllBytes();
                if (body.length == 0) {
                    body = exchange.getRequestURI().toString().getBytes(StandardCharsets.UTF_8);
                }
                exchange.sendResponseHeaders(200, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            server.start();
        }
    }
}
JAVA

docker network create "$prefix" >/dev/null
docker run -d --name "$prefix-upstream" --network "$prefix" \
  -v "$fixtures:/fixtures:ro" --entrypoint java "$image" /fixtures/Upstream.java >/dev/null

start_frontend() {
  backend=$1
  shift
  docker run -d --name "$prefix-frontend" --network "$prefix" \
    -p 127.0.0.1::8080 -p 127.0.0.1::8443 -v "$fixtures:/fixtures:ro" \
    -e "BACKEND=$backend" "$@" "$image" >/dev/null
  port=$(docker port "$prefix-frontend" 8080/tcp | sed 's/.*://')
  url=http://127.0.0.1:$port
  curl -fsS --retry 40 --retry-all-errors --retry-delay 1 --max-time 2 \
    "$url/workflows/ping" -o "$fixtures/ping" 2>"$fixtures/wait.log"
}

start_frontend "http://$prefix-upstream:8080/base"
curl -fsS -D "$fixtures/headers" "$url/workflows/" -o "$fixtures/page"
! grep -qi '^Server:.*Jetty' "$fixtures/headers"
grep -qi '^Content-Type:.*text/html' "$fixtures/headers"
asset=$(python3 - "$fixtures/page" <<'PY'
import re, sys
page = open(sys.argv[1]).read()
print(re.search(r'<script[^>]+src="([^"]+\.js)"', page)[1])
PY
)
case "$asset" in
  /*) asset_url="$url$asset" ;;
  *) asset_url="$url/workflows/$asset" ;;
esac
curl -fsS -D "$fixtures/asset-headers" "$asset_url" -o "$fixtures/asset"
grep -qi '^Content-Type:.*javascript' "$fixtures/asset-headers"
[ -s "$fixtures/asset" ]
curl -sS -D "$fixtures/redirect" "$url/" -o /dev/null
grep -q ' 302 ' "$fixtures/redirect"
grep -qi '^Location:.*\/workflows' "$fixtures/redirect"
curl -fLsS --max-redirs 5 "$url/" -o "$fixtures/redirect-page"
cmp "$fixtures/page" "$fixtures/redirect-page"
# Add a public directory to the disposable extracted WAR, without an index.
docker exec "$prefix-frontend" sh -ec '
  page=$(find /tmp "$JETTY_BASE" -type f -name index.html 2>/dev/null | head -n 1)
  test -n "$page"
  mkdir "$(dirname "$page")/listing-check"
  printf "%s\n" directory-marker > "$(dirname "$page")/listing-check/marker.txt"
'
[ "$(curl -fsS "$url/workflows/listing-check/marker.txt")" = directory-marker ]
code=$(curl -sS -o "$fixtures/listing" -w '%{http_code}' "$url/workflows/listing-check/")
[ "$code" = 403 ]
! grep -q 'marker.txt' "$fixtures/listing"
for path in /workflows/WEB-INF/web.xml /workflows/WEB-INF/ /missing-context; do
  code=$(curl -sS -o "$fixtures/hidden" -w '%{http_code}' "$url$path")
  [ "$code" = 404 ] || [ "$code" = 403 ]
  ! grep -q 'Contexts known to this server\|Directory:' "$fixtures/hidden"
done
[ "$(curl -fsS "$url/workflows/wf/items?a=1&a=2")" = '/base/wf/items?a=1&a=2' ]
[ "$(curl -fsS "$url/workflows/v1.0/activity-spec/items")" = '/base/v1.0/activity-spec/items' ]
[ "$(curl -fsS -X POST -d 'proxy-body' "$url/workflows/wf/items")" = proxy-body ]
[ "$(docker exec "$prefix-frontend" id -u)" != 0 ]
[ "$(docker exec "$prefix-frontend" cat /proc/1/comm)" = java ]
before=$(docker exec "$prefix-frontend" sh -c 'sha256sum start.d/*.ini')
docker restart "$prefix-frontend" >/dev/null
port=$(docker port "$prefix-frontend" 8080/tcp | sed 's/.*://')
url=http://127.0.0.1:$port
curl -fsS --retry 40 --retry-all-errors --retry-delay 1 --max-time 2 \
  "$url/workflows/ping" -o /dev/null 2>"$fixtures/wait.log"
[ "$before" = "$(docker exec "$prefix-frontend" sh -c 'sha256sum start.d/*.ini')" ]
docker stop -t 20 "$prefix-frontend" >/dev/null
[ "$(docker inspect -f '{{.State.ExitCode}}' "$prefix-frontend")" != 137 ]
docker rm "$prefix-frontend" >/dev/null

# Different frontend key and upstream truststore catch store-path mixups.
start_frontend "https://$prefix-upstream:8443/base" -e IS_HTTPS=true \
  -e KEYSTORE_PATH=/fixtures/frontend.p12 -e KEYSTORE_PASS=test-password \
  -e TRUSTSTORE_PATH=/fixtures/trust.p12 -e TRUSTSTORE_PASS=test-password
https_port=$(docker port "$prefix-frontend" 8443/tcp | sed 's/.*://')
[ "$(curl -fsS --cacert "$fixtures/frontend.pem" \
  "https://127.0.0.1:$https_port/workflows/wf/items")" = '/base/wf/items' ]
before=$(docker exec "$prefix-frontend" sh -c 'sha256sum start.d/*.ini')
docker restart "$prefix-frontend" >/dev/null
https_port=$(docker port "$prefix-frontend" 8443/tcp | sed 's/.*://')
curl -fsS --retry 40 --retry-all-errors --retry-delay 1 --max-time 2 \
  --cacert "$fixtures/frontend.pem" "https://127.0.0.1:$https_port/workflows/ping" \
  -o /dev/null 2>"$fixtures/wait.log"
[ "$before" = "$(docker exec "$prefix-frontend" sh -c 'sha256sum start.d/*.ini')" ]
printf '%s\n' 'Jetty container smoke checks passed (HTTP, HTTPS, WAR, proxy, restart, shutdown).'
