# Creating Deployment Package for LegalIQ

## Understanding Deployment Formats

**WAR files** are for Java applications (Tomcat, JBoss, etc.)  
**LegalIQ** is a Node.js/React application, so we use different packaging methods.

## 📦 Option 1: Docker Container (Recommended)

Docker packages your entire application with all dependencies in a container that can run anywhere.

### Benefits
✅ Includes all dependencies and libraries  
✅ Works on any server with Docker installed  
✅ Consistent across development and production  
✅ Easy to deploy and scale  

### Create Docker Setup

1. **Create Dockerfile for Backend**

Create `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Start application
CMD ["node", "server.js"]
```

2. **Create Dockerfile for Frontend**

Create `Dockerfile` in root:
```dockerfile
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

3. **Create nginx.conf**

Create `nginx.conf` in root:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. **Create docker-compose.yml**

Create `docker-compose.yml` in root:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
      - CLIENT_URL=${CLIENT_URL}
      - SERVER_URL=${SERVER_URL}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
    restart: unless-stopped
    networks:
      - legaliq-network

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - legaliq-network

networks:
  legaliq-network:
    driver: bridge
```

5. **Build and Save Docker Images**

```bash
# Build images
docker-compose build

# Save images to tar files
docker save legaliq-backend:latest | gzip > legaliq-backend.tar.gz
docker save legaliq-frontend:latest | gzip > legaliq-frontend.tar.gz

# Or save both in one command
docker save legaliq-backend:latest legaliq-frontend:latest | gzip > legaliq-complete.tar.gz
```

6. **Deploy on Server**

```bash
# On server, load images
docker load < legaliq-complete.tar.gz

# Create .env file with production values
nano .env

# Start containers
docker-compose up -d
```

---

## 📦 Option 2: ZIP Package with Dependencies

Create a complete package with all node_modules included.

### Create Deployment Script

Create `create-deployment-package.sh`:
```bash
#!/bin/bash

echo "Creating LegalIQ Deployment Package..."

# Create deployment directory
mkdir -p legaliq-deployment
cd legaliq-deployment

# Copy backend
echo "Packaging backend..."
mkdir -p backend
cp -r ../backend/* backend/
cd backend
npm install --production
cd ..

# Build and copy frontend
echo "Building frontend..."
cd ..
npm install
npm run build
cd legaliq-deployment
mkdir -p frontend
cp -r ../dist/* frontend/

# Copy deployment scripts
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "Deploying LegalIQ..."

# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name legaliq-backend
cd ..

# Install and configure Nginx
sudo apt update
sudo apt install -y nginx

# Copy frontend files
sudo cp -r frontend/* /var/www/html/

echo "Deployment complete!"
echo "Backend running on port 4000"
echo "Frontend available at http://your-server-ip"
EOF

chmod +x deploy.sh

# Create README
cat > README.txt << 'EOF'
LegalIQ Deployment Package
==========================

This package contains:
- Backend with all dependencies (backend/)
- Built frontend files (frontend/)
- Deployment script (deploy.sh)

Prerequisites on server:
- Node.js 20.x or higher
- MongoDB connection string
- Nginx (will be installed by deploy.sh)

Deployment Steps:
1. Upload this entire folder to your server
2. Create backend/.env file with your configuration
3. Run: ./deploy.sh
4. Configure your domain and SSL

For detailed instructions, see AWS_DEPLOYMENT_GUIDE.md
EOF

# Create archive
cd ..
tar -czf legaliq-deployment-$(date +%Y%m%d).tar.gz legaliq-deployment/

echo "✅ Deployment package created: legaliq-deployment-$(date +%Y%m%d).tar.gz"
echo "📦 Package size: $(du -h legaliq-deployment-$(date +%Y%m%d).tar.gz | cut -f1)"
```

Make it executable and run:
```bash
chmod +x create-deployment-package.sh
./create-deployment-package.sh
```

This creates a `.tar.gz` file with everything included!

---

## 📦 Option 3: Git Repository (Simplest)

Push your code to GitHub/GitLab, then clone on server.

### Setup

1. **Create .gitignore**

```gitignore
# Dependencies
node_modules/
backend/node_modules/

# Build output
dist/
build/

# Environment variables
.env
backend/.env

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
```

2. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/legaliq.git
git push -u origin main
```

3. **Deploy on Server**

```bash
# On server
git clone https://github.com/yourusername/legaliq.git
cd legaliq

# Install backend dependencies
cd backend
npm install --production
cd ..

# Build frontend
npm install
npm run build

# Start with PM2
cd backend
pm2 start server.js --name legaliq-backend
```

---

## 📦 Option 4: Self-Contained Executable (pkg)

Create a standalone executable with all dependencies.

### For Backend Only

1. **Install pkg**

```bash
npm install -g pkg
```

2. **Create package script**

Add to `backend/package.json`:
```json
{
  "bin": "server.js",
  "pkg": {
    "assets": [
      "node_modules/**/*",
      "models/**/*",
      "routes/**/*",
      "controllers/**/*",
      "middleware/**/*",
      "config/**/*"
    ],
    "targets": [
      "node20-linux-x64",
      "node20-macos-x64",
      "node20-win-x64"
    ]
  }
}
```

3. **Build executable**

```bash
cd backend
pkg . --output ../legaliq-backend
```

This creates a single executable file!

---

## 🎯 Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Docker** | ✅ Complete isolation<br>✅ Includes everything<br>✅ Easy scaling | ❌ Requires Docker on server | Production, Cloud |
| **ZIP Package** | ✅ Simple<br>✅ No special tools | ❌ Large file size<br>❌ Manual setup | Traditional servers |
| **Git** | ✅ Version control<br>✅ Easy updates | ❌ Requires Git on server<br>❌ Must install deps | Development, CI/CD |
| **Executable** | ✅ Single file<br>✅ No Node.js needed | ❌ Backend only<br>❌ Large file | Desktop apps |

---

## 🚀 Recommended Approach

### For AWS/Cloud Deployment: **Docker**
- Most professional
- Easy to scale
- Industry standard

### For Traditional Server: **ZIP Package**
- Simple to understand
- Works on any server
- No special requirements

### For Quick Testing: **Git Repository**
- Fastest to deploy
- Easy to update
- Good for development

---

## 📋 Complete Deployment Checklist

### Before Creating Package

- [ ] Update all environment variables
- [ ] Test application locally
- [ ] Build frontend (`npm run build`)
- [ ] Remove development dependencies
- [ ] Update Google OAuth URLs
- [ ] Test MongoDB connection

### Package Contents

- [ ] Backend code with dependencies
- [ ] Built frontend files
- [ ] Environment variable template
- [ ] Deployment instructions
- [ ] Start/stop scripts
- [ ] Nginx configuration

### After Deployment

- [ ] Configure environment variables
- [ ] Set up MongoDB connection
- [ ] Configure domain and SSL
- [ ] Update Google OAuth settings
- [ ] Test all functionality
- [ ] Set up monitoring

---

## 💡 Quick Commands

### Create Docker Package
```bash
docker-compose build
docker save legaliq-backend legaliq-frontend | gzip > legaliq.tar.gz
```

### Create ZIP Package
```bash
./create-deployment-package.sh
# Creates: legaliq-deployment-YYYYMMDD.tar.gz
```

### Deploy ZIP Package
```bash
# On server
tar -xzf legaliq-deployment-YYYYMMDD.tar.gz
cd legaliq-deployment
./deploy.sh
```

---

**Note**: Unlike Java WAR files, Node.js applications are deployed as source code or Docker containers. The deployment package includes all dependencies (node_modules) which is equivalent to having all libraries bundled.
