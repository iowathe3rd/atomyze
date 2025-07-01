# GitHub Actions Setup Guide

This guide explains how to set up GitHub Actions workflows for automated testing, building, and releases while maintaining your personal contribution graph.

## 🎯 Philosophy: Manual Review for Clean Contribution Graph

Instead of making automated commits under your name, our workflows create **Pull Requests for review**. This approach:

- ✅ Keeps your contribution graph clean and authentic
- ✅ Ensures you review all changes before they're merged
- ✅ Maintains full control over what gets released
- ✅ Follows best practices for repository management
- ✅ Provides clear audit trail of all changes

## 🔧 Required Setup

### 1. Repository Secrets

You need to configure these secrets in your GitHub repository settings:

- `NPM_TOKEN` - For publishing to npm registry
- `GITHUB_TOKEN` - Automatically provided by GitHub (no setup needed)

### 2. Update Workflow Files

Replace `your-username` in the following files with your actual GitHub username:

- `.github/workflows/auto-assign.yml` (line 15 and 36)
- `.github/workflows/ci-cd.yml` (line 47)
- `.github/workflows/dependabot-auto-merge.yml` (line 32 and 55)

### 3. Repository Settings

Enable the following in your repository settings:

1. **Pull Requests** → Enable "Allow auto-merge"
2. **Branches** → Add branch protection rules for `main`:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

## 🤖 How Automated Workflows Work

### Release Process

1. **Automatic Detection**: When you push to `main`, the system checks if a release is needed
2. **PR Creation**: If a release is needed, a PR is created with the proposed changes
3. **Review Request**: You're automatically requested to review the PR
4. **Manual Merge**: You review and merge the PR manually
5. **Release Execution**: The actual release happens after your merge

### Dependabot Updates

1. **PR Creation**: Dependabot creates PRs for dependency updates
2. **Analysis**: The system analyzes the update type (patch/minor/major)
3. **Review Request**: You're requested to review with context about the update
4. **Manual Decision**: You decide whether to merge based on the analysis

### Feature PRs

1. **Auto-Label**: PRs are automatically labeled based on changed files
2. **Review Request**: You're automatically requested to review
3. **Status Checks**: All tests and checks must pass
4. **Manual Merge**: You review and merge manually

## 📊 Benefits for Your Contribution Graph

- **Clean Graph**: Only your actual commits appear, not bot commits
- **Authentic Activity**: Shows your real development activity
- **Professional Profile**: Maintains the integrity of your GitHub profile
- **Control**: You decide what gets merged and when

## 🛠 Workflow Details

### CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

- **Triggers**: Push to main/develop, PRs to main
- **Tests**: Runs on Node.js 18.x and 20.x
- **Checks**: Linting, type checking, tests, build
- **Release**: Creates PR for review instead of direct release

### Auto-assign (`.github/workflows/auto-assign.yml`)

- **Triggers**: New PRs opened
- **Actions**: Requests your review, adds labels
- **Benefits**: Ensures you see all PRs

### Dependabot Review (`.github/workflows/dependabot-auto-merge.yml`)

- **Triggers**: Dependabot PRs
- **Actions**: Analyzes update, requests review with context
- **Safety**: Major updates get special attention

## 🚀 Getting Started

1. **Clone and setup**: Follow the main README for project setup
2. **Update usernames**: Replace `your-username` in workflow files
3. **Configure secrets**: Add NPM_TOKEN in repository settings
4. **Test the workflows**: Create a test PR to verify everything works
5. **Enable branch protection**: Set up required reviews for main branch

## 🔄 Typical Workflow

1. You make changes and push to a feature branch
2. Create a PR → Auto-assign workflow requests your review
3. CI runs tests → You review results
4. Merge PR → Release workflow creates release PR if needed
5. Review release PR → Merge to trigger actual release
6. Dependabot updates → Review and merge dependency updates

## ⚡ Quick Commands

```bash
# Check workflow status
gh run list

# View specific workflow run
gh run view <run-id>

# Manually trigger release (if needed)
gh workflow run release

# Check pending PRs needing your review
gh pr list --review-requested=@me
```

This setup ensures you maintain full control while benefiting from automation!
