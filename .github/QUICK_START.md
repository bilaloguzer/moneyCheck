# 🚀 Quick Start Guide - moneyCheck

## For New Developers

### 1️⃣ Clone & Install (5 minutes)

```bash
git clone https://github.com/YOUR_USERNAME/moneyCheck.git
cd moneyCheck/moneyCheck
npm install
```

### 2️⃣ Run the App (2 minutes)

```bash
rm -rf .expo node_modules/.cache && npx expo start --clear

# Then press:
# i - iOS simulator
# a - Android emulator
```

### 3️⃣ Create Your First Branch

**Developer 1 (Frontend):**
```bash
git checkout development
git checkout -b feature/frontend/your-task-name
```

**Developer 2 (Backend):**
```bash
git checkout development
git checkout -b feature/backend/your-task-name
```

---

## Daily Workflow

### Morning ☀️
```bash
git checkout development && git pull
git checkout your-branch && git merge development
```

### Work 💻
```bash
# Make changes...
git add .
git commit -m "feat: what you did"
git push origin your-branch
```

### Evening 🌙
```bash
git push origin your-branch  # Backup your work!
```

---

## File Ownership

### Developer 1 Works Here:
```
app/                    # All screens
components/             # All UI components
```

### Developer 2 Works Here:
```
lib/services/           # Business logic
lib/database/           # Database code
lib/hooks/              # Custom hooks
```

### Shared (Coordinate First):
```
lib/types/              # TypeScript types
lib/config/             # Configuration
lib/constants/          # Constants
```

---

## Creating a Pull Request

1. **Sync with development**
   ```bash
   git checkout development && git pull
   git checkout your-branch && git merge development
   ```

2. **Push your branch**
   ```bash
   git push origin your-branch
   ```

3. **Create PR on GitHub**
   - Go to GitHub → Pull Requests → New
   - Base: `development` ← Compare: `your-branch`
   - Fill in the template
   - Request review from other developer

4. **After approval & merge**
   ```bash
   git checkout development && git pull
   git branch -d your-branch
   ```

---

## Useful Commands

```bash
# See your current branch
git branch

# See changed files
git status

# See recent commits
git log --oneline -5

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# Save changes temporarily
git stash
git stash pop  # Restore later
```

---

## Commit Message Format

```bash
feat: add new feature
fix: bug fix
refactor: code restructuring
style: formatting changes
docs: documentation
test: adding tests
chore: build tasks, configs

# Examples:
git commit -m "feat(camera): add edge detection"
git commit -m "fix(ocr): handle Turkish characters"
git commit -m "refactor(db): optimize queries"
```

---

## Need Help?

- **Detailed Git Guide**: `.github/BRANCH_STRATEGY.md`
- **Task Breakdown**: `.github/TASK_ASSIGNMENTS.md`
- **Setup Guide**: `README_SETUP.md`

---

## Architecture Overview

```
moneyCheck/
├── app/                    # 📱 Screens (Expo Router)
│   ├── (tabs)/            # Bottom tabs
│   ├── receipt/           # Receipt flow
│   ├── onboarding/        # First-time user
│   └── settings/          # Settings screens
│
├── components/            # 🎨 UI Components
│   ├── common/            # Buttons, Cards, Inputs
│   ├── receipt/           # Receipt-specific
│   ├── camera/            # Camera-specific
│   └── analytics/         # Charts, Stats
│
└── lib/                   # 🧠 Business Logic
    ├── services/          # OCR, Database, Analytics
    ├── database/          # Schema, Migrations, Repos
    ├── hooks/             # Custom React hooks
    ├── types/             # TypeScript types
    ├── config/            # App configuration
    ├── constants/         # Constants
    ├── utils/             # Helper functions
    └── localization/      # Translations (TR/EN)
```

---

## Tech Stack

- **Framework**: React Native + Expo SDK 52
- **Routing**: Expo Router (file-based)
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **OCR**: Google ML Kit Text Recognition
- **Camera**: expo-camera
- **State**: React Hooks + Context
- **Navigation**: Expo Router

---

## Project Goals

**15-week MVP** for **2 developers**

- ✅ Receipt scanning with OCR
- ✅ Price comparison (100 products, 5 merchants)
- ✅ Spending analytics
- ✅ Turkish language support
- ✅ Offline-first architecture
- ✅ KVKK compliance

**Target**: 20-50 beta testers in Istanbul

---

## First Week Tasks

### Developer 1
- [ ] Set up navigation
- [ ] Create basic UI components
- [ ] Build placeholder screens

### Developer 2
- [ ] Set up database
- [ ] Write migrations
- [ ] Seed merchant data

---

## Questions?

Ask your partner! Communication is key 🗣️

**Before editing shared files, always ping the other dev:**
> "Working on `lib/types/receipt.types.ts` - give me 10 mins"

---

Happy coding! 🎉
