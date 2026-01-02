# QuickFinance - Setup Guide

## ✅ What We Built

Phase 1 Backend is **complete**! Here's what you have:

### Features
- ✅ User authentication (register/login with JWT)
- ✅ **Super-fast quick entry** endpoint (EXPENSE only, 2 fields)
- ✅ Full transaction CRUD (EXPENSE or INCOME)
- ✅ Category suggestions (top 6 most used)
- ✅ Monthly/weekly statistics
- ✅ **Budget calculation** (Income - Expenses)
- ✅ Category breakdown with percentages
- ✅ 6-month trend analysis

### Tech Stack
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- Zod validation
- Bcrypt password hashing

---

## 🚀 Next Steps to Run

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Set Up PostgreSQL

**Option A: Local PostgreSQL**
```bash
# macOS (with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb finance_tracker

# Update backend/.env with your connection string
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/finance_tracker?schema=public"
```

**Option B: Docker PostgreSQL (Easier)**
```bash
# Run PostgreSQL in Docker
docker run --name finance-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=finance_tracker \
  -p 5432:5432 \
  -d postgres:15

# Update backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_tracker?schema=public"
```

**Option C: Free Cloud PostgreSQL (Easiest)**
- Sign up at [Supabase](https://supabase.com) (free tier)
- Create new project
- Copy connection string to `.env`

### 3. Run Database Migrations
```bash
# Generate Prisma client
cd backend && npm run db:generate

# Create tables
npm run db:migrate
```

### 4. Start Development Server
```bash
# From root directory
npm run backend:dev

# Or from backend directory
cd backend && npm run dev
```

You should see:
```
🚀 Finance Tracker API
📍 Running on port 3000
✨ Ready to track finances!
```

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register a User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Save the `token` from the response!

**Quick Entry (Super Fast):**
```bash
curl -X POST http://localhost:3000/api/transactions/quick \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 45.50,
    "category": "Coffee"
  }'
```

**Get Statistics:**
```bash
curl http://localhost:3000/api/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Database GUI (Optional but Recommended)

View your data with Prisma Studio:
```bash
cd backend && npm run db:studio
```

Opens at `http://localhost:5555` - you can view/edit data visually.

---

## 🎯 What's Next?

### Immediate (This Week)
- [ ] Test all API endpoints
- [ ] Add some sample data
- [ ] Review the API responses

### Phase 1 Remaining (Weeks 3-4)
- [ ] Mobile app setup (React Native) ✅
- [ ] Quick entry screen (mobile) ✅
- [ ] Transaction list (mobile)
- [ ] Statistics dashboard (mobile)

### Phase 2 (Weeks 5-8)
- [ ] Gamification (streaks, achievements)
- [ ] Budget management
- [ ] Push notifications

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `pg_isready` or `docker ps`
- Verify DATABASE_URL in `.env` is correct
- Test connection: `psql $DATABASE_URL`

### "prisma command not found"
```bash
cd backend && npm install
npm run db:generate
```

### "Port 3000 already in use"
- Change PORT in `.env` to 3001
- Or kill the process: `lsof -ti:3000 | xargs kill`

### TypeScript errors
```bash
cd backend && npm run build
# Fix any errors shown
```

---

## 📚 Documentation

- [README.md](./README.md) - Full API documentation
- [agents.md](./agents.md) - Developer workflows
- [design/PRODUCT_ROADMAP.md](./design/PRODUCT_ROADMAP.md) - Product roadmap
- [design/PHASE_1_FOUNDATION.md](./design/PHASE_1_FOUNDATION.md) - Phase 1 details

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Server starts without errors
- ✅ Health check returns 200 OK
- ✅ You can register and login
- ✅ Quick entry creates transactions in < 100ms
- ✅ Stats endpoint shows your budget

---

**Ready to build the mobile app next!** 📱
