# Phase 2: Engagement (Weeks 5-8)

## Goal
Make users come back daily through gamification and budget management

---

## Prerequisites
- ✅ Phase 1 complete
- ✅ 10+ active beta users
- ✅ Quick entry working smoothly
- ✅ Positive user feedback

---

## Week 5-6: Gamification v1

### Streak System
- [ ] **Backend: Streak tracking**
  - [ ] Daily entry streak
  - [ ] Under-budget streak
  - [ ] Category-specific streaks (e.g., "no coffee for 7 days")
  - [ ] Streak model in database
  - [ ] Auto-update streaks on transaction creation
  - [ ] Streak reset logic (missed day)
  - [ ] API endpoint: Get user streaks
- [ ] **Mobile: Streak display**
  - [ ] Streak counter on home screen
  - [ ] Flame icon animation
  - [ ] Streak calendar view
  - [ ] "Don't break the chain" messaging
  - [ ] Push notification reminder (end of day)

### Achievement System
- [ ] **Backend: Achievement engine**
  - [ ] Achievement definitions in database
  - [ ] Achievement unlocking logic
  - [ ] Points awarding system
  - [ ] API endpoint: Get user achievements
  - [ ] API endpoint: Get achievement progress
- [ ] **Initial achievements**:
  - [ ] "First Step" - First transaction
  - [ ] "Week Warrior" - 7-day entry streak
  - [ ] "Month Master" - 30-day entry streak
  - [ ] "Budget Hero" - First budget goal met
  - [ ] "Saver" - Save 1000 TL in a month
- [ ] **Mobile: Achievement UI**
  - [ ] Achievement list screen
  - [ ] Badge display (locked/unlocked states)
  - [ ] Unlock animation & celebration
  - [ ] Progress bars for in-progress achievements
  - [ ] Share achievement on social media

### Points System
- [ ] **Backend: Points calculation**
  - [ ] Daily entry: 10 points
  - [ ] Stay under budget: 50 points
  - [ ] 7-day streak: 100 bonus points
  - [ ] Achievement unlock: variable points
  - [ ] User level calculation (every 1000 points = 1 level)
- [ ] **Mobile: Points display**
  - [ ] Points counter on profile
  - [ ] Level badge
  - [ ] "How to earn points" explainer
  - [ ] Points history

---

## Week 7: Budget & Goals

### Budget Management
- [ ] **Backend: Budget system**
  - [ ] Budget model (category, limit, period)
  - [ ] Budget vs actual calculation
  - [ ] Budget period types (daily/weekly/monthly)
  - [ ] API: Create/update/delete budget
  - [ ] API: Get budget status
  - [ ] Alert triggering logic (80%, 100% spent)
- [ ] **Mobile: Budget screens**
  - [ ] Create budget screen
  - [ ] Budget list view
  - [ ] Visual progress bars (with colors)
  - [ ] Budget status notifications
  - [ ] Edit/delete budget

### Goal-Based Saving
- [ ] **Backend: Goal tracking**
  - [ ] Target item field in budget
  - [ ] Target item image upload
  - [ ] Progress calculation
  - [ ] Estimated completion date
- [ ] **Mobile: Goal UI**
  - [ ] "Saving for..." cards with images
  - [ ] Progress visualization
  - [ ] Motivational messages
  - [ ] "X days until goal" countdown

### Push Notifications
- [ ] **Backend: Notification service**
  - [ ] Push notification infrastructure
  - [ ] Notification triggers (80%, 100% budget)
  - [ ] Daily reminder (streak maintenance)
  - [ ] Achievement unlock notifications
- [ ] **Mobile: Notification handling**
  - [ ] Request notification permissions
  - [ ] Handle notification taps
  - [ ] Notification settings screen

---

## Week 8: Smart Templates

### Template System
- [ ] **Backend: Template logic**
  - [ ] Template model (name, amount, category, location)
  - [ ] API: Create/update/delete template
  - [ ] API: Get user templates (sorted by usage)
  - [ ] Template usage tracking
  - [ ] One-tap create from template
- [ ] **Mobile: Template UI**
  - [ ] Quick-add template buttons
  - [ ] "Save as template" option
  - [ ] Template management screen
  - [ ] Recent templates on quick entry screen

### Smart Suggestions
- [ ] **Backend: Suggestion engine**
  - [ ] Time-based suggestions (morning = coffee)
  - [ ] Location-based suggestions (if available)
  - [ ] "Repeat last transaction" quick action
  - [ ] Learning from user patterns
- [ ] **Mobile: Suggestion UI**
  - [ ] Suggested templates at top of quick entry
  - [ ] One-tap to use suggestion
  - [ ] Swipe to dismiss

---

## Success Criteria

### Engagement Metrics
- ✅ **7-day retention > 40%**
- ✅ **30-day retention > 30%**
- ✅ Average **5+ transactions/user/week**
- ✅ **50+ active users**

### Feature Adoption
- ✅ 70%+ users have active streak
- ✅ 60%+ users set at least one budget
- ✅ 50%+ users create templates
- ✅ Average 3+ achievements per user

### User Satisfaction
- ✅ Positive feedback on gamification
- ✅ Users mention "fun" or "motivating"
- ✅ Low churn rate
- ✅ Feature requests for more achievements

---

## Gamification Design Details

### Streak Visual Design
```
🔥 Current Streak: 12 days
⭐ Longest Streak: 23 days

[Calendar view showing streak days highlighted]

"You're on fire! Don't break the chain."
```

### Achievement Card Design
```
┌─────────────────────────┐
│   🏆                    │
│   Week Warrior          │
│   Entered transactions  │
│   for 7 days straight   │
│                         │
│   +100 points          │
│   Unlocked 2 days ago   │
└─────────────────────────┘
```

### Budget Progress Bar
```
☕ Coffee Budget
₺245 / ₺300 (Monthly)

[████████░░] 82%

⚠️ Watch out! You're close to your limit.
```

---

## Technical Considerations

### Push Notifications
**Implementation:**
- Use Firebase Cloud Messaging (FCM)
- Store device tokens in database
- Schedule notifications via backend cron job
- Handle permissions gracefully

**Notification Types:**
1. Daily reminder (8 PM): "Keep your streak alive!"
2. Budget alert (80%): "You've used 80% of your coffee budget"
3. Budget exceeded: "You're over budget on dining"
4. Achievement unlock: "🎉 You unlocked Week Warrior!"

### Streak Calculation Logic
```typescript
// Check if streak should continue
const today = new Date();
const lastEntry = user.lastTransactionDate;
const daysSince = daysBetween(lastEntry, today);

if (daysSince === 0) {
  // Already entered today, streak continues
} else if (daysSince === 1) {
  // Entered yesterday, increment streak
  user.currentStreak += 1;
} else {
  // Missed a day, reset streak
  user.currentStreak = 1;
}
```

### Budget Period Logic
- **Daily**: Resets at midnight
- **Weekly**: Resets every Monday
- **Monthly**: Resets on 1st of month

---

## Risks & Mitigations

**Risk 1: Gamification feels gimmicky**
- Mitigation: Keep it simple and genuine
- Tie to real financial outcomes
- User testing for feedback

**Risk 2: Too many notifications annoy users**
- Mitigation: Notification settings (opt-out)
- Smart timing (not late at night)
- Maximum 1-2 notifications per day

**Risk 3: Budget alerts don't motivate**
- Mitigation: A/B test messaging
- Use positive framing when possible
- Allow customization of alert thresholds

**Risk 4: Template feature unused**
- Mitigation: Auto-suggest template creation
- Pre-populate common templates
- Show templates prominently

---

## Phase 2 Deliverables

### By End of Week 6:
- ✅ Streak system fully functional
- ✅ 5 initial achievements live
- ✅ Points system working
- ✅ Users seeing engagement increase

### By End of Week 8:
- ✅ Budget management complete
- ✅ Push notifications working
- ✅ Template system live
- ✅ 50+ active users
- ✅ Measurable retention improvement

---

## Non-Goals for Phase 2
- ❌ Email parsing (Phase 3)
- ❌ OCR (Phase 3)
- ❌ Social features (Phase 4)
- ❌ AI insights (Phase 4)
- ❌ Advanced gamification (leaderboards, etc.)

**Focus**: Daily engagement through streaks, budgets, and gamification.

---

**Last Updated**: 2026-01-02
**Status**: Not Started
**Owner**: Dev Team
