# Backend Dockerfile for LegalIQ
# Works for both Render and AWS deployment
# Render automatically sets PORT env var
# NOTE: .env file NOT copied to avoid overriding Render's $PORT

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (production mode for leaner image)
RUN npm install --production

# Copy ONLY application code (NOT .env file)
# .env is excluded to allow Render's $PORT to work automatically
COPY --chown=nodejs:nodejs . /app/
# Remove .env in Docker to prevent PORT=4000 from overriding Render's $PORT
# The .env file is kept for local development only
RUN rm -f .env

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# EXPOSE is omitted to prevent Render from scanning port 4000
# Render discovers the port from the running process automatically
# server.js uses: const PORT = process.env.PORT || 4000
# If Render sets $PORT, app uses it; otherwise falls back to 4000 for local dev

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-4000}/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application - use PORT env var (Render sets this automatically) or default to 4000
# server.js reads: const PORT = process.env.PORT || 4000
CMD ["node", "server.js"]
