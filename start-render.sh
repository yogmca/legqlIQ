#!/bin/sh
# Entrypoint for the single-container (frontend + backend) deployment on Render.
# 1. Render provides $PORT -> nginx must listen on it.
# 2. The Node backend runs internally on a fixed port (4000).
# 3. nginx proxies /api, /uploads and /socket.io to the backend.
#
# Runtime image is Debian (glibc) so MongoDB SRV DNS lookups work.

set -e

# Render sets $PORT for the public web service. Default to 80 for local runs.
export PORT="${PORT:-80}"

# Backend listens internally on 4000 (nginx proxies to it).
export BACKEND_PORT=4000

echo "Starting single-container deployment..."
echo "  nginx public port : $PORT"
echo "  backend internal  : $BACKEND_PORT"

# Remove Debian's default site so it doesn't conflict with our server block.
rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Render our nginx config from the template, substituting only ${PORT}.
mkdir -p /etc/nginx/conf.d
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "----- Rendered nginx conf.d/default.conf (server block) -----"
grep -n "listen" /etc/nginx/conf.d/default.conf || true
echo "-------------------------------------------------------------"

# Start the Node backend on the internal port. PORT for the backend process
# must be 4000, NOT the public $PORT (which nginx owns).
echo "Starting backend (node server.js) on port $BACKEND_PORT..."
cd /app/backend
PORT="$BACKEND_PORT" node server.js &
BACKEND_PID=$!

# Give the backend a moment to boot and connect to MongoDB.
sleep 3

# Validate nginx config, then start nginx in the foreground.
echo "Validating nginx configuration..."
nginx -t

echo "Starting nginx on port $PORT..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# POSIX /bin/sh (dash) on Debian does NOT support `wait -n`. Poll both
# processes instead: if either the backend or nginx exits, stop the container
# so Render restarts it.
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
  sleep 5
done

echo "A process exited (backend or nginx); shutting down container."
# Try to stop whichever is still alive so the container exits cleanly.
kill "$BACKEND_PID" "$NGINX_PID" 2>/dev/null || true
exit 1
