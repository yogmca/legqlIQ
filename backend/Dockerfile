# Backend Dockerfile for LegalIQ
# Works for both Render and AWS deployment
# Render automatically sets PORT env var

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (production mode for leaner image)
RUN npm install --production

# Copy application code
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port - Render will override with its PORT env var
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application - use PORT env var (Render sets this automatically) or default to 4000
CMD ["node", "server.js"]
