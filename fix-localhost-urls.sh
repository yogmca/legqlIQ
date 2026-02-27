#!/bin/bash

# Fix Localhost URLs Script
# Run this script directly on your AWS EC2 instance
# Usage: bash fix-localhost-urls.sh

echo "🔧 Fixing hardcoded localhost URLs in all files..."
echo "================================================"

PROJECT_DIR=~/legqlIQ
API_URL="http://13.62.225.158:4000/api"

cd $PROJECT_DIR

echo "📝 Backing up files..."
mkdir -p backups
cp src/components/Register.jsx backups/Register.jsx.bak
cp src/components/VideoConsultationList.jsx backups/VideoConsultationList.jsx.bak
cp src/App.jsx backups/App.jsx.bak
cp src/components/LawyerCard.jsx backups/LawyerCard.jsx.bak
cp src/components/AppointmentManager.jsx backups/AppointmentManager.jsx.bak
cp backend/controllers/authController.js backups/authController.js.bak

echo "✅ Backups created in $PROJECT_DIR/backups/"
echo ""

echo "🔄 Replacing localhost URLs..."

# Fix Register.jsx
echo "  → Fixing Register.jsx..."
sed -i "s|'http://localhost:4000/api/auth/register-lawyer'|\`\${API_URL}/auth/register-lawyer\`|g" src/components/Register.jsx
sed -i "s|'http://localhost:4000/api/auth/register'|\`\${API_URL}/auth/register\`|g" src/components/Register.jsx

# Add API_URL constant if not present
if ! grep -q "const API_URL = import.meta.env.VITE_API_URL" src/components/Register.jsx; then
    sed -i "5i const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';\n" src/components/Register.jsx
fi

# Fix VideoConsultationList.jsx
echo "  → Fixing VideoConsultationList.jsx..."
sed -i "s|'http://localhost:4000/api/consultations/create-order'|\`\${API_URL}/consultations/create-order\`|g" src/components/VideoConsultationList.jsx
sed -i "s|'http://localhost:4000/api/consultations/verify-payment'|\`\${API_URL}/consultations/verify-payment\`|g" src/components/VideoConsultationList.jsx

if ! grep -q "const API_URL = import.meta.env.VITE_API_URL" src/components/VideoConsultationList.jsx; then
    sed -i "8i const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';\n" src/components/VideoConsultationList.jsx
fi

# Fix App.jsx
echo "  → Fixing App.jsx..."
sed -i "s|http://localhost:4000/api/consultations/|\${API_URL}/consultations/|g" src/App.jsx

if ! grep -q "const API_URL = import.meta.env.VITE_API_URL" src/App.jsx; then
    sed -i "18i const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';\n" src/App.jsx
fi

# Fix LawyerCard.jsx
echo "  → Fixing LawyerCard.jsx..."
sed -i "s|'http://localhost:4000/api/consultations'|\`\${API_URL}/consultations\`|g" src/components/LawyerCard.jsx

if ! grep -q "const API_URL = import.meta.env.VITE_API_URL" src/components/LawyerCard.jsx; then
    sed -i "5i const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';\n" src/components/LawyerCard.jsx
fi

# Fix AppointmentManager.jsx
echo "  → Fixing AppointmentManager.jsx..."
sed -i "s|http://localhost:4000/api/consultations|\${API_URL}/consultations|g" src/components/AppointmentManager.jsx

if ! grep -q "const API_URL = import.meta.env.VITE_API_URL" src/components/AppointmentManager.jsx; then
    sed -i "6i const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';\n" src/components/AppointmentManager.jsx
fi

# Fix backend authController.js - change default consultation fee
echo "  → Fixing authController.js (consultation fee)..."
sed -i "s|consultationFee: consultationFee ? parseInt(consultationFee) : 0|consultationFee: consultationFee ? parseInt(consultationFee) : 500|g" backend/controllers/authController.js

echo ""
echo "✅ All files updated!"
echo ""

echo "🔍 Verifying changes..."
echo "  Checking for remaining localhost:4000 references..."
grep -r "localhost:4000" src/ --include="*.jsx" --include="*.js" | grep -v "node_modules" | grep -v "const API_URL" || echo "  ✅ No hardcoded localhost URLs found!"

echo ""
echo "📦 Rebuilding frontend..."
npm run build

echo ""
echo "🔄 Restarting services..."
pm2 restart all

echo ""
echo "📊 Service status:"
pm2 status

echo ""
echo "================================================"
echo "✅ All done! Your application has been updated."
echo ""
echo "🌐 Test your application at:"
echo "   http://13.62.225.158:5173"
echo ""
echo "📝 Backups are saved in: $PROJECT_DIR/backups/"
echo ""
echo "💡 To restore backups if needed:"
echo "   cp backups/*.bak src/components/"
echo ""
