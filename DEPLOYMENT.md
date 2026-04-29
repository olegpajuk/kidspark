# KidSpark — Deployment Guide

Live URL: **https://kidspark.mybellon.com**

---

## 1. GitHub Setup

```bash
# On your machine — create GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/kids-learninghub.git
git branch -M master
git push -u origin master
```

If using the GitHub web UI:
1. Go to https://github.com/new
2. Name it `kids-learninghub`, set to Private
3. Copy the remote URL and run the commands above

---

## 2. VPS — One-time Setup

SSH into your VPS as root:

```bash
ssh root@YOUR_VPS_IP
```

Upload and run the setup script:

```bash
scp deploy/setup-vps.sh root@YOUR_VPS_IP:/tmp/
scp deploy/nginx.conf root@YOUR_VPS_IP:/tmp/nginx-kidspark.conf
ssh root@YOUR_VPS_IP "bash /tmp/setup-vps.sh"
```

---

## 3. Clone App to VPS

```bash
ssh root@YOUR_VPS_IP

cd /var/www/kidspark
git clone https://github.com/YOUR_USERNAME/kids-learninghub.git .
```

---

## 4. Environment Variables

Create `/var/www/kidspark/.env.local` on the VPS:

```bash
nano /var/www/kidspark/.env.local
```

Fill in from `.env.example`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
NEXT_PUBLIC_FIREBASE_APP_ID=your_value

FIREBASE_ADMIN_PROJECT_ID=your_value
FIREBASE_ADMIN_CLIENT_EMAIL=your_value
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_APP_URL=https://kidspark.mybellon.com
NODE_ENV=production
```

---

## 5. Build & Start

```bash
cd /var/www/kidspark
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## 6. SSL Certificate (Let's Encrypt)

Make sure your DNS A record `kidspark.mybellon.com` points to the VPS IP first.

```bash
certbot --nginx -d kidspark.mybellon.com
```

Then reload Nginx:

```bash
systemctl reload nginx
```

---

## 7. Firebase Console — Add Authorized Domain

Go to Firebase Console → Authentication → Settings → Authorized domains  
Add: `kidspark.mybellon.com`

---

## 8. Subsequent Deploys

From your local machine, push to GitHub. Then on the VPS:

```bash
ssh root@YOUR_VPS_IP "bash /var/www/kidspark/deploy/deploy.sh"
```

Or set up a GitHub Action to auto-deploy on push.

---

## 9. Health Check

After deployment, verify:

- https://kidspark.mybellon.com — shows welcome carousel
- https://kidspark.mybellon.com/privacy — Privacy Policy page
- https://kidspark.mybellon.com/terms — Terms of Use page
- https://kidspark.mybellon.com/signup — shows consent checkboxes before form
- https://kidspark.mybellon.com/login — login page

---

## Port

Next.js runs on port **3001** (configured in `ecosystem.config.js`).  
Nginx proxies port 80/443 → 3001.
