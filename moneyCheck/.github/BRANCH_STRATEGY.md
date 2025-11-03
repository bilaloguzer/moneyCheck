# Git Branch Strategy - moneyCheck (2 Developers)

## Branch Structure

```
main (production-ready)
  │
  ├── development (integration branch)
  │     │
  │     ├── feature/frontend/* (Developer 1)
  │     │     ├── feature/frontend/home-screen
  │     │     ├── feature/frontend/camera-ui
  │     │     └── feature/frontend/receipt-list
  │     │
  │     └── feature/backend/* (Developer 2)
  │           ├── feature/backend/ocr-service
  │           ├── feature/backend/database-setup
  │           └── feature/backend/analytics-logic
  │
  └── hotfix/* (urgent production fixes)
```

## Branch Responsibilities

### Developer 1 (Frontend)
**Works on:** UI components, screens, navigation
**Branch prefix:** `feature/frontend/*`
**Main files:**
- `app/**/*` (screens and routes)
- `components/**/*` (UI components)
- Style files

### Developer 2 (Backend)
**Works on:** Business logic, services, database
**Branch prefix:** `feature/backend/*`
**Main files:**
- `lib/services/**/*`
- `lib/database/**/*`
- `lib/hooks/**/*`
- `lib/models/**/*`

**Shared files (coordinate before editing):**
- `lib/types/**/*`
- `lib/config/**/*`
- `lib/constants/**/*`

## Workflow

### 1. Initial Setup (Both Developers)

```bash
# Clone the repository
git clone <repository-url>
cd moneyCheck

# Create and push development branch (only once, by one developer)
git checkout -b development
git push -u origin development

# Both developers should have these branches locally
git checkout main
git checkout development
```

### 2. Starting a New Feature

**Developer 1 (Frontend):**
```bash
git checkout development
git pull origin development
git checkout -b feature/frontend/home-screen
# Work on your feature...
```

**Developer 2 (Backend):**
```bash
git checkout development
git pull origin development
git checkout -b feature/backend/ocr-service
# Work on your feature...
```

### 3. Daily Workflow

```bash
# Start of day - sync with development
git checkout development
git pull origin development
git checkout <your-feature-branch>
git merge development  # or: git rebase development

# Work on your code...
git add .
git commit -m "feat: add receipt camera UI"

# End of day - push your work
git push -u origin <your-feature-branch>
```

### 4. Creating Pull Request

```bash
# Before creating PR, sync with latest development
git checkout development
git pull origin development
git checkout <your-feature-branch>
git merge development
# Resolve any conflicts
git push origin <your-feature-branch>

# Then create PR on GitHub:
# feature/frontend/home-screen → development
# feature/backend/ocr-service → development
```

### 5. PR Review Process

1. Developer creates PR
2. Other developer reviews the code
3. Address review comments
4. Once approved, merge to `development`
5. Delete the feature branch

```bash
# After PR is merged, clean up
git checkout development
git pull origin development
git branch -d <your-feature-branch>  # Delete local branch
```

### 6. Release to Production

```bash
# When ready for release (both developers coordinate)
git checkout main
git pull origin main
git merge development
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags
```

## Commit Message Convention

Use conventional commits format:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code restructuring
test: adding tests
chore: updating build tasks, package manager configs, etc
```

**Examples:**
```bash
git commit -m "feat(ui): add receipt card component"
git commit -m "fix(ocr): handle Turkish character encoding"
git commit -m "refactor(database): optimize receipt queries"
```

## Conflict Resolution

### If you have merge conflicts:

```bash
# Pull latest development
git checkout development
git pull origin development

# Merge into your feature branch
git checkout <your-feature-branch>
git merge development

# VS Code will show conflicts - resolve them
# After resolving:
git add .
git commit -m "merge: resolve conflicts with development"
git push origin <your-feature-branch>
```

## Branch Protection Rules (Set on GitHub)

### `main` branch:
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Dismiss stale approvals
- ✅ Require status checks to pass
- ❌ Allow force pushes: No
- ❌ Allow deletions: No

### `development` branch:
- ✅ Require pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass
- ❌ Allow force pushes: No

## Quick Reference Commands

### Developer 1 (Frontend) - Typical Day

```bash
# Morning sync
git checkout development && git pull
git checkout feature/frontend/camera-ui && git merge development

# Work...
git add app/receipt/capture.tsx
git commit -m "feat(camera): add edge detection overlay"

# Push progress
git push origin feature/frontend/camera-ui

# Create PR when ready (via GitHub web interface)
```

### Developer 2 (Backend) - Typical Day

```bash
# Morning sync
git checkout development && git pull
git checkout feature/backend/ocr-service && git merge development

# Work...
git add lib/services/ocr/OCRService.ts
git commit -m "feat(ocr): implement ML Kit text recognition"

# Push progress
git push origin feature/backend/ocr-service

# Create PR when ready (via GitHub web interface)
```

## Parallel Work Strategy

### Week 1-2: Foundation
- **Dev 1**: Navigation setup, basic screens, common components
- **Dev 2**: Database setup, schema, migrations, repositories

### Week 3-4: Receipt Capture
- **Dev 1**: Camera UI, image preview, capture flow
- **Dev 2**: OCR service, text parser, merchant matcher

### Week 5-6: Receipt Management
- **Dev 1**: Receipt detail screen, edit UI, list components
- **Dev 2**: Receipt CRUD, image storage, data validation

### Week 7-8: Analytics
- **Dev 1**: Analytics screens, charts, visualizations
- **Dev 2**: Analytics service, aggregation queries, export

### Week 9-10: Price Comparison
- **Dev 1**: Price comparison UI, savings display
- **Dev 2**: Price matching service, comparison logic

### Week 11-12: Polish
- **Dev 1**: Onboarding flow, settings screens
- **Dev 2**: Performance optimization, error handling

### Week 13-15: Testing & Deployment
- **Both**: Bug fixes, testing, documentation, deployment

## Communication

### Daily standup (async or sync):
- What did you work on yesterday?
- What will you work on today?
- Any blockers or conflicts?

### Before pushing shared files:
Ping the other developer on Slack/Discord:
> "Hey, I'm updating `lib/types/receipt.types.ts` - let me know if you're working on it too"

## Emergency Hotfix

```bash
# Critical bug in production
git checkout main
git checkout -b hotfix/critical-bug-name
# Fix the bug
git commit -m "fix: critical bug description"
git push origin hotfix/critical-bug-name

# Create PR: hotfix/critical-bug-name → main
# After merge to main, also merge to development
git checkout development
git merge main
git push origin development
```

## .gitignore Essentials (Already configured)

```
node_modules/
.expo/
.env
*.db
*.log
```

## Tips for Smooth Collaboration

1. **Pull `development` every morning** before starting work
2. **Push your work every evening** (even if not complete)
3. **Keep feature branches short-lived** (max 2-3 days)
4. **Review each other's PRs within 24 hours**
5. **Communicate before editing shared files**
6. **Write descriptive commit messages**
7. **Test your code before creating PR**
8. **Keep PRs small** (easier to review)
