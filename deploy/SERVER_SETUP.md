# Server Setup

This guide assumes:

- server: `199.192.21.203`
- user: `swiftsell`
- deploy root: `/var/www/tiza`
- admin public dir: `/var/www/tiza/admin`
- website dir: `/var/www/tiza/web`
- api dir: `/var/www/tiza/api`
- api domain: `tiza-api.dartajer.space`
- admin domain: `tiza-admin.dartajer.space`
- website domain: `tiza.dartajer.space`

It also assumes an Ubuntu or Debian server with `sudo`.

## 1. Install runtime packages

```bash
sudo apt update
sudo apt install -y nginx rsync openjdk-21-jre-headless
```

## 2. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
java -version
```

## 3. Create deployment directories

```bash
sudo mkdir -p /var/www/tiza/api
sudo mkdir -p /var/www/tiza/api/uploads
sudo mkdir -p /var/www/tiza/admin
sudo mkdir -p /var/www/tiza/web
sudo mkdir -p /var/www/tiza/releases
sudo mkdir -p /var/www/tiza/deploy/env
sudo chown -R swiftsell:swiftsell /var/www/tiza
```

## 4. Create backend environment file

Create `/var/www/tiza/deploy/env/app.env`:

```bash
cat <<'EOF' > /var/www/tiza/deploy/env/app.env
DB_URL=jdbc:postgresql://127.0.0.1:5432/tiza
DB_USERNAME=tiza
DB_PASSWORD=tiza-pwd

JWT_SECRET_BASE64=replace-with-a-real-base64-secret
JWT_ACCESS_TTL_MINUTES=15
JWT_REFRESH_TTL_DAYS=14
JWT_ISSUER=tiza-app

CORS_ALLOWED_ORIGINS=https://tiza-admin.dartajer.space,https://tiza.dartajer.space
APP_MEDIA_UPLOAD_DIR=/var/www/tiza/api/uploads
APP_UPLOAD_MAX_FILE_SIZE=10MB
APP_UPLOAD_MAX_REQUEST_SIZE=30MB

SENTRY_ENABLED=false
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=tiza-app@deploy
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_SEND_DEFAULT_PII=false
SENTRY_LOGS_ENABLED=false
SENTRY_PROFILE_SESSION_SAMPLE_RATE=0.0
SENTRY_PROFILE_LIFECYCLE=TRACE
EOF
```

## 5. Create website environment file

Create `/var/www/tiza/deploy/env/website.env`:

```bash
cat <<'EOF' > /var/www/tiza/deploy/env/website.env
NODE_ENV=production
PORT=4000
BACKEND_ORIGIN=http://127.0.0.1:8080
EOF
```

## 6. Install systemd services

Create `/etc/systemd/system/tiza-api.service`:

```bash
sudo tee /etc/systemd/system/tiza-api.service > /dev/null <<'EOF'
[Unit]
Description=Tiza Spring Boot API
After=network.target

[Service]
Type=simple
User=deployer
WorkingDirectory=/var/www/tiza/api
EnvironmentFile=/var/www/tiza/deploy/env/app.env
ExecStart=/usr/bin/java -jar /var/www/tiza/api/app.jar
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

Create `/etc/systemd/system/tiza-web.service`:

```bash
sudo tee /etc/systemd/system/tiza-web.service > /dev/null <<'EOF'
[Unit]
Description=Tiza Angular SSR Website
After=network.target

[Service]
Type=simple
User=deployer
WorkingDirectory=/var/www/tiza/web
EnvironmentFile=/var/www/tiza/deploy/env/website.env
ExecStart=/usr/bin/node /var/www/tiza/web/dist/website/server/server.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

Reload services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tiza-api
sudo systemctl enable tiza-web
```

## 7. Install Nginx sites

Create `/etc/nginx/sites-available/tiza-admin`:

```bash
sudo tee /etc/nginx/sites-available/tiza-admin > /dev/null <<'EOF'
server {
    listen 80;
    server_name tiza-admin.dartajer.space;

    root /var/www/tiza/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

Create `/etc/nginx/sites-available/tiza-web`:

```bash
sudo tee /etc/nginx/sites-available/tiza-web > /dev/null <<'EOF'
server {
    listen 80;
    server_name tiza.dartajer.space;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

Create `/etc/nginx/sites-available/tiza-api`:

```bash
sudo tee /etc/nginx/sites-available/tiza-api > /dev/null <<'EOF'
server {
    listen 80;
    server_name tiza-api.dartajer.space;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

Enable sites:

```bash
sudo ln -sf /etc/nginx/sites-available/tiza-admin /etc/nginx/sites-enabled/tiza-admin
sudo ln -sf /etc/nginx/sites-available/tiza-web /etc/nginx/sites-enabled/tiza-web
sudo ln -sf /etc/nginx/sites-available/tiza-api /etc/nginx/sites-enabled/tiza-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Allow service restarts for the deploy user

Run `sudo visudo` and add:

```text
swiftsell ALL=NOPASSWD:/usr/bin/systemctl restart tiza-api,/usr/bin/systemctl restart tiza-web
```

## 9. Add the GitHub secret

Add this repository secret in GitHub:

- `DEPLOY_SSH_KEY`

This private key must match a public key present in:

```bash
/home/swiftsell/.ssh/authorized_keys
```

## 10. First deployment

After the server is ready, push to `main` or run the GitHub Actions workflow manually.

Frontend behavior:

- `admin` uploads only the built static files from `dist/tiza-admin/browser`
- `website` uploads only the built SSR output from `dist/website` plus the package manifests needed for runtime dependencies
- frontend source files are not deployed to the server

Then verify:

```bash
sudo systemctl status tiza-api
sudo systemctl status tiza-web
curl -I http://127.0.0.1:8080
curl -I http://127.0.0.1:4000
sudo tail -f /var/log/nginx/error.log
```

## 11. HTTPS

After DNS is pointed correctly, install TLS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tiza-admin.dartajer.space -d tiza.dartajer.space -d tiza-api.dartajer.space
```
