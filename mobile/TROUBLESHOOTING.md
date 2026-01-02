# iOS Build Troubleshooting

## Error Code 70 - Common Fixes

### Fix 1: Team Signing (Most Common)

Xcode is now opening. Once it loads:

1. **Click on project name** "FinanceTrackerMobile" in the left sidebar
2. **Select "FinanceTrackerMobile" target** (not the project)
3. **Go to "Signing & Capabilities" tab**
4. **Check "Automatically manage signing"**
5. **Select your Team** (your Apple ID)
6. **Clean build**: Product → Clean Build Folder (Cmd+Shift+K)
7. **Try again**: Product → Run (Cmd+R)

### Fix 2: Change Bundle Identifier

If you don't have a paid Apple Developer account:

1. In Xcode, go to **"Signing & Capabilities"**
2. Change **Bundle Identifier** from:
   ```
   org.reactjs.native.example.FinanceTrackerMobile
   ```
   to something unique:
   ```
   com.yourname.FinanceTrackerMobile
   ```

### Fix 3: Build for Simulator (No Signing Required)

1. In Xcode, top bar, select **"Any iOS Device"**
2. Change to **"iPhone 16"** (or any simulator)
3. Click **Run** (▶ button)

### Fix 4: Command Line

Try specifying simulator explicitly:

```bash
npx react-native run-ios --simulator="iPhone 16"
```

Or use a specific iOS version:

```bash
npx react-native run-ios --simulator="iPhone 16" --udid auto
```

### Fix 5: Clean Everything

```bash
# Clean Metro cache
npm start -- --reset-cache

# Clean Xcode
cd ios
xcodebuild clean -workspace FinanceTrackerMobile.xcworkspace -scheme FinanceTrackerMobile
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Reinstall pods
rm -rf Pods
pod install

# Back to root and try again
cd ..
npm run ios
```

## Quick Debug Steps

1. **Xcode is opening** - wait for it to load
2. **Check top bar** - should show a simulator name
3. **Click Run button** (▶) or press Cmd+R
4. **Watch for errors** in the bottom panel

## If Simulator Doesn't Launch

```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 16"

# Or use Simulator app
open -a Simulator
```

## Still Not Working?

### Check Logs

```bash
# Detailed build output
npx react-native run-ios --verbose
```

### Verify Setup

```bash
npx react-native doctor
```

Should show all green ✓ for iOS

## Common Errors & Solutions

### "No signing certificate found"
→ Enable "Automatically manage signing" in Xcode

### "iPhone is busy"
→ Wait or restart simulator

### "Build input file cannot be found"
→ Clean and rebuild (Cmd+Shift+K then Cmd+R)

### "Command PhaseScriptExecution failed"
→ Run `pod install` in ios/ directory again

## Alternative: Use Expo Go

If all else fails, we can migrate to Expo for easier development:

```bash
npx expo prebuild
npx expo run:ios
```

## Next: Test on Physical Device

Once simulator works:

1. Connect iPhone via USB
2. Trust computer on iPhone
3. In Xcode, select your iPhone from device list
4. Click Run
5. On iPhone: Settings → General → VPN & Device Management → Trust developer

---

**Current Status**: Xcode should be opening. Try clicking the Run button (▶) once it loads!
