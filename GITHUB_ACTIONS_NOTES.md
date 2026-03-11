# GitHub Actions Notes

This repository now uses root-level GitHub Actions workflows for the active deployable apps:

- `app`
- `admin`
- `website`

The workflows live here:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

What they do:

- `ci.yml`: verifies the Spring Boot backend and builds both Angular frontends
- `deploy.yml`: rebuilds the three deployable apps, uploads build artifacts to a Linux server over SSH, and runs a plain shell deployment script remotely

Required repository secrets for deployment:

- `DEPLOY_SSH_KEY`

The current workflow is preconfigured for:

- host: `199.192.21.203`
- user: `swiftsell`
- deploy root: `/var/www/tiza`
- admin dir: `/var/www/tiza/admin`
- website dir: `/var/www/tiza/web`
- api dir: `/var/www/tiza/api`
- admin domain: `tiza-admin.dartajer.space`
- website domain: `tiza.dartajer.space`
- api domain: `tiza-api.dartajer.space`

Server prerequisites:

- Java 21
- Node.js 20 and npm
- Nginx
- systemd
- rsync
- a Linux user with SSH access and permission to restart the app services

`Mobile` is intentionally not part of the current root deployment workflow.
