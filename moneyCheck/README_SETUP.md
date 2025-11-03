# moneyCheck - Git Setup for 2 Developers

## Initial Setup (Do this once)

### Step 1: Push to GitHub

```bash
# Create a new repository on GitHub (https://github.com/new)
# Repository name: moneyCheck
# DO NOT initialize with README, .gitignore, or license

# Then run these commands:
cd moneyCheck
git remote add origin https://github.com/YOUR_USERNAME/moneyCheck.git
git push -u origin main
```

### Step 2: Create Development Branch

```bash
# Create development branch
git checkout -b development
git push -u origin development

# Set development as default branch on GitHub:
# Go to: Settings → Branches → Default branch → Switch to 'development'
```

### Step 3: Set Branch Protection Rules

Go to GitHub → Settings → Branches → Add Rule

**For `main` branch:**
- Branch name pattern: `main`
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Dismiss stale approvals when new commits are pushed
- ❌ Allow force pushes: No
- ❌ Allow deletions: No

**For `development` branch:**
- Branch name pattern: `development`
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ❌ Allow force pushes: No

## Developer 1 (Frontend) - Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/moneyCheck.git
cd moneyCheck/moneyCheck

# Install dependencies
npm install

# Checkout development branch
git checkout development

# Create your first feature branch
git checkout -b feature/frontend/setup-navigation
```

## Developer 2 (Backend) - Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/moneyCheck.git
cd moneyCheck/moneyCheck

# Install dependencies
npm install

# Checkout development branch
git checkout development

# Create your first feature branch
git checkout -b feature/backend/database-setup
```

## Daily Workflow

### Morning Routine (Both Developers)

```bash
# 1. Sync with development
git checkout development
git pull origin development

# 2. Go to your feature branch
git checkout <your-feature-branch>

# 3. Merge latest development changes
git merge development

# 4. Start working!
```

### During Development

```bash
# Make changes to files...

# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat(camera): add edge detection overlay"

# Push to GitHub (backup your work)
git push origin <your-feature-branch>
```

### End of Day

```bash
# Make sure all changes are committed and pushed
git status
git add .
git commit -m "wip: progress on feature X"
git push origin <your-feature-branch>
```

## Creating a Pull Request

### Step 1: Prepare Your Branch

```bash
# Make sure you're on your feature branch
git checkout <your-feature-branch>

# Sync with latest development
git checkout development
git pull origin development
git checkout <your-feature-branch>
git merge development

# Resolve any conflicts if they appear
# After resolving:
git add .
git commit -m "merge: resolve conflicts with development"

# Push final changes
git push origin <your-feature-branch>
```

### Step 2: Create PR on GitHub

1. Go to your repository on GitHub
2. Click "Pull requests" → "New pull request"
3. Base: `development` ← Compare: `feature/frontend/your-feature`
4. Fill in the PR template:
   - Description
   - Type of change
   - Screenshots (for UI changes)
   - Testing checklist
5. Click "Create pull request"
6. Request review from the other developer

### Step 3: Code Review

**Reviewer:**
- Review the code
- Test the changes locally if needed
- Leave comments or approve

**Author:**
- Address review comments
- Push new commits to the same branch
- Request re-review

### Step 4: Merge

Once approved:
1. Click "Merge pull request"
2. Confirm merge
3. Delete the feature branch (GitHub will prompt you)

### Step 5: Clean Up Locally

```bash
# After PR is merged
git checkout development
git pull origin development
git branch -d <your-feature-branch>  # Delete local branch
```

## Example Week 1 Tasks

### Developer 1 (Frontend)

**Day 1-2: Navigation & Screens**
```bash
git checkout -b feature/frontend/basic-screens
# Create basic screen layouts
# Test navigation flow
git commit -m "feat(ui): add basic screen layouts with navigation"
git push origin feature/frontend/basic-screens
# Create PR → development
```

**Day 3-5: Camera UI**
```bash
git checkout -b feature/frontend/camera-ui
# Implement camera screen UI
# Add capture button and controls
git commit -m "feat(camera): implement camera capture UI"
git push origin feature/frontend/camera-ui
# Create PR → development
```

### Developer 2 (Backend)

**Day 1-2: Database Setup**
```bash
git checkout -b feature/backend/database-setup
# Implement database service
# Create schema and migrations
git commit -m "feat(db): implement SQLite database with migrations"
git push origin feature/backend/database-setup
# Create PR → development
```

**Day 3-5: OCR Service**
```bash
git checkout -b feature/backend/ocr-service
# Implement OCR service with ML Kit
# Add text parser
git commit -m "feat(ocr): implement text recognition with ML Kit"
git push origin feature/backend/ocr-service
# Create PR → development
```

## Handling Conflicts

If you get merge conflicts:

```bash
# Scenario: You're trying to merge development into your feature branch

git checkout <your-feature-branch>
git merge development

# Git will show: CONFLICT in file.tsx

# Open the conflicting file in VS Code
# You'll see:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> development

# Choose which changes to keep or combine them
# Remove the conflict markers (<<<, ===, >>>)

# After resolving all conflicts:
git add .
git commit -m "merge: resolve conflicts with development"
git push origin <your-feature-branch>
```

## Common Commands

```bash
# See what branch you're on
git branch

# See what files have changed
git status

# See what changes you've made
git diff

# See commit history
git log --oneline

# Switch branches
git checkout <branch-name>

# Create new branch
git checkout -b <new-branch-name>

# Delete local branch
git branch -d <branch-name>

# Update your local repository
git pull origin <branch-name>

# Push your changes
git push origin <branch-name>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# See all branches (including remote)
git branch -a
```

## Commit Message Examples

```bash
# New feature
git commit -m "feat(camera): add auto focus to camera view"

# Bug fix
git commit -m "fix(ocr): handle null values in Turkish text parser"

# Refactoring
git commit -m "refactor(database): optimize receipt query performance"

# Documentation
git commit -m "docs: add database schema documentation"

# Styling
git commit -m "style(ui): update button colors to match design"

# Work in progress
git commit -m "wip: implementing receipt edit screen"
```

## Troubleshooting

### "Your branch is behind origin/development"

```bash
git pull origin development
```

### "You have uncommitted changes"

```bash
# Save your changes first
git stash

# Pull latest changes
git pull origin development

# Restore your changes
git stash pop
```

### "Permission denied (publickey)"

You need to set up SSH keys or use HTTPS:
```bash
# If you used SSH, switch to HTTPS:
git remote set-url origin https://github.com/YOUR_USERNAME/moneyCheck.git
```

### "Can't push - rejected"

```bash
# Someone else pushed first, pull their changes
git pull origin <your-branch>

# Then push again
git push origin <your-branch>
```

## Quick Reference: Parallel Work

**Files Developer 1 Primarily Works On:**
- `app/**/*` - All screens and routes
- `components/**/*` - All UI components

**Files Developer 2 Primarily Works On:**
- `lib/services/**/*` - All business logic
- `lib/database/**/*` - Database code
- `lib/hooks/**/*` - Custom React hooks

**Shared Files (Coordinate Before Editing):**
- `lib/types/**/*` - TypeScript types
- `lib/config/**/*` - Configuration
- `lib/constants/**/*` - Constants

**Communication:**
Before editing shared files, send a message:
> "Working on `lib/types/receipt.types.ts` - need to add new fields"

## Next Steps

1. ✅ Both developers clone the repo
2. ✅ Both run `npm install`
3. ✅ Both run `rm -rf .expo node_modules/.cache && npx expo start --clear`
4. ✅ Test that the app runs
5. ✅ Create your first feature branches
6. ✅ Start coding!

## Running the App

```bash
# Clear cache and start (first time)
rm -rf .expo node_modules/.cache && npx expo start --clear

# Normal start (subsequent times)
npx expo start

# Then press:
# i - for iOS simulator
# a - for Android emulator
# r - to reload the app
```

## Questions?

Check the detailed guide: `.github/BRANCH_STRATEGY.md`
