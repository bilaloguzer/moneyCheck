# Troubleshooting Guide - moneyCheck

## Installation Issues on Windows

### Problem: `npm install` fails with ERESOLVE error

**Error Message:**
```
npm error ERESOLVE could not resolve
npm error While resolving: react-dom@19.2.0
npm error Found: react@19.1.0
```

**Solution 1 - Pull Latest Changes (RECOMMENDED):**
```bash
# Make sure you have the latest package.json
git pull origin main

# Delete old files
rm -rf node_modules package-lock.json
# Or on Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstall
npm install
```

**Solution 2 - Use Legacy Peer Deps:**
```bash
npm install --legacy-peer-deps
```

**Solution 3 - Clean Install:**
```bash
# Delete everything
rm -rf node_modules package-lock.json .expo
# Or on Windows:
Remove-Item -Recurse -Force node_modules, package-lock.json, .expo

# Install with exact versions
npm ci --legacy-peer-deps
```

---

## Common Windows Issues

### Issue: 'expo' is not recognized

**Problem:**
```bash
npx expo install
'expo' is not recognized as an internal or external command
```

**Solution:**
```bash
# Install expo globally first
npm install -g expo-cli

# Or use npx with full path
npx --yes expo install
```

---

### Issue: Permission Denied on Windows

**Solution:**
Run PowerShell or Command Prompt as Administrator

---

### Issue: Long Path Names on Windows

**Error:** File paths too long

**Solution:**
```bash
# Enable long paths in Windows
git config --system core.longpaths true
```

---

## Step-by-Step Setup for Windows

### 1. Prerequisites

```bash
# Check Node version (should be 18.x or 20.x)
node --version

# Check npm version
npm --version

# If outdated, download from: https://nodejs.org/
```

### 2. Clone Repository

```bash
# Using HTTPS
git clone https://github.com/YOUR_USERNAME/moneyCheck.git

# Navigate to project
cd moneyCheck\moneyCheck
```

### 3. Install Dependencies

```bash
# Option A: Normal install (try this first)
npm install

# Option B: If Option A fails
npm install --legacy-peer-deps

# Option C: Clean install
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
```

### 4. Start Development Server

```bash
# Clear cache and start
npm start -- --clear

# Or manually clear:
Remove-Item -Recurse -Force .expo, node_modules\.cache
npm start
```

---

## macOS/Linux Issues

### Issue: Permission Denied

**Solution:**
```bash
sudo chown -R $(whoami) ~/.npm
```

### Issue: Command Not Found

**Solution:**
```bash
# Add npm bin to PATH
export PATH="$PATH:$(npm bin -g)"
```

---

## Git Issues

### Issue: Line Ending Warnings

**Windows:**
```bash
git config --global core.autocrlf true
```

**macOS/Linux:**
```bash
git config --global core.autocrlf input
```

### Issue: Merge Conflicts

**Solution:**
```bash
# See conflicted files
git status

# Abort merge if needed
git merge --abort

# Or resolve conflicts manually, then:
git add .
git commit -m "merge: resolve conflicts"
```

---

## Expo Issues

### Issue: Metro Bundler Cache

**Solution:**
```bash
# Windows:
Remove-Item -Recurse -Force .expo, node_modules\.cache
npm start -- --clear

# macOS/Linux:
rm -rf .expo node_modules/.cache
npm start -- --clear
```

### Issue: Port Already in Use

**Solution:**
```bash
# Kill process on port 8081 (Windows)
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8081 | xargs kill -9
```

---

## TypeScript Issues

### Issue: Cannot find module '@/lib/types'

**Solution:**
```bash
# Make sure you're in the right directory
cd moneyCheck

# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P → TypeScript: Restart TS Server
```

### Issue: Type errors everywhere

**Solution:**
```bash
# Make sure all dependencies are installed
npm install

# Restart VS Code
```

---

## Camera Issues (iOS)

### Issue: Camera not working in Simulator

**Solution:**
Camera doesn't work in iOS Simulator. You must test on a real device.

**To test on real device:**
1. Download Expo Go app from App Store
2. Scan QR code from terminal
3. Camera will work on real device

---

## Android Issues

### Issue: Failed to install the app

**Solution:**
```bash
# Clear Android build cache
cd android
./gradlew clean
cd ..

# Reinstall
npx expo run:android
```

---

## Database Issues

### Issue: Database locked

**Solution:**
```bash
# Delete old database
# iOS Simulator:
rm -rf ~/Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/Documents/*.db

# Android Emulator:
adb shell
cd /data/data/com.moneycheck.app/databases
rm *.db
```

---

## Quick Fixes

### Problem: App won't start

```bash
# 1. Clear everything
Remove-Item -Recurse -Force .expo, node_modules, package-lock.json

# 2. Reinstall
npm install --legacy-peer-deps

# 3. Start fresh
npm start -- --clear
```

### Problem: White screen on app

```bash
# Check terminal for errors
# Usually a JS error - check the code

# Or reload app:
# Press 'r' in terminal
# Or shake device and tap "Reload"
```

### Problem: Changes not reflecting

```bash
# 1. Reload app (press 'r')
# 2. Clear cache and restart
npm start -- --clear
```

---

## Getting Help

1. **Check terminal for errors** - Most issues show error messages
2. **Read the error message** - It usually tells you what's wrong
3. **Google the error** - Add "expo" or "react native" to search
4. **Check Expo docs** - https://docs.expo.dev
5. **Ask your partner** - They might have seen it before

---

## Useful Commands

```bash
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json, .expo
npm install --legacy-peer-deps
npm start -- --clear

# macOS/Linux:
rm -rf node_modules package-lock.json .expo
npm install
npm start -- --clear

# Check what's running:
# Windows:
netstat -ano

# macOS/Linux:
lsof -i -P
```

---

## Contact Info

If you're stuck for more than 30 minutes:
1. Take a screenshot of the error
2. Note what you were doing when it happened
3. Send to your partner with context
4. Pair program to debug together

---

## Known Issues (Don't Worry About These)

- ✅ npm deprecation warnings for `inflight`, `glob`, `rimraf` - Safe to ignore
- ✅ Warning about `react-native-vision-camera` peer deps - Working fine
- ✅ Expo warning about "new architecture" - Optional, can ignore

---

## Success Indicators

You know it's working when:
- ✅ `npm install` completes without errors
- ✅ `npm start` opens Metro bundler
- ✅ You see QR code in terminal
- ✅ App loads on simulator/device
- ✅ You can navigate between tabs

---

Happy debugging! 🐛➡️✨
