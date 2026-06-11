#!/usr/bin/env bash
set -euo pipefail

# e2e-ci.sh — Start ng serve, run Playwright tests, then kill the server.
# Bypasses Playwright's built-in webServer to avoid npx hanging on Netlify.
# The server process is tracked and killed in an EXIT trap for reliable cleanup.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

SERVER_PID=""

cleanup() {
  local exit_code=$?
  echo ":: e2e-ci :: Cleaning up (ng serve PID=${SERVER_PID:-none})..."
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    # Give it a moment to shut down gracefully, then force-kill
    for _ in $(seq 1 5); do
      if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        break
      fi
      sleep 1
    done
    kill -9 "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

echo ":: e2e-ci :: Starting Angular dev server..."

# Start ng serve in background, redirecting its output to a log file
# so we can see it if debugging, but keep the main output clean.
./node_modules/.bin/ng serve --no-hmr > /tmp/ng-serve.log 2>&1 &
SERVER_PID=$!

echo ":: e2e-ci :: ng serve PID: $SERVER_PID"

# Poll for the server to be ready (max 120 seconds)
echo ":: e2e-ci :: Waiting for server at http://localhost:4200 ..."
for i in $(seq 1 120); do
  if curl -s -o /dev/null -w '%{http_code}' http://localhost:4200 2>/dev/null | grep -q '200'; then
    echo ":: e2e-ci :: Server ready after ${i}s"
    break
  fi
  # If server process died, fail fast
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo ":: e2e-ci :: ERROR: ng serve died during startup. Log:"
    tail -20 /tmp/ng-serve.log
    exit 1
  fi
  sleep 1
done

# Verify server is actually running
if ! curl -s -o /dev/null http://localhost:4200 2>/dev/null; then
  echo ":: e2e-ci :: ERROR: Server not reachable after 120s. Log:"
  tail -20 /tmp/ng-serve.log
  exit 1
fi

echo ":: e2e-ci :: Running Playwright tests..."
# Run with CI=true so Playwright uses CI settings (1 worker, retries)
# E2E_EXTERNAL_SERVER=true tells Playwright to skip its own webServer
# since we manage the server lifecycle in this script.
E2E_EXTERNAL_SERVER=true CI=true ./node_modules/.bin/playwright test "$@"

echo ":: e2e-ci :: Tests completed successfully"
