#!/usr/bin/env bash
set -euo pipefail

HOST="${MINIOUT_SSH_HOST:-leagueai}"
REMOTE_DIR="/opt/miniout"
SERVICE="miniout-api"
LOCAL_API="$(cd "$(dirname "${BASH_SOURCE[0]}")/../api" && pwd)"

if [[ ! -f "$LOCAL_API/.env" ]]; then
  echo "falta api/.env en local" >&2
  exit 1
fi

if grep -q "PEGA_AQUI" "$LOCAL_API/.env"; then
  echo "api/.env todavia tiene marcadores sin rellenar" >&2
  exit 1
fi

echo "preparando $REMOTE_DIR en $HOST"
ssh "$HOST" "
  set -e
  install -d -o deploy -g deploy -m 750 $REMOTE_DIR
"

echo "subiendo codigo"
tar -C "$LOCAL_API" --exclude node_modules --exclude .env -czf - . \
  | ssh "$HOST" "tar -C $REMOTE_DIR -xzf - && chown -R deploy:deploy $REMOTE_DIR"

echo "subiendo entorno"
ssh "$HOST" "cat > $REMOTE_DIR/.env && chown deploy:deploy $REMOTE_DIR/.env && chmod 600 $REMOTE_DIR/.env" \
  < "$LOCAL_API/.env"

echo "instalando dependencias"
ssh "$HOST" "cd $REMOTE_DIR && sudo -u deploy npm ci --omit=dev --no-audit --no-fund"

echo "levantando la base de datos"
ssh "$HOST" "
  set -e
  cd $REMOTE_DIR
  sudo -u deploy docker compose up -d
  for i in \$(seq 1 30); do
    estado=\$(docker inspect -f '{{.State.Health.Status}}' miniout-db 2>/dev/null || echo esperando)
    [ \"\$estado\" = healthy ] && break
    sleep 3
  done
  docker inspect -f '{{.State.Health.Status}}' miniout-db
"

echo "aplicando el esquema"
ssh "$HOST" "cd $REMOTE_DIR && sudo -u deploy node src/migrate.js"

echo "instalando el servicio"
ssh "$HOST" "
  set -e
  install -m 644 $REMOTE_DIR/miniout-api.service /etc/systemd/system/$SERVICE.service
  systemctl daemon-reload
  systemctl enable $SERVICE
  systemctl restart $SERVICE
  sleep 2
  systemctl is-active $SERVICE
"

echo "comprobando"
ssh "$HOST" "curl -fsS --max-time 5 http://127.0.0.1:7200/health && echo"

echo "listo"
