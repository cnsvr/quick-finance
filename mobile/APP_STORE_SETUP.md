# App Store & TestFlight Setup Guide

## 📱 App Information

**App Name Options:**
1. QuickFinance
2. MoneyTrack
3. FinanceFlow
4. SpendSmart

**Suggested Bundle ID:** `com.furkancansever.financetracker`

---

## 🎨 App Icon Requirements

### Icon Sizes Needed (iOS):
- 1024x1024px (App Store)
- 180x180px (iPhone)
- 167x167px (iPad Pro)
- 152x152px (iPad)
- 120x120px (iPhone)
- 87x87px (Settings)
- 80x80px (Spotlight)
- 76x76px (iPad)
- 60x60px (Notification)
- 58x58px (Settings)
- 40x40px (Spotlight)

### Design Suggestions:

**Option 1: Currency Symbol**
- Turkish Lira (₺) symbol in white
- Gradient background (Blue → Purple)
- Modern, clean, minimalist

**Option 2: Wallet Icon**
- Stylized wallet icon
- Green/Blue color scheme
- Simple, recognizable

**Option 3: Graph/Chart**
- Upward trending arrow
- Financial chart bars
- Professional look

### Tools to Create Icons:
1. **Figma** (free) - Design the 1024x1024 version
2. **Icon Generator** - Use online tool to generate all sizes
   - https://appicon.co
   - https://makeappicon.com

---

## 🚀 TestFlight Setup Steps

### 1. Apple Developer Account
- Go to https://developer.apple.com
- Enroll in Apple Developer Program ($99/year)
- Complete enrollment

### 2. App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: [Your chosen name]
   - Primary Language: English or Turkish
   - Bundle ID: com.furkancansever.financetracker
   - SKU: financetracker-001

### 3. Xcode Configuration
Open `FinanceTrackerMobile.xcworkspace` in Xcode:

1. **Select project** → General tab
2. **Update:**
   - Display Name: [Your app name]
   - Bundle Identifier: com.furkancansever.financetracker
   - Version: 1.0.0
   - Build: 1

3. **Signing & Capabilities:**
   - Team: [Your Apple Developer Team]
   - Enable "Automatically manage signing"
   - Provisioning Profile: Automatic

### 4. Add App Icons
1. Open `ios/FinanceTrackerMobile/Images.xcassets`
2. Click on `AppIcon`
3. Drag and drop icon files for each size

### 5. Configure Splash Screen
Edit `ios/FinanceTrackerMobile/LaunchScreen.storyboard` or create custom launch screen

---

## 🔨 Build for TestFlight

### Build Archive:
```bash
cd /Users/furkancansever/dev/finance-tracker/FinanceTrackerMobile/ios
xcodebuild -workspace FinanceTrackerMobile.xcworkspace \
  -scheme FinanceTrackerMobile \
  -configuration Release \
  -archivePath ~/Desktop/FinanceTrackerMobile.xcarchive \
  archive
```

### Upload to App Store Connect:
```bash
xcodebuild -exportArchive \
  -archivePath ~/Desktop/FinanceTrackerMobile.xcarchive \
  -exportPath ~/Desktop/FinanceTrackerMobile \
  -exportOptionsPlist ExportOptions.plist
```

Or use Xcode:
1. Product → Archive
2. Window → Organizer
3. Select archive → Distribute App
4. App Store Connect → Upload

---

## 📋 Required Information for App Store

### App Privacy
- **Data Collection:** Transaction amounts, categories, dates
- **Data Usage:** Local analytics only
- **Third-party sharing:** None

### App Category
- Primary: Finance
- Secondary: Productivity

### Age Rating
- 4+ (No objectionable content)

### Description Template
```
Track your expenses in seconds! QuickFinance makes personal finance management effortless.

KEY FEATURES:
✓ Lightning-fast expense entry (< 5 seconds)
✓ Income & expense tracking
✓ Smart category suggestions
✓ Visual spending insights
✓ Monthly budget overview
✓ Instant transaction history

SIMPLE & POWERFUL:
• Big numpad for quick entry
• Emoji-based categories
• Automatic calculations
• Beautiful statistics dashboard

PRIVACY FIRST:
• Your data stays private
• Secure authentication
• No third-party sharing

Perfect for:
- Daily expense tracking
- Budget management
- Financial awareness
- Spending insights
```

### Keywords
finance, expense, budget, money, tracker, spending, income, personal finance, accounting

### Screenshots Needed
- 6.7" (iPhone 14 Pro Max): 1290x2796px
- 6.5" (iPhone 11 Pro Max): 1242x2688px
- 5.5" (iPhone 8 Plus): 1242x2208px

---

## ✅ Pre-Flight Checklist

- [ ] App icon created (all sizes)
- [ ] Splash screen configured
- [ ] Bundle ID set correctly
- [ ] Version number set (1.0.0)
- [ ] Build number set (1)
- [ ] Signing configured
- [ ] Privacy policy URL (if required)
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Screenshots taken
- [ ] App description written
- [ ] Keywords chosen
- [ ] Archive builds successfully
- [ ] Upload to TestFlight successful

---

## 🐛 Common Issues

### "No signing identity found"
→ Make sure you're logged into Xcode with Apple ID (Xcode → Preferences → Accounts)

### "Failed to verify bitcode"
→ In Build Settings, set "Enable Bitcode" to NO

### "Invalid Bundle"
→ Check bundle ID matches App Store Connect exactly

---

## 📞 Next Steps After Upload

1. Wait for processing (5-30 minutes)
2. Add beta testers in TestFlight
3. Submit for beta review (if external testing)
4. Distribute to testers
5. Collect feedback
6. Iterate and improve

---

**Questions? Issues?** Check Apple's official documentation:
- https://developer.apple.com/testflight/
- https://help.apple.com/app-store-connect/
