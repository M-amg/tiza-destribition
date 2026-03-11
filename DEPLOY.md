# Deployment

This repository deploys without Docker.

Current deploy targets:

- Backend: `/app`
- Admin frontend: `/admin`
- Website frontend: `/website`

## GitHub Actions

The root repository includes:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

`ci.yml` verifies:

- Spring Boot backend
- Angular admin build
- Angular SSR website build

`deploy.yml` builds release artifacts in GitHub Actions, uploads only the built outputs to the Linux server over SSH, then runs `scripts/deploy-server.sh` remotely.

## Required GitHub secrets

- `DEPLOY_SSH_KEY`

## Optional GitHub variables

- `API_SERVICE_NAME` default `tiza-api`
- `WEBSITE_SERVICE_NAME` default `tiza-web`

## Server prerequisites

- Java 21
- Node.js 20 and npm
- Nginx
- `rsync`
- `systemd`
- a deploy user with SSH access
- the deploy user must be allowed to restart the app services

## Server files

Templates are included under `deploy/`:

- `deploy/SERVER_SETUP.md`
- `deploy/env/app.env.example`
- `deploy/env/website.env.example`
- `deploy/systemd/tiza-api.service.example`
- `deploy/systemd/tiza-web.service.example`
- `deploy/nginx/admin.conf.example`
- `deploy/nginx/website.conf.example`
- `deploy/nginx/api.conf.example`

Recommended layout:

- `/var/www/tiza/api/app.jar`
- `/var/www/tiza/api/uploads`
- `/var/www/tiza/web`
- `/var/www/tiza/admin`
- `/var/www/tiza/deploy/env/app.env`
- `/var/www/tiza/deploy/env/website.env`

## Notes

- `admin` is deployed by uploading only the built static files from `dist/tiza-admin/browser`.
- `website` is deployed by uploading only the compiled SSR build from `dist/website` plus runtime package manifests.
- frontend source code is not deployed.
- `website` runs as a Node SSR service on port `4000` by default.
- `website` proxies `/api` and `/uploads` to `BACKEND_ORIGIN`.
- Configs are prefilled for `tiza-admin.dartajer.space`, `tiza.dartajer.space`, and `tiza-api.dartajer.space`.
- Mobile deployment is intentionally not included yet.
