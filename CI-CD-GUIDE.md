# CI/CD Workflow Guide

## Overview
This project uses GitHub Actions for automated Continuous Integration (CI) and Continuous Deployment (CD).

## Workflow Architecture

### 1. Staging Pipeline (ci-staging.yml)
**Triggers:** Push to `development` / `develop` branches or PRs

**What it does:**
- ✅ Runs tests for frontend and backend
- ✅ Runs linters
- ✅ Builds Docker images (no push to registry)
- ✅ Validates code quality

**Status:** Runs on every commit to development

---

### 2. Production Pipeline (cd-production.yml)
**Triggers:** Git tags matching `v*.*.*` pattern (e.g., `v1.0.0`)

**What it does:**
- ✅ Builds Docker images with version tags
- ✅ Pushes images to container registry (ghcr.io)
- ✅ Creates GitHub Release
- ✅ Runs integration tests on main branch

**Status:** Runs only when you push a semantic version tag

---

## Git Flow & Deployment Process

### Step 1: Develop on Feature Branch
```bash
git checkout -b feature/your-feature development
# Make changes, commit
git push origin feature/your-feature
```
✅ Staging CI runs automatically

### Step 2: Create Pull Request
```
- Create PR: feature/your-feature → development
- CI runs tests
- Code review
- Merge to development
```

### Step 3: Prepare for Production
```bash
# Switch to main
git checkout main
# Merge development into main
git merge development
# Create semantic version tag
git tag v1.0.0
# Push tag to trigger CD
git push origin v1.0.0
```
✅ Production CD runs, builds images, creates release

### Step 4: Verify Deployment
- Check GitHub Actions tab for workflow status
- Verify Docker images in container registry
- Check GitHub Releases page

---

## Environment Variables & Secrets

### Required GitHub Secrets
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions

### Optional Secrets (for deployment)
- `DOCKER_REGISTRY_USERNAME` - If using private registry
- `DOCKER_REGISTRY_PASSWORD` - Registry credentials
- `DEPLOY_KEY` - SSH key for server deployment
- `SLACK_WEBHOOK_URL` - For notifications

---

## Semantic Versioning Guide

Use standard semantic versioning for tags:

```
v MAJOR.MINOR.PATCH
  ↓      ↓     ↓
  Breaking changes
              New features (backward compatible)
                     Bug fixes
```

Examples:
- `v1.0.0` - Initial release
- `v1.1.0` - New features added
- `v1.0.1` - Bug fix
- `v2.0.0` - Major breaking changes

---

## Checking Workflow Status

### In GitHub Actions Tab:
1. Go to **Actions** tab in GitHub
2. Select workflow (ci-staging.yml or cd-production.yml)
3. View logs for each job

### View Workflow Runs:
```bash
# List recent workflow runs
gh run list --repo datcodethu/nodejs-2

# View specific run details
gh run view <run-id> --repo datcodethu/nodejs-2
```

---

## Troubleshooting

### Workflow not triggering?
- ✅ Check branch name matches trigger conditions
- ✅ Verify tags match `v*.*.*` pattern
- ✅ Ensure `.github/workflows/*.yml` files are committed

### Build fails?
- ✅ Check test output in Actions tab
- ✅ Verify Dockerfile exists and is valid
- ✅ Ensure environment variables are set

### Docker image not pushed?
- ✅ Verify GITHUB_TOKEN has package:write permission
- ✅ Check registry is correct (ghcr.io)
- ✅ Ensure tag was pushed (not just commit)

---

## Workflow Files Location

- **Staging Pipeline:** `.github/workflows/ci-staging.yml`
- **Production Pipeline:** `.github/workflows/cd-production.yml`

## Next Steps

1. ✅ Commit these workflow files
2. ✅ Create Dockerfiles for frontend and backend (if not exist)
3. ✅ Test by pushing to development branch
4. ✅ Create first production tag when ready

---

**Last Updated:** December 11, 2025
