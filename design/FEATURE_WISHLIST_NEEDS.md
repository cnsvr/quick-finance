# Feature Idea: Needs & Wishlist System

## 💡 Concept

Allow users to track **things they want to buy** and gamify the saving process to help them decide if they really need it.

## 🎯 Problem It Solves

- **Impulse buying**: Users buy things without thinking
- **No clear goals**: Hard to save when there's no target
- **Instant gratification**: Need psychological tricks to delay purchases
- **Budget confusion**: "Can I afford this?" is unclear

## ✨ How It Works

### User Flow

1. **User sees something they want**
   - "New iPhone 16 Pro - ₺50,000"
   - "PlayStation 5 - ₺25,000"
   - "Weekend trip - ₺5,000"

2. **Add to "Needs" list**
   ```
   ┌─────────────────────────┐
   │  Add Need               │
   │                         │
   │  Item: iPhone 16 Pro    │
   │  Price: ₺50,000         │
   │  Category: Tech         │
   │  Priority: Want/Need    │
   │                         │
   │  [Add to List]          │
   └─────────────────────────┘
   ```

3. **Gamification kicks in**:
   - **Waiting period**: "Wait 7 days before buying"
   - **Savings challenge**: "Save ₺7,000/week for 7 weeks"
   - **Alternative suggestion**: "That's 1,100 coffees ☕"
   - **Progress tracking**: Visual bar showing savings

4. **Decision time**:
   - After waiting period: "Still want it?"
   - Show how much you've saved
   - Show what you could buy instead
   - **Buy** or **Cancel** decision

## 🎮 Gamification Elements

### Cooling-Off Period
```
You want: iPhone 16 Pro (₺50,000)

⏰ Cooling-off period: 7 days
📅 You can decide on: 10 Jan 2026

During this time:
- Keep saving toward it
- Think if you really need it
- Earn points for waiting

[Cancel Want] [Keep Saving]
```

### Savings Progress
```
iPhone 16 Pro
₺50,000 target

Saved so far: ₺14,000
[████░░░░░░] 28%

At current rate: 5 more weeks
🎯 If you skip coffee: 3 more weeks

[Add to Savings] [Buy Now] [Cancel]
```

### Comparison View
```
iPhone 16 Pro - ₺50,000

That equals:
☕ 1,100 coffees
🍔 200 restaurant meals
🚗 2 months of transport
📊 10% of yearly expenses

Really worth it?
[Yes, Still Want] [No, Cancel]
```

### Achievement Unlocks
- **"Patient Saver"**: Waited full cooling-off period
- **"Goal Crusher"**: Saved full amount before deadline
- **"Wise Choice"**: Cancelled 3 items after thinking
- **"Delayed Gratification"**: Waited 30 days before buying

## 📊 Data Model

```typescript
model Need {
  id          String
  userId      String

  // Item details
  itemName    String          // "iPhone 16 Pro"
  price       Decimal         // 50000
  category    String          // "Tech", "Travel", "Clothing"
  priority    NeedPriority    // NEED, WANT, LUXURY

  // Gamification
  addedDate       DateTime
  coolingOffDays  Int         // 7, 14, 30 (based on price)
  canBuyAfter     DateTime    // addedDate + coolingOffDays

  // Savings tracking
  savedAmount     Decimal     // How much user has saved
  targetReached   Boolean

  // Status
  status          NeedStatus  // WAITING, READY, BOUGHT, CANCELLED

  // Decision
  boughtAt        DateTime?
  cancelledAt     DateTime?
  cancelReason    String?     // "Too expensive", "Don't need it"
}

enum NeedPriority {
  NEED      // Essential (shorter cooling period)
  WANT      // Nice to have (standard period)
  LUXURY    // Splurge (longer cooling period)
}

enum NeedStatus {
  WAITING   // In cooling-off period
  READY     // Can decide now
  BOUGHT    // User bought it
  CANCELLED // User decided not to buy
}
```

## 🎨 UI/UX Design

### Needs List Screen
```
┌─────────────────────────┐
│  My Needs               │
│                         │
│  ⏰ Waiting (2)         │
│  ┌───────────────────┐  │
│  │ iPhone 16 Pro     │  │
│  │ ₺50,000           │  │
│  │ 3 days left ⏰    │  │
│  │ [███░░] 60% saved │  │
│  └───────────────────┘  │
│                         │
│  ✅ Ready to Decide (1)│
│  ┌───────────────────┐  │
│  │ PS5               │  │
│  │ ₺25,000           │  │
│  │ [Buy] [Cancel]    │  │
│  └───────────────────┘  │
│                         │
│  [+ Add Need]           │
└─────────────────────────┘
```

### Decision Screen
```
┌─────────────────────────┐
│  Decision Time! 🎯      │
│                         │
│  PlayStation 5          │
│  ₺25,000                │
│                         │
│  You've waited 7 days   │
│  You've saved ₺25,000 ✓ │
│                         │
│  Still want it?         │
│                         │
│  [Yes, Buy It! 🎉]     │
│  [No, Save Instead 💰] │
│                         │
│  If you cancel:         │
│  +500 points            │
│  "Wise Saver" badge     │
└─────────────────────────┘
```

## 🧠 Psychology Behind It

### Cooling-Off Period
- **Impulse control**: Forces user to wait
- **Time to think**: Decision fatigue reduction
- **Regret prevention**: 70% of people cancel after waiting

### Price-Based Timing
```
< ₺1,000:    3 days wait
₺1,000-5,000:    7 days
₺5,000-20,000:   14 days
> ₺20,000:   30 days
```

### Comparison Tricks
- Show in terms of daily expenses (coffee, meals)
- "That's X months of savings"
- "Could buy Y smaller items instead"

### Positive Reinforcement
- Points for waiting
- Badges for cancelling wants
- Celebrate savings milestones

## 🎯 Integration with Existing Features

### Budget Impact
```
Monthly Budget: ₺10,000
Current Expenses: ₺6,500
Available: ₺3,500

Pending Needs:
- iPhone: Saving ₺2,000/month
- After savings: ₺1,500 left

⚠️ This will reduce your available budget
```

### Gamification Points
- **Add need**: +10 points (planning ahead)
- **Wait full period**: +50 points
- **Cancel after thinking**: +100 points
- **Reach savings goal**: +200 points
- **Buy responsibly**: +50 points

### Streak Integration
- **Saving streak**: Days of putting money toward need
- **No impulse buy streak**: Days without buying wants

## 📈 Phase Rollout

### Phase 2-3: Basic Needs (Weeks 9-12)
- [ ] Add need with price
- [ ] Simple list view
- [ ] Manual "mark as bought"
- [ ] Basic savings tracking

### Phase 4: Gamification (Weeks 13-16)
- [ ] Cooling-off period timer
- [ ] Auto-calculate wait time based on price
- [ ] Decision prompts when ready
- [ ] Comparison views
- [ ] Points for waiting/cancelling

### Phase 5: Advanced (Post-MVP)
- [ ] Auto-save toward needs
- [ ] AI suggestions: "Can you afford this?"
- [ ] Share with friends: "Should I buy this?"
- [ ] Community voting: "Is this worth it?"
- [ ] Price tracking: "Wait, it's cheaper now!"

## 💰 Monetization Potential

### Premium Features
- **Unlimited needs**: Free = 3 active needs
- **Custom cooling periods**: Premium can adjust
- **Advanced analytics**: "Your buying patterns"
- **Price alerts**: Notify when item goes on sale
- **Affiliate links**: Suggest best deals (earn commission)

### Affiliate Integration
```
iPhone 16 Pro - ₺50,000

Best prices found:
🏪 Apple Store: ₺50,000
🏪 MediaMarkt: ₺48,500 ✓ Best
🏪 Teknosa: ₺49,000

[View Deals] (affiliate links)
```

## ⚠️ Risks & Mitigations

**Risk 1**: Users ignore cooling-off
- Mitigation: Lock purchase button, gamify waiting

**Risk 2**: Too restrictive, users frustrated
- Mitigation: Can always buy, just lose points

**Risk 3**: Feels preachy/judgmental
- Mitigation: Frame as "help you decide", not "don't buy"

**Risk 4**: Calculation complexity
- Mitigation: Start simple, add features gradually

## 🎉 Success Metrics

- **Cancellation rate**: % of needs cancelled after waiting
- **Savings rate**: % of needs fully saved for before buying
- **Wait completion**: % of users who wait full period
- **Impulse reduction**: Decrease in unplanned expenses

**Target**: 40% of needs cancelled after cooling-off = huge win!

## 💭 Example User Journey

**Day 1**: "I want AirPods Pro (₺8,000)"
- Add to needs
- App says: "Wait 14 days, let's save together!"

**Day 1-14**:
- App shows daily: "13 days left..."
- Tracks savings: "₺2,000 saved so far!"
- Sends encouragement: "Keep going! 🎯"

**Day 14**: "Decision time!"
- "You wanted: AirPods Pro - ₺8,000"
- "You've saved: ₺5,000"
- "Still want it?"
- User thinks: "Actually, my current ones work fine"
- **Cancels** → Gets 100 points + "Wise Saver" badge

**Result**: Saved ₺8,000, feels good about decision!

---

**Status**: Feature idea - Not implemented yet
**Priority**: Phase 4+ (after core features working)
**Impact**: HIGH - Major differentiator from other finance apps
**Complexity**: MEDIUM - Requires timer system + good UX

**Decision**: Add to Phase 4 roadmap as "Needs & Wishlist" feature! 🎯
