
o use the script on your EC2:

# 1. Upload the script to your EC2
scp -i your-key.pem setup-https.sh ubuntu@your-ec2-ip:~

# OR create it directly on EC2:
nano setup-https.sh
# (paste the script content)

# 2. Make it executable
chmod +x setup-https.sh

# 3. Run with sudo
sudo bash setup-https.sh

The script will prompt you for:

Domain name (e.g., legaliq.com)
Email address (for Let's Encrypt)
Frontend port (default: 5173)
Backend port (default: 4000)
Include www subdomain (y/n)
What the script does automatically:

✓ Installs Nginx and Certbot
✓ Configures Nginx with your ports
✓ Obtains free SSL certificate from Let's Encrypt
✓ Sets up automatic HTTPS redirect
✓ Configures auto-renewal (every 60 days)
✓ Adds security headers
✓ Optionally updates your .env file
✓ Provides complete summary and next steps
Prerequisites:

Domain pointing to your EC2 IP
Ports 80 and 443 open in AWS Security Group
Your application running on specified ports
The script is fully interactive, validates all inputs, and provides colored output for easy tracking.


