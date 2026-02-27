#!/bin/bash

# LegalIQ Deployment Script for AWS
# This script helps automate the deployment process

set -e  # Exit on error

echo "=========================================="
echo "   LegalIQ AWS Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    echo "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    print_success "npm found: $(npm --version)"
    
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI is not installed. Some features may not work."
    else
        print_success "AWS CLI found: $(aws --version)"
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    
    # Frontend dependencies
    print_info "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    # Backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
    
    echo ""
}

# Setup environment files
setup_environment() {
    echo "Setting up environment files..."
    
    # Check if .env files exist
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env not found. Creating from template..."
        cat > backend/.env << EOF
# Server Configuration
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/legaliq

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# SMS Service (Optional)
SMS_ENABLED=false
SMS_PROVIDER=MSG91
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=LGALIQ
MSG91_ROUTE=4

# Session Secret
SESSION_SECRET=your_session_secret_here
EOF
        print_warning "Please update backend/.env with your actual credentials"
    else
        print_success "backend/.env found"
    fi
    
    if [ ! -f ".env" ]; then
        print_warning ".env not found. Creating from template..."
        echo "VITE_API_URL=http://localhost:4000/api" > .env
        print_success "Frontend .env created"
    else
        print_success "Frontend .env found"
    fi
    
    echo ""
}

# Build frontend
build_frontend() {
    echo "Building frontend for production..."
    npm run build
    print_success "Frontend built successfully"
    echo ""
}

# Deploy to S3
deploy_to_s3() {
    read -p "Enter S3 bucket name: " bucket_name
    
    if [ -z "$bucket_name" ]; then
        print_error "Bucket name cannot be empty"
        return 1
    fi
    
    print_info "Deploying to S3 bucket: $bucket_name"
    
    # Upload files
    aws s3 sync dist/ s3://$bucket_name/ \
        --delete \
        --cache-control "public, max-age=31536000" \
        --exclude "index.html"
    
    # Upload index.html separately (no cache)
    aws s3 cp dist/index.html s3://$bucket_name/index.html \
        --cache-control "no-cache, no-store, must-revalidate"
    
    print_success "Frontend deployed to S3"
    echo ""
}

# Deploy backend to EC2
deploy_to_ec2() {
    read -p "Enter EC2 host (e.g., ec2-user@1.2.3.4): " ec2_host
    read -p "Enter path to SSH key: " ssh_key
    
    if [ -z "$ec2_host" ] || [ -z "$ssh_key" ]; then
        print_error "EC2 host and SSH key are required"
        return 1
    fi
    
    print_info "Deploying backend to EC2..."
    
    # Create deployment package
    tar -czf backend-deploy.tar.gz backend/
    
    # Upload to EC2
    scp -i "$ssh_key" backend-deploy.tar.gz "$ec2_host:~/"
    
    # Deploy on EC2
    ssh -i "$ssh_key" "$ec2_host" << 'ENDSSH'
        cd ~
        tar -xzf backend-deploy.tar.gz
        cd backend
        npm install --production
        pm2 restart legaliq-backend || pm2 start server.js --name legaliq-backend
        pm2 save
ENDSSH
    
    # Cleanup
    rm backend-deploy.tar.gz
    
    print_success "Backend deployed to EC2"
    echo ""
}

# Main menu
show_menu() {
    echo "=========================================="
    echo "   Deployment Options"
    echo "=========================================="
    echo "1. Check requirements"
    echo "2. Install dependencies"
    echo "3. Setup environment files"
    echo "4. Build frontend"
    echo "5. Deploy frontend to S3"
    echo "6. Deploy backend to EC2"
    echo "7. Full deployment (Build + Deploy)"
    echo "8. Exit"
    echo ""
    read -p "Select option (1-8): " option
    
    case $option in
        1)
            check_requirements
            show_menu
            ;;
        2)
            install_dependencies
            show_menu
            ;;
        3)
            setup_environment
            show_menu
            ;;
        4)
            build_frontend
            show_menu
            ;;
        5)
            build_frontend
            deploy_to_s3
            show_menu
            ;;
        6)
            deploy_to_ec2
            show_menu
            ;;
        7)
            check_requirements
            install_dependencies
            setup_environment
            build_frontend
            echo "Choose deployment target:"
            echo "1. S3 (Frontend)"
            echo "2. EC2 (Backend)"
            echo "3. Both"
            read -p "Select (1-3): " deploy_option
            
            case $deploy_option in
                1)
                    deploy_to_s3
                    ;;
                2)
                    deploy_to_ec2
                    ;;
                3)
                    deploy_to_s3
                    deploy_to_ec2
                    ;;
            esac
            
            print_success "Deployment complete!"
            ;;
        8)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_menu
            ;;
    esac
}

# Start script
check_requirements
show_menu
