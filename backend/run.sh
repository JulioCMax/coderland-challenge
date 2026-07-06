#!/usr/bin/env bash
# Coderland backend — one-command startup (PostgreSQL + .NET 10 API via Docker Compose).
#
# Usage:
#   ./run.sh                        start (build + up) with defaults
#   ./run.sh --db-port 55433        override host DB port (e.g. if 5432 is taken)
#   ./run.sh --api-port 9090        override host API port
#   ./run.sh --password <secret>    override the Postgres password
#   ./run.sh down                   stop and remove the stack
#   ./run.sh logs                   follow the API logs
#
# Defaults (also settable via env vars, read by docker-compose.yml):
#   DB_PORT=5432  API_PORT=8080  POSTGRES_PASSWORD=postgres
set -euo pipefail
cd "$(dirname "$0")"

DB_PORT="${DB_PORT:-5432}"
API_PORT="${API_PORT:-8080}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
CMD="up"

while [ $# -gt 0 ]; do
  case "$1" in
    up|down|logs) CMD="$1"; shift ;;
    --db-port)    DB_PORT="${2:?--db-port needs a value}"; shift 2 ;;
    --api-port)   API_PORT="${2:?--api-port needs a value}"; shift 2 ;;
    --password)   POSTGRES_PASSWORD="${2:?--password needs a value}"; shift 2 ;;
    -h|--help)
      cat <<'EOF'
Coderland backend runner
  ./run.sh                        start (build + up) with defaults
  ./run.sh --db-port 55433        override host DB port (if 5432 is taken)
  ./run.sh --api-port 9090        override host API port
  ./run.sh --password <secret>    override the Postgres password
  ./run.sh down                   stop and remove the stack
  ./run.sh logs                   follow the API logs
Defaults: DB_PORT=5432  API_PORT=8080  POSTGRES_PASSWORD=postgres
EOF
      exit 0 ;;
    *) echo "Unknown option: $1 (try --help)" >&2; exit 1 ;;
  esac
done
export DB_PORT API_PORT POSTGRES_PASSWORD

docker version >/dev/null 2>&1 || {
  echo "✖ Docker is not available or not running. Start Docker Desktop and retry." >&2
  exit 1
}
if docker compose version >/dev/null 2>&1; then COMPOSE="docker compose"; else COMPOSE="docker-compose"; fi

case "$CMD" in
  down) $COMPOSE down; echo "✔ Backend stopped."; exit 0 ;;
  logs) exec $COMPOSE logs -f api ;;
esac

echo "▶ Starting the backend (DB_PORT=$DB_PORT, API_PORT=$API_PORT)…"
if ! $COMPOSE up -d --build; then
  echo "" >&2
  echo "✖ 'up' failed. Most common cause: a host port ($DB_PORT or $API_PORT) is already in use." >&2
  echo "  Retry with free ports, e.g.:" >&2
  echo "    ./run.sh --db-port 55433 --api-port 8080" >&2
  exit 1
fi

echo -n "⏳ Waiting for the API to become healthy"
for _ in $(seq 1 60); do
  if curl -fs "http://localhost:${API_PORT}/health" >/dev/null 2>&1; then
    cat <<EOF

✔ Backend is up.

  Health   : http://localhost:${API_PORT}/health
  Swagger  : http://localhost:${API_PORT}/swagger
  Marcas   : http://localhost:${API_PORT}/api/marcas
  Tasks    : http://localhost:${API_PORT}/api/tasks

  Mobile: point EXPO_PUBLIC_BACKEND_URL at http://localhost:${API_PORT}
  (from a physical phone use this PC's LAN IP, not localhost).

  Stop it with: ./run.sh down
EOF
    exit 0
  fi
  sleep 2; echo -n "."
done
echo "" >&2
echo "✖ The API did not report healthy in time. Check the logs: ./run.sh logs" >&2
exit 1
