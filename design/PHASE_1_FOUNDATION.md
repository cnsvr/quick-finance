# Phase 1: Foundation (Weeks 1-4)

## Goal
Prove the "fastest entry" concept - users can add expenses in under 5 seconds

---

## Week 1-2: Core Backend

### Tasks
- [ ] Initialize Node.js + TypeScript project
- [ ] Set up PostgreSQL database
- [ ] Configure Prisma ORM
- [ ] User authentication (JWT)
  - [ ] Register endpoint
  - [ ] Login endpoint
  - [ ] Password hashing (bcrypt)
  - [ ] Token generation & validation
- [ ] Transaction CRUD API
  - [ ] Create transaction (quick entry)
  - [ ] Create transaction (full details)
  - [ ] List transactions with filters
  - [ ] Update transaction
  - [ ] Delete transaction
- [ ] Category management
  - [ ] Predefined categories list
  - [ ] Get user's most used categories
  - [ ] Smart category suggestions
- [ ] Basic statistics endpoint
  - [ ] Monthly expenses/income
  - [ ] Weekly expenses
  - [ ] Category breakdown

### Technical Details
**Stack:**
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- JWT authentication

**Database Schema:**
- Users table
- Transactions table
- Basic indexes for performance

**API Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/transactions/quick      # Super-fast entry
POST   /api/transactions            # Full entry
GET    /api/transactions
GET    /api/transactions/stats
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/categories/suggestions
```

---

## Week 3-4: Mobile App MVP

### Tasks
- [ ] Initialize React Native project
  - [ ] iOS configuration
  - [ ] Android configuration
  - [ ] Navigation setup (React Navigation)
- [ ] Authentication screens
  - [ ] Login screen
  - [ ] Register screen
  - [ ] Form validation
  - [ ] Token storage (AsyncStorage)
  - [ ] Auto-login on app start
- [ ] **Super-fast entry screen** ⭐
  - [ ] Big numpad (optimized for thumb reach)
  - [ ] Smart category picker (top 6 most used)
  - [ ] Amount input with TL suffix
  - [ ] Voice input button (placeholder for now)
  - [ ] Default to EXPENSE type
  - [ ] One-tap submit
  - [ ] Success feedback (haptic + visual)
  - [ ] Average entry time < 5 seconds
- [ ] Transaction list view
  - [ ] Infinite scroll / pagination
  - [ ] Filter by date range
  - [ ] Filter by category
  - [ ] Swipe to delete
  - [ ] Tap to edit
  - [ ] Pull to refresh
- [ ] Basic statistics dashboard
  - [ ] Monthly expense total
  - [ ] Weekly expense total
  - [ ] Category breakdown (pie/bar chart)
  - [ ] Expense vs Income comparison

### UI/UX Requirements

**Quick Entry Screen:**
```
┌─────────────────────────┐
│                         │
│       ₺ 150            │  ← Large, clear amount
│                         │
│  ☕ 🍔 🛒 🚗 🎬 💊      │  ← Top 6 categories (emoji+label)
│                         │
│  ┌─┬─┬─┐               │
│  │7│8│9│               │
│  ├─┼─┼─┤               │
│  │4│5│6│               │  ← Big numpad
│  ├─┼─┼─┤               │
│  │1│2│3│               │
│  ├─┼─┼─┤               │
│  │🎤│0│⌫│              │
│  └─┴─┴─┘               │
│                         │
│  [    Ekle ✓    ]      │  ← Primary action
│                         │
└─────────────────────────┘
```

**Design Principles:**
- Thumb-friendly targets (min 48x48 dp)
- High contrast colors
- Instant visual feedback
- Minimize taps required
- No loading states if possible (optimistic UI)

### Technical Details
**Stack:**
- React Native
- React Navigation
- AsyncStorage (token persistence)
- Chart library (react-native-chart-kit or similar)

**Key Screens:**
1. Login/Register
2. Quick Entry (main/home screen)
3. Transaction List
4. Statistics Dashboard

---

## Success Criteria

### User Experience
- ✅ User can add expense in **< 5 seconds**
- ✅ App feels responsive (no lag on quick entry)
- ✅ Category selection is one tap
- ✅ Visual feedback on every action

### Testing
- ✅ **10 beta testers** actively using
- ✅ Daily active usage **> 3 days/week** per user
- ✅ Average time to add transaction < 5 seconds
- ✅ Zero critical bugs in quick entry flow

### Technical
- ✅ API response time < 200ms (p95)
- ✅ App doesn't crash on quick entry
- ✅ Transactions sync correctly
- ✅ Authentication works reliably

### Business
- ✅ Positive feedback from beta testers
- ✅ Users report it's "the fastest" they've tried
- ✅ Clear path to Phase 2

---

## Risks & Mitigations

**Risk 1: Quick entry not fast enough**
- Mitigation: Time every interaction, optimize UI renders
- Target: < 100ms tap response time
- Use optimistic UI updates

**Risk 2: Category selection slows users down**
- Mitigation: Smart defaults based on history
- Show only top 6, rest in modal
- Learn user patterns

**Risk 3: Mobile development delays**
- Mitigation: Keep scope minimal
- Reuse UI components
- Focus on Android OR iOS first if needed

**Risk 4: Backend performance issues**
- Mitigation: Add database indexes early
- Use connection pooling
- Monitor query performance

---

## Phase 1 Deliverables

### By End of Week 2:
- ✅ Backend API fully functional
- ✅ Authentication working
- ✅ Transaction endpoints tested
- ✅ API documentation

### By End of Week 4:
- ✅ Mobile app runs on iOS and Android
- ✅ Quick entry flow complete
- ✅ Transaction list working
- ✅ 10 beta testers onboarded
- ✅ Feedback collected

---

## Non-Goals for Phase 1
- ❌ Gamification (Phase 2)
- ❌ Email parsing (Phase 3)
- ❌ Social features (Phase 4)
- ❌ Advanced statistics
- ❌ Budget management (Phase 2)
- ❌ Push notifications
- ❌ Templates

**Focus**: Speed of manual entry. Everything else is distraction.

---

**Last Updated**: 2026-01-02
**Status**: Not Started
**Owner**: Dev Team
