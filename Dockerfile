# Single-container Dockerfile for LegalIQ (frontend + backend) on Render.
# - Stage 1 builds the React/Vite frontend with same-origin API URLs.
# - Final stage (Debian/glibc) runs BOTH nginx (public $PORT) and the Node
#   backend (internal 4000). nginx proxies /api, /uploads and /socket.io.
#
# IMPORTANT: We use a Debian-based (glibc) runtime instead of Alpine (musl).
# Alpine's musl resolver cannot perform SRV DNS lookups, which breaks
# mongodb+srv:// connections ("querySrv ENOTFOUND"). glibc resolves SRV fine.

# ---------- Stage 1: Build the frontend ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm install

# Force same-origin API/socket URLs for the single-container deploy.
# Baked into the frontend bundle at BUILD time by Vite; overrides any stale
# VITE_API_URL set in the Render dashboard that previously caused CORS 404s.
ENV VITE_API_URL=/api
ENV VITE_SOCKET_URL=""
ENV VITE_ENABLE_WEBRTC=true

# Copy frontend source and build
COPY . .
RUN npm run build

# ---------- Stage 2: Runtime (Debian/glibc: nginx + node backend) ----------
FROM node:20-slim

# Install nginx and gettext-base (provides envsubst for the $PORT template)
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Copy the built frontend into nginx's web root
RUN mkdir -p /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html

# Install backend production dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend/ ./
# Remove any local .env so Render's injected env vars (MONGODB_URI, etc.) win
RUN rm -f .env

# nginx config template (envsubst fills in ${PORT} at container start).
# On Debian, the templates dir convention isn't auto-processed, so our
# start-render.sh handles the substitution explicitly.
RUN mkdir -p /etc/nginx/templates
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Startup script runs backend + nginx together
COPY start-render.sh /start-render.sh
RUN chmod +x /start-render.sh

# Render provides $PORT; nginx listens on it. 80 is the local default.
EXPOSE 80

CMD ["/start-render.sh"]
