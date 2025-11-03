# 🪟 Windows Setup Guide - moneyCheck

## For the Other Developer (Windows)

### Step 1: Pull the Latest Code

```powershell
# Navigate to project
cd C:\Users\cisem\Projects\BitirmeProjesi\moneyCheck\moneyCheck

# Pull latest changes (this fixes the React version issue)
git pull origin main
```

### Step 2: Clean Install

```powershell
# Delete old files (PowerShell)
Remove-Item -Recurse -Force node_modules, package-lock.json, .expo -ErrorAction SilentlyContinue

# Or use Command Prompt:
# rmdir /s /q node_modules
# del package-lock.json
```

### Step 3: Install Dependencies

```powershell
# Try normal install first
npm install

# If that fails, use legacy peer deps:
npm install --legacy-peer-deps
```

### Step 4: Start the App

```powershell
# Start development server
npm start

# This will open Metro bundler
# Press 'w' for web browser
# Or scan QR code with Expo Go app on your phone
```

---

## What Was Fixed?

**Problem:** React version mismatch (19.1.0 vs 19.2.0)

**Solution:** Updated `package.json` to use React 19.2.0

The fix is now in the repository, so when you pull the latest code, you'll get the correct version.

---

## Quick Commands (Copy & Paste)

### For PowerShell:

```powershell
cd C:\Users\cisem\Projects\BitirmeProjesi\moneyCheck\moneyCheck
git pull origin main
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
npm start
```

### For Command Prompt:

```cmd
cd C:\Users\cisem\Projects\BitirmeProjesi\moneyCheck\moneyCheck
git pull origin main
rmdir /s /q node_modules
del package-lock.json
npm install
npm start
```

---

## If You Still Get Errors

### Error: ERESOLVE conflicts

```powershell
npm install --legacy-peer-deps
```

### Error: Permission denied

Run PowerShell/CMD as Administrator (Right-click → Run as Administrator)

### Error: 'expo' is not recognized

```powershell
# This is normal - you don't need expo-cli globally
# Just use: npm start
```

---

## Verify It's Working

After running `npm start`, you should see:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

**Success!** ✅ You can now:
- Press 'w' to open in web browser
- Scan QR code with your phone (download "Expo Go" app first)

---

## First Time Setup Checklist

- [ ] Node.js installed (v18 or v20) - Check: `node --version`
- [ ] Git installed - Check: `git --version`
- [ ] Project cloned
- [ ] Latest code pulled (`git pull origin main`)
- [ ] Dependencies installed (`npm install`)
- [ ] App starts (`npm start`)
- [ ] Can see Metro bundler in terminal

---

## Next Steps

1. ✅ Get the app running
2. ✅ Install "Expo Go" on your phone
3. ✅ Scan QR code to test on phone
4. ✅ Create your first feature branch:
   ```powershell
   git checkout development
   git checkout -b feature/backend/your-task
   ```
5. ✅ Start coding!

---

## Download Links

- **Node.js**: https://nodejs.org/ (Download LTS version)
- **Git**: https://git-scm.com/download/win
- **VS Code**: https://code.visualstudio.com/
- **Expo Go** (Phone):
  - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
  - iOS: https://apps.apple.com/app/expo-go/id982107779

---

## Need More Help?

Check `TROUBLESHOOTING.md` in the project root for detailed solutions to common problems.

Or message your partner! 💬
