#!/bin/bash
# KidSpark Deployment Script
# Run on the VPS from /var/www/kidspark to pull latest and redeploy
# Usage: bash deploy/deploy.sh

set -e

APP_DIR="/var/www/kidspark"
APP_NAME="kidspark"

echo "=== KidSpark Deploy: $(date) ==="

cd "$APP_DIR"

# Pull latest code
git pull origin master

# Install dependencies (production only)
npm ci --omit=dev

# Build Next.js
npm run build

# Reload PM2 (zero-downtime reload)
pm2 reload "$APP_NAME" --update-env

echo "=== Deploy complete! ==="
pm2 status "$APP_NAME"
