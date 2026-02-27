# Docker Deployment Guide for LegalIQ

Complete guide to build, run, and deploy LegalIQ using Docker.

## 📦 What's Included

Your project now has complete Docker configuration:

- [`backend/Dockerfile`](backend/Dockerfile) - Backend container configuration
- [`Dockerfile`](Dockerfile) - Frontend container configuration  
- [`docker-compose.yml`](docker-compose.yml) - Orchestrates both containers
- [`nginx.conf`](nginx.conf) - Nginx web server configuration
- [`.env.example`](.env.example) - Environment variables template

## 🚀 Quick Start

### 1. Prerequisites

Install Docker on your machine:
- **Mac**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

Verify installation:
```bash
docker --version
docker-compose --version
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
nano .env
```

**Required values:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Random 32+ character string
- `SESSION_SECRET` - Random 32+ character string
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

### 3. Build and Run

```bash
# Build the Docker images
docker-compose build

# Start the containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Your Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health

## 📋 Docker Commands Reference

### Building

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache (fresh build)
docker-compose build --no-cache
```

### Running

```bash
# Start in background
docker-compose up -d

# Start in foreground (see logs)
docker-compose up

# Start specific service
docker-compose up -d backend
```

### Stopping

```bash
# Stop all containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes
docker-compose down -v
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Container Management

```bash
# List running containers
docker-compose ps

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🎯 Development vs Production

### Development Mode

Use local Node.js for development (faster):
```bash
# Frontend
npm run dev

# Backend
cd backend && npm start
```

### Production Mode

Use Docker for production deployment:
```bash
docker-compose up -d
```

## 📦 Creating Deployment Package

### Option 1: Save Docker Images

```bash
# Build images
docker-compose build

# Save to tar file
docker save legaliq-backend legaliq-frontend | gzip > legaliq-docker.tar.gz

# File size: ~250-300 MB
```

### Option 2: Push to Docker Hub

```bash
# Tag images
docker tag legaliq-backend yourusername/legaliq-backend:latest
docker tag legaliq-frontend yourusername/legaliq-frontend:latest

# Push to Docker Hub
docker push yourusername/legaliq-backend:latest
docker push yourusername/legaliq-frontend:latest
```

## 🚀 Deploying to Server

### Method 1: Using Docker Images File

```bash
# On your local machine
docker-compose build
docker save legaliq-backend legaliq-frontend | gzip > legaliq-docker.tar.gz

# Upload to server
scp legaliq-docker.tar.gz user@server:/home/user/

# On server
docker load < legaliq-docker.tar.gz
docker-compose up -d
```

### Method 2: Using Git

```bash
# On server
git clone https://github.com/yourusername/legaliq.git
cd legaliq

# Create .env file
cp .env.example .env
nano .env  # Add your values

# Build and run
docker-compose up -d
```

### Method 3: Using Docker Hub

```bash
# On server
docker pull yourusername/legaliq-backend:latest
docker pull yourusername/legaliq-frontend:latest
docker-compose up -d
```

## 🔧 Production Configuration

### Update .env for Production

```env
# Production URLs
CLIENT_URL=https://legaliq.com
SERVER_URL=https://api.legaliq.com
VITE_API_URL=https://api.legaliq.com/api
GOOGLE_CALLBACK_URL=https://api.legaliq.com/api/auth/google/callback

# Strong secrets
JWT_SECRET=<generate-strong-random-string>
SESSION_SECRET=<generate-strong-random-string>

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/legaliq

# Environment
NODE_ENV=production
```

### Add SSL/HTTPS

Update `docker-compose.yml` to include SSL:

```yaml
frontend:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./ssl:/etc/nginx/ssl
```

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check if ports are in use
lsof -i :4000
lsof -i :80

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### MongoDB Connection Issues

```bash
# Test MongoDB connection
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌ Error:', err));
"
```

### Frontend Not Loading

```bash
# Check if frontend container is running
docker-compose ps

# Check Nginx logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Environment Variables Not Working

```bash
# Verify .env file exists
ls -la .env

# Check if variables are loaded
docker-compose config

# Restart containers after .env changes
docker-compose down
docker-compose up -d
```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:4000/api/health

# Frontend health
curl http://localhost/

# Container health status
docker-compose ps
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats legaliq-backend
docker stats legaliq-frontend
```

## 🔒 Security Best Practices

1. **Never commit .env file**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use strong secrets**
   ```bash
   # Generate random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update regularly**
   ```bash
   # Pull latest base images
   docker-compose pull
   docker-compose build
   docker-compose up -d
   ```

4. **Limit container resources**
   ```yaml
   # In docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

## 📈 Scaling

### Horizontal Scaling

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Add load balancer (Nginx)
# See AWS_DEPLOYMENT_GUIDE.md for details
```

## 🎯 Complete Deployment Workflow

```bash
# 1. Prepare
cp .env.example .env
nano .env  # Add your values

# 2. Build
docker-compose build

# 3. Test locally
docker-compose up

# 4. Create deployment package
docker save legaliq-backend legaliq-frontend | gzip > legaliq-docker.tar.gz

# 5. Upload to server
scp legaliq-docker.tar.gz user@server:/home/user/
scp .env user@server:/home/user/
scp docker-compose.yml user@server:/home/user/

# 6. Deploy on server
ssh user@server
docker load < legaliq-docker.tar.gz
docker-compose up -d

# 7. Verify
curl http://server-ip/api/health
```

## 📞 Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify .env file
3. Check MongoDB connection
4. Review [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
5. Review [DEPLOYMENT_PACKAGE_GUIDE.md](DEPLOYMENT_PACKAGE_GUIDE.md)

---

**Your LegalIQ application is now containerized and ready for deployment!** 🎉
