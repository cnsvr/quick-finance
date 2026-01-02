# Finance Tracker Mobile - Quick Start

## 🎯 What We Built

A **super-fast quick entry screen** proof-of-concept:
- Login screen (pre-filled with demo credentials)
- Quick entry with big numpad
- Category selection (top 6 most used)
- Haptic feedback
- Direct API integration

## 🚀 Running the App

### iOS (Simulator)

1. **Install pods**:
```bash
cd ios
pod install
cd ..
```

2. **Run the app**:
```bash
npm run ios
```

### Android (Emulator)

1. **Start Android emulator** (or connect device)

2. **Run the app**:
```bash
npm run android
```

## ⚠️ Important: Backend Must Be Running!

The mobile app connects to your local backend at `http://localhost:3000/api`

**Make sure your backend is running:**
```bash
# In the root finance-tracker directory
npm run dev
```

## 📱 Testing the App

1. **Login Screen**:
   - Pre-filled credentials: `test@example.com` / `password123`
   - Tap "Login"

2. **Quick Entry Screen**:
   - Enter amount using numpad
   - Select a category (Coffee, Food, etc.)
   - Tap "Add ✓"
   - Success! Transaction saved

3. **Features**:
   - ✅ Haptic feedback on every tap
   - ✅ Category suggestions from your actual data
   - ✅ Real-time API calls
   - ✅ < 5 second entry time

## 🔧 Configuration

### Change API URL

Edit `.env`:
```
# For iOS Simulator
API_URL=http://localhost:3000/api

# For Android Emulator
API_URL=http://10.0.2.2:3000/api

# For Physical Device (use your computer's IP)
API_URL=http://192.168.1.X:3000/api
```

## 📂 Project Structure

```
FinanceTrackerMobile/
├── src/
│   ├── services/
│   │   └── api.ts              # API service layer
│   └── screens/
│       ├── LoginScreen.tsx     # Login UI
│       └── QuickEntryScreen.tsx # ⚡ Super-fast entry
├── App.tsx                      # Main app entry
└── .env                         # API configuration
```

## 🎨 Quick Entry Screen Features

### Big Numpad
- Thumb-optimized layout
- Large tap targets (48x48 minimum)
- Haptic feedback on every press

### Smart Categories
- Top 6 most-used categories from your data
- Falls back to defaults if no data
- One-tap selection

### Fast Submission
- Amount + Category = Ready
- < 100ms response time
- Optimistic UI (feels instant)

## 🐛 Troubleshooting

### "Network Error" or "Cannot connect"

**iOS Simulator:**
- Backend should be on `localhost:3000`
- Check backend is running: `curl http://localhost:3000/health`

**Android Emulator:**
- Change API_URL to `http://10.0.2.2:3000/api`
- Restart the app

**Physical Device:**
- Use your computer's local IP
- Both devices must be on same WiFi
- Find IP: `ifconfig` (Mac) or `ipconfig` (Windows)

### "Invalid credentials"

The app uses the test user we created earlier:
- Email: `test@example.com`
- Password: `password123`

If this user doesn't exist, create it:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### TypeScript errors

```bash
npm install
```

### Metro bundler cache issues

```bash
npm start -- --reset-cache
```

## 📊 Next Steps

Once this works, we can add:
1. Transaction list screen
2. Budget/stats dashboard
3. Better navigation (tabs)
4. More categories
5. Edit/delete transactions

## 🎉 Success Criteria

You'll know it's working when:
- ✅ App launches without errors
- ✅ Login works (stores token)
- ✅ Quick entry screen appears
- ✅ You can enter amount with numpad
- ✅ Category selection works
- ✅ "Add" button saves to backend
- ✅ Success alert appears
- ✅ Form resets for next entry

**Goal: < 5 seconds from opening app to transaction saved!** ⚡
