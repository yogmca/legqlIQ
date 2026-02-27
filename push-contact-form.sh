#!/bin/bash

# Script to push only contact form changes to GitHub
# This avoids pushing documentation files with secrets

echo "Pushing contact form changes to GitHub..."

# Reset to clean state
git reset --soft HEAD~2

# Add only the contact form related files
git add src/components/ContactUs.jsx
git add src/components/ContactUs.css
git add src/App.jsx
git add index.html
git add backend/services/emailService.js
git add backend/controllers/contactController.js
git add backend/routes/contactRoutes.js
git add backend/server.js
git add backend/.env.example
git add .gitignore

# Commit the changes
git commit -m "Add contact form feature with email functionality and SEO improvements

- Added ContactUs component with form validation
- Implemented email service using nodemailer
- Added contact form routes and controller
- Updated SEO meta tags in index.html
- Added email configuration to .env.example"

# Push to GitHub
git push -f origin LegalIQ_prod

echo "Done! Contact form changes pushed successfully."
