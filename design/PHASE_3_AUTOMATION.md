# Phase 3: Automation (Weeks 9-12)

## Goal
Reduce manual entry friction through email parsing, OCR, and voice input

---

## Prerequisites
- ✅ Phase 2 complete
- ✅ 50+ active users
- ✅ Strong engagement metrics
- ✅ Users requesting automation features

---

## Week 9-10: Email Parsing (Beta)

### Gmail API Integration
- [ ] **Backend: Gmail OAuth setup**
  - [ ] Register app with Google Cloud
  - [ ] OAuth 2.0 flow implementation
  - [ ] Token storage & refresh
  - [ ] Gmail API client setup
  - [ ] Email fetching service
  - [ ] Unread email filtering
- [ ] **Mobile: Gmail connection UI**
  - [ ] "Connect Gmail" button
  - [ ] OAuth flow (opens browser)
  - [ ] Connection status display
  - [ ] Disconnect option
  - [ ] Privacy explanation screen

### AI-Powered Email Parser
- [ ] **Backend: AI parsing service**
  - [ ] OpenAI API integration
  - [ ] Email → Transaction parser
  - [ ] Custom prompt engineering
  - [ ] Confidence score calculation
  - [ ] Fallback for low confidence
  - [ ] Cost optimization (batch processing)
- [ ] **Parsing logic**:
  - [ ] Extract amount
  - [ ] Extract date
  - [ ] Extract merchant/description
  - [ ] Detect category
  - [ ] Handle Turkish language
  - [ ] Handle various number formats (1.234,56 vs 1234.56)

### Bank Support (Top 5)
- [ ] **Akbank**
  - [ ] Email pattern recognition
  - [ ] Sample emails collection
  - [ ] Parsing accuracy testing
- [ ] **Garanti BBVA**
  - [ ] Email pattern recognition
  - [ ] Sample emails collection
  - [ ] Parsing accuracy testing
- [ ] **İş Bankası**
  - [ ] Email pattern recognition
  - [ ] Sample emails collection
  - [ ] Parsing accuracy testing
- [ ] **Ziraat Bankası**
  - [ ] Email pattern recognition
  - [ ] Sample emails collection
  - [ ] Parsing accuracy testing
- [ ] **YapıKredi**
  - [ ] Email pattern recognition
  - [ ] Sample emails collection
  - [ ] Parsing accuracy testing

### User Confirmation Flow
- [ ] **Backend: Pending transactions**
  - [ ] Pending transaction model
  - [ ] API: Get pending transactions
  - [ ] API: Confirm/edit/reject pending
  - [ ] Learn from user corrections
- [ ] **Mobile: Confirmation UI**
  - [ ] Pending transactions inbox
  - [ ] Swipe to confirm
  - [ ] Tap to edit before confirming
  - [ ] Reject with reason
  - [ ] Batch confirm option

### Template Learning
- [ ] **Backend: Learning engine**
  - [ ] Track email → confirmed transaction mappings
  - [ ] Build template library from patterns
  - [ ] Improve accuracy over time
  - [ ] User-specific learning
- [ ] **Monitoring**:
  - [ ] Parsing success rate dashboard
  - [ ] Failed parsing alerts
  - [ ] User correction tracking

---

## Week 11: OCR Receipt Scanning

### Camera Integration
- [ ] **Mobile: Camera UI**
  - [ ] Camera permission request
  - [ ] Receipt capture screen
  - [ ] Photo preview & retake
  - [ ] Gallery photo selection
  - [ ] Image quality validation
- [ ] **Image Processing**:
  - [ ] Image compression
  - [ ] Auto-crop receipt
  - [ ] Enhance contrast
  - [ ] Orientation correction

### OCR Processing
- [ ] **Backend: OCR service**
  - [ ] Tesseract OCR setup
  - [ ] GPT-4 Vision API integration (for complex receipts)
  - [ ] Hybrid approach (Tesseract first, AI fallback)
  - [ ] Image storage (Cloudflare R2 / S3)
- [ ] **Extraction logic**:
  - [ ] Extract total amount
  - [ ] Extract date
  - [ ] Extract merchant name
  - [ ] Detect category from items
  - [ ] Handle multiple currencies
  - [ ] QR code reading (for digital receipts)

### User Confirmation UI
- [ ] **Mobile: Receipt review screen**
  - [ ] Show extracted data with confidence
  - [ ] Highlight uncertain fields
  - [ ] Easy editing of extracted data
  - [ ] Receipt image preview
  - [ ] "Looks good" quick confirm

---

## Week 12: Voice Input Enhancement

### Speech-to-Text
- [ ] **Mobile: Voice input**
  - [ ] Microphone permission
  - [ ] Recording UI (animated mic)
  - [ ] Web Speech API (browser-based)
  - [ ] OpenAI Whisper API (server-based, if needed)
  - [ ] Handle Turkish language

### Natural Language Parsing
- [ ] **Backend: NLP service**
  - [ ] Parse Turkish voice input
  - [ ] Extract amount from text
  - [ ] Extract category/merchant
  - [ ] Handle natural language:
    - "Migros'ta yüz elli lira market"
    - "Starbucks'ta seksen beş lira kahve"
    - "Uber'e yüz yirmi lira"
  - [ ] Number word → digit conversion
    - "yüz elli" → 150
    - "seksen beş" → 85

### Smart Category Detection
- [ ] **Category mapping**:
  - [ ] Merchant → Category lookup
  - [ ] Keywords → Category (e.g., "kahve" → Coffee)
  - [ ] Learn from user corrections
  - [ ] Confidence scoring

---

## Success Criteria

### Email Parsing
- ✅ **Parsing accuracy > 85%**
- ✅ **30% of users** enable email sync
- ✅ **15% of transactions** from email parsing
- ✅ Average time to confirm < 3 seconds

### OCR Scanning
- ✅ **OCR accuracy > 80%**
- ✅ **20% of users** scan at least one receipt
- ✅ Receipt → transaction in < 10 seconds
- ✅ Positive feedback on feature

### Voice Input
- ✅ **Speech recognition accuracy > 90%**
- ✅ **10% of transactions** via voice
- ✅ Voice → transaction in < 8 seconds
- ✅ Users report it's "convenient"

### Overall Automation
- ✅ **25% of all transactions** automated
- ✅ Users save time vs manual entry
- ✅ Engagement stays strong
- ✅ 100+ active users

---

## Technical Details

### Email Parsing Prompt Example
```
You are a financial transaction parser. Extract transaction details from this email.

Email:
{email_content}

Extract:
1. Amount (number only, in TL)
2. Date (ISO format)
3. Merchant/description
4. Category (one of: Food, Transport, Shopping, Bills, Health, Entertainment, Other)

Return JSON:
{
  "amount": 150.00,
  "date": "2026-01-02",
  "merchant": "Starbucks Kadıköy",
  "category": "Food",
  "confidence": 0.95
}

If you cannot extract with high confidence, set confidence < 0.7.
```

### OCR Processing Flow
```
User takes photo
    ↓
Client: Compress & upload
    ↓
Server: Run Tesseract OCR
    ↓
If confidence < 70%:
    ↓
Server: Send to GPT-4 Vision
    ↓
Extract: amount, date, merchant
    ↓
Return to client for confirmation
    ↓
User confirms/edits
    ↓
Create transaction
```

### Voice Input Flow
```
User taps mic button
    ↓
Record audio (max 10 seconds)
    ↓
Send to Whisper API
    ↓
Get transcription
    ↓
Parse with GPT/custom NLP:
  - Extract amount
  - Extract merchant
  - Extract category
    ↓
Pre-fill quick entry form
    ↓
User confirms or edits
```

---

## Cost Optimization

### AI API Costs
**Email Parsing:**
- GPT-4o-mini: ~$0.002/email
- Target: < 30 emails/user/month
- 100 users × 30 emails = $6/month

**OCR:**
- Tesseract: Free
- GPT-4 Vision (fallback): ~$0.01/image
- Target: 80% Tesseract success
- 100 users × 10 receipts × 20% = $20/month

**Voice:**
- Whisper API: ~$0.006/minute
- Average 5 seconds per input
- 100 users × 20 voice/month = $10/month

**Total AI costs (100 users)**: ~$36/month

**Optimization strategies:**
1. Cache frequently parsed patterns
2. Use template matching before AI
3. Batch process when possible
4. Rate limit per user
5. Consider fine-tuning smaller models

---

## Privacy & Security

### Email Access
- Clear explanation of what we access
- Read-only access to specific senders
- No access to personal emails
- User can revoke anytime
- KVKK compliance documentation

### Image Storage
- Receipts stored encrypted
- Auto-delete after 90 days (configurable)
- User can delete immediately
- Not used for any other purpose

### Voice Data
- Audio not stored (only transcription)
- Processed server-side for privacy
- No sharing with third parties

---

## Risks & Mitigations

**Risk 1: Email parsing accuracy too low**
- Mitigation: Start with one bank, perfect it
- Build template library gradually
- User corrections improve model
- Set expectations (beta feature)

**Risk 2: Users don't trust email access**
- Mitigation: Manual-first (email optional)
- Transparent about access scope
- Show clear value first
- Privacy-focused marketing

**Risk 3: OCR costs too high**
- Mitigation: Tesseract for most cases
- Rate limit scans per user
- Premium-only feature if needed

**Risk 4: Voice input hard in noisy environments**
- Mitigation: Clear error messages
- Allow retry
- Text fallback always available
- Set user expectations

**Risk 5: Banks change email formats**
- Mitigation: Monitor parsing failures
- Quick update cycles
- User feedback loop
- Template-based fallback

---

## Phase 3 Deliverables

### By End of Week 10:
- ✅ Email parsing beta live
- ✅ Top 5 banks supported
- ✅ Accuracy > 85%
- ✅ 20+ users testing email sync

### By End of Week 12:
- ✅ OCR receipt scanning working
- ✅ Voice input functional
- ✅ 100+ active users
- ✅ 25% transactions automated
- ✅ Strong user feedback

---

## Beta Testing Plan

### Week 9: Email Parsing Beta
- Invite 10 users per bank
- Collect sample emails
- Measure accuracy
- Gather feedback
- Iterate quickly

### Week 11: OCR Beta
- 20 users test receipt scanning
- Various receipt types
- Measure accuracy
- UI/UX feedback

### Week 12: Voice Beta
- 15 users test voice input
- Different accents/speeds
- Various transaction types
- Feedback on natural language

---

## Non-Goals for Phase 3
- ❌ SMS parsing (privacy concerns, iOS limits)
- ❌ Notification listener (Android-only)
- ❌ Social features (Phase 4)
- ❌ AI insights (Phase 4)
- ❌ Bank API integration (doesn't exist)

**Focus**: Three automation methods (email, OCR, voice) done well.

---

**Last Updated**: 2026-01-02
**Status**: Not Started
**Owner**: Dev Team
