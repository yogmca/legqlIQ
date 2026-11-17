# Frontend Dockerfile for LegalIQ
# Multi-stage build for optimized production image
# This Dockerfile works for both Render and AWS deployment

# Stage 1: Build the React application - Production build with VITE_API_URL from Render Dashboard
# Debug: Print all Vite env vars during build
RUN echo "VITE_API_URL = $VITE_API_URL"
RUN echo "VITE_RAZORPAY_KEY_ID = $VITE_RAZORPAY_KEY_ID"
RUN echo "VITE_ENABLE_WEBRTC = $VITE_ENABLE_WEBRTC"
RUN echo "VITE_SOCKET_URL = $VITE_SOCKET_URL"
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (with --legacy-peer-deps for React 19 / react-quill v3 compatibility)
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Build the application
RUN npm run build

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
