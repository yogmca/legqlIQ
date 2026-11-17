# Frontend Dockerfile for LegalIQ
# Multi-stage build for optimized production image

# Stage 1: Build the React application
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Debug: Print Vite env vars that were available during build
# These should show values from Render Dashboard if .dockerignore excludes .env
RUN echo "VITE_API_URL_FROM_DASHBOARD=$VITE_API_URL"
RUN echo "VITE_SOCKET_URL_FROM_DASHBOARD=$VITE_SOCKET_URL"

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
