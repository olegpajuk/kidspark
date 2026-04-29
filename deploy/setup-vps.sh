#!/bin/bash
# KidSpark VPS Setup Script
# Run this ONCE on a fresh Ubuntu 22.04 / 24.04 VPS as root or with sudo
# Usage: bash setup-vps.sh

set -e

echo "=== KidSpark VPS Setup ==="

# ── 1. System packages ──────────────────────────────────────────────────────
apt-get update && apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# ── 2. Node.js 22 LTS ───────────────────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node --version && npm --version

# ── 3. PM2 ──────────────────────────────────────────────────────────────────
npm install -g pm2
pm2 startup systemd -u www-data --hp /var/www
# Then run the output command as root to enable PM2 systemd service

# ── 4. App directory ─────────────────────────────────────────────────────────
mkdir -p /var/www/kidspark
chown -R www-data:www-data /var/www/kidspark
chmod -R 755 /var/www/kidspark

# ── 5. Nginx ─────────────────────────────────────────────────────────────────
# Copy the nginx config
cp /tmp/nginx-kidspark.conf /etc/nginx/sites-available/kidspark
ln -sf /etc/nginx/sites-available/kidspark /etc/nginx/sites-enabled/kidspark
# Remove default site if present
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# ── 6. UFW Firewall ───────────────────────────────────────────────────────────
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

echo ""
echo "=== Setup complete! Next steps: ==="
echo "1. Clone the repo to /var/www/kidspark"
echo "2. Create /var/www/kidspark/.env.local with your Firebase credentials"
echo "3. Run: cd /var/www/kidspark && npm ci && npm run build"
echo "4. Run: pm2 start ecosystem.config.js && pm2 save"
echo "5. Get SSL: certbot --nginx -d kidspark.mybellon.com"
echo "6. Reload nginx: systemctl reload nginx"
