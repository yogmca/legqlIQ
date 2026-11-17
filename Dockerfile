# Single-container Dockerfile for LegalIQ (frontend + backend) on Render.
# - Stage 1 builds the React/Vite frontend with same-origin API URLs.
# - Final stage runs BOTH nginx (public $PORT) and the Node backend (internal 4000).
#   nginx proxies /api, /uploads and /socket.io to the backend.

# ---------- Stage 1: Build the frontend ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm install

# Force same-origin API/socket URLs for the single-container deploy.
# These are baked into the frontend bundle at BUILD time by Vite and
# intentionally OVERRIDE any stale VITE_API_URL set in the Render dashboard
# (e.g. the old https://legqliq-latest.onrender.com/api that caused CORS 404s).
ENV VITE_API_URL=/api
ENV VITE_SOCKET_URL=""
ENV VITE_ENABLE_WEBRTC=true

# Copy frontend source and build
COPY . .
RUN npm run build

# ---------- Stage 2: Runtime (nginx + node backend) ----------
FROM nginx:alpine

# Install Node.js runtime for the backend (nginx:alpine is Alpine-based).
# gettext (envsubst) is already bundled in nginx:alpine.
RUN apk add --no-cache nodejs npm

# Copy the built frontend into nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Install backend production dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend/ ./
# Remove any local .env so Render's injected env vars (MONGODB_URI, etc.) win
RUN rm -f .env

# nginx config template (envsubst fills in ${PORT} at container start)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Startup script runs backend + nginx together
COPY start-render.sh /start-render.sh
RUN chmod +x /start-render.sh

# Render provides $PORT; nginx listens on it. 80 is the local default.
EXPOSE 80

CMD ["/start-render.sh"]
