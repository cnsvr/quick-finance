# Fix iOS Project - QuickFinance

## Problem
The iOS folder is missing the Xcode project files (`.xcodeproj` and `.xcworkspace`).
The `npm run mobile:ios` command fails because it can't find `project.pbxproj`.

## Solution
We need to recreate the iOS project structure with proper Xcode files.

## Steps to Fix

### Option 1: Use CocoaPods to Reinitialize (Recommended)

1. **Install dependencies first:**
```bash
cd /Users/furkancansever/dev/finance-tracker/mobile
npm install
```

2. **Install iOS pods:**
```bash
cd ios
pod install
```

If `pod install` fails because no Podfile exists, proceed to Option 2.

### Option 2: Recreate iOS Folder from Template

1. **Create a new temporary React Native project:**
```bash
cd /Users/furkancansever/dev/finance-tracker
npx react-native@0.83.1 init QuickFinanceTemp --pm npm
```

2. **Copy the iOS folder:**
```bash
# Backup existing ios folder (has your icons)
mv mobile/ios mobile/ios_backup

# Copy fresh iOS folder from temp project
cp -r QuickFinanceTemp/ios mobile/ios

# Copy back your icons
cp -r mobile/ios_backup/quickfinance/*.png mobile/ios/QuickFinanceTemp/Images.xcassets/AppIcon.appiconset/
cp mobile/ios_backup/quickfinance/LaunchScreen.storyboard mobile/ios/QuickFinanceTemp/
```

3. **Rename the project in Xcode:**
```bash
open mobile/ios/QuickFinanceTemp.xcworkspace
```

In Xcode:
- Click project name → Rename to "quickfinance"
- Update Display Name to "QuickFinance"
- Update Bundle ID to "com.furkancansever.quickfinance"

4. **Clean up:**
```bash
rm -rf QuickFinanceTemp
```

### Option 3: Manual Fix (Advanced)

Create the missing Xcode project manually by copying from another React Native project.

## After Fix

1. **Install pods:**
```bash
cd mobile/ios
pod install
```

2. **Run the app:**
```bash
cd ..
npm run ios
```

## Current Status

- ✅ App icons exist in `/mobile/ios/quickfinance/`
- ✅ LaunchScreen.storyboard exists
- ✅ All source code exists in `/mobile/src/`
- ✅ App.tsx exists
- ❌ Missing `.xcodeproj` files
- ❌ Missing `.xcworkspace` files
- ❌ Missing `Podfile`

## Notes

The app code is complete and working. We just need the iOS project files to build and run it.
