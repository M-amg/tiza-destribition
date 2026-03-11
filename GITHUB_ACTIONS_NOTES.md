# GitHub Actions Notes

This workspace is split across multiple projects, but only these folders are currently Git repositories:

- `website`
- `Mobile/native-app`

The GitHub Actions workflows added in this setup live inside those two repos:

- `website/.github/workflows/ci.yml`
- `Mobile/native-app/.github/workflows/ci.yml`

The `app` and `admin` folders are not Git repositories yet, so GitHub will not run workflow files from them unless you either:

1. make `c:\DevProjects\tiza` the single root repository, or
2. turn `app` and `admin` into their own repositories.

Once that is decided, add workflows for:

- `app`: Maven build, tests, packaging, and deployment
- `admin`: Angular build and static artifact deployment

For real deployment later, you will still need target-specific secrets and commands for your hosting platform.
