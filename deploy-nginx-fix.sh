#!/bin/bash

# Simple script to deploy the correct nginx configuration

echo "Deploying corrected nginx configuration..."

# Create the corrected config
cat > /tmp/legaliq.conf << 'EOF'
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name legaliq.in www.legaliq.in _;
    
    # Redirect all HTTP to HTTPS
    return 301 https://legaliq.in$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name legaliq.in www.legaliq.in;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/legaliq.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/legaliq.in/privkey.pem;
    
    # IMPORTANT: Increase client body size for file uploads
    client_max_body_size 50M;
    client_body_buffer_size 50M;
    
    # Root directory
    root /home/ubuntu/legqlIQ/dist;
    index index.html;
    
    # Block malicious requests
    location ~ /(phpunit|vendor|\.env|\.git) {
        deny all;
        return 404;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Serve frontend (React Router support)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Backup existing config
sudo cp /etc/nginx/sites-available/legaliq /etc/nginx/sites-available/legaliq.backup.$(date +%Y%m%d_%H%M%S)

# Copy new config
sudo cp /tmp/legaliq.conf /etc/nginx/sites-available/legaliq

# Test nginx
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
    echo "Restarting nginx..."
    sudo systemctl restart nginx
    echo "✓ Nginx restarted"
    
    echo ""
    echo "Pulling latest backend code..."
    cd ~/legqlIQ
    git pull origin LegalIQ_prod
    
    echo "Restarting backend..."
    pm2 restart backend
    
    echo ""
    echo "✓ Deployment complete!"
    echo ""
    echo "Verification:"
    sudo nginx -T 2>&1 | grep "client_max_body_size"
    pm2 status
else
    echo "✗ Nginx configuration has errors. Restoring backup..."
    sudo cp /etc/nginx/sites-available/legaliq.backup.* /etc/nginx/sites-available/legaliq
    exit 1
fi
