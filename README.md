# QuickFinance

Super-fast personal finance tracking with backend API and mobile app.

**Current Status**: Phase 1 - Backend MVP ✅ | Mobile App 🔄

## 🏗️ Project Structure

```
quickfinance/
├── backend/                  # Node.js + Express API
│   ├── src/                  # Backend source code
│   ├── prisma/               # Database schema & migrations
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript config
├── mobile/                   # React Native mobile app
│   ├── src/                  # Mobile app source
│   ├── android/              # Android build files
│   ├── ios/                  # iOS build files
│   ├── package.json          # Mobile dependencies
│   └── status.md             # Mobile development status
├── design/                   # Product documentation
├── README.md                 # This file
├── agents.md                 # Development workflows
└── package.json              # Root scripts for both projects
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- Git
- React Native development environment (for mobile)

### Installation

1. **Install all dependencies**
```bash
npm run install:all
```

2. **Set up backend environment**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database URL and JWT secret:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000
NODE_ENV=development
```

3. **Set up backend database**
```bash
cd backend
npm run db:generate
npm run db:migrate
```

4. **Start development servers**
```bash
# Start backend (in terminal 1)
npm run backend:dev

# Start mobile app (in terminal 2)
npm run mobile:dev
```

Backend will run on `http://localhost:3000`
Metro bundler will start for mobile app

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Transactions

All transaction endpoints require authentication. Include JWT token in headers:
```
Authorization: Bearer <your-token>
```

#### ⚡ Quick Entry (Super Fast)
Optimized for speed - always creates EXPENSE transaction.

```http
POST /api/transactions/quick
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 45.50,
  "category": "Coffee"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "clx...",
      "amount": 45.50,
      "type": "EXPENSE",
      "category": "Coffee",
      "date": "2026-01-02T10:30:00Z"
    }
  }
}
```

#### Create Transaction (Full)
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "type": "INCOME",
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2026-01-01T00:00:00Z"
}
```

#### Get Transactions
```http
GET /api/transactions?limit=50&type=EXPENSE&category=Coffee
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` - Number of transactions (default: 50)
- `type` - EXPENSE or INCOME
- `category` - Filter by category
- `startDate` - ISO date string
- `endDate` - ISO date string

#### Get Category Suggestions
Returns top 6 most used categories for quick entry.

```http
GET /api/transactions/categories/suggestions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "suggestions": [
      { "category": "Coffee", "count": 45 },
      { "category": "Groceries", "count": 32 },
      { "category": "Transport", "count": 28 }
    ]
  }
}
```

#### Update Transaction
```http
PATCH /api/transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50,
  "category": "Coffee & Snacks"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Authorization: Bearer <token>
```

---

### Statistics & Budget

#### Get Monthly Statistics
```http
GET /api/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "monthly": {
      "income": 10000,
      "expenses": 6500,
      "available": 3500,
      "spentPercentage": 65,
      "transactionCount": {
        "income": 2,
        "expenses": 87
      }
    },
    "weekly": {
      "expenses": 850
    },
    "categories": [
      {
        "category": "Groceries",
        "amount": 2500,
        "count": 12,
        "percentage": 38
      },
      {
        "category": "Coffee",
        "amount": 1350,
        "count": 30,
        "percentage": 21
      }
    ]
  }
}
```

#### Get 6-Month Trend
```http
GET /api/stats/trend
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "trend": [
      {
        "month": "2025-08",
        "income": 10000,
        "expenses": 7200,
        "savings": 2800
      },
      {
        "month": "2025-09",
        "income": 10000,
        "expenses": 6800,
        "savings": 3200
      }
    ]
  }
}
```

---

## 🗄️ Database Schema

### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Transaction
```prisma
model Transaction {
  id          String          @id @default(cuid())
  userId      String
  amount      Decimal         @db.Decimal(10, 2)
  type        TransactionType // EXPENSE or INCOME
  category    String
  description String?
  date        DateTime        @default(now())
  source      DataSource      @default(MANUAL)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}
```

---

## 🛠️ Development

## 🛠️ Development Scripts

### Root Level (Project Management)
```bash
npm run install:all       # Install dependencies for all projects
npm run backend:dev       # Start backend development server
npm run backend:build     # Build backend for production
npm run backend:start     # Run backend production server
npm run backend:test      # Run backend tests
npm run mobile:dev        # Start Metro bundler for mobile
npm run mobile:ios        # Run iOS simulator
npm run mobile:android    # Run Android emulator
npm run mobile:test       # Run mobile tests
```

### Backend (cd backend/)
```bash
npm run dev              # Start dev server with hot reload
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and apply migration
npm run db:studio        # Open Prisma Studio (database GUI)
npm run build            # Build for production
npm start                # Run production server
npm test                 # Run tests
```

### Mobile (cd FinanceTrackerMobile/)
```bash
npm start                # Start Metro bundler
npm run ios              # Run iOS simulator
npm run android          # Run Android emulator
npm test                 # Run tests
```

### Backend Structure (backend/)

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── index.ts               # Express app entry
│   ├── lib/
│   │   └── prisma.ts          # Prisma client
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   └── errorHandler.ts   # Error handling
│   └── routes/
│       ├── auth.ts            # Register/login
│       ├── transactions.ts    # Transaction CRUD
│       └── stats.ts           # Statistics & budget
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

### Mobile Structure (mobile/)

```
mobile/
├── src/
│   ├── screens/               # App screens
│   ├── components/            # Reusable components
│   ├── navigation/            # Navigation setup
│   └── services/              # API calls
├── android/                   # Android build files
├── ios/                       # iOS build files
├── package.json
└── status.md                  # Development status
```

---

## 🎯 Features

### ✅ Implemented (Phase 1)
- User authentication (register/login with JWT)
- Super-fast expense entry (quick endpoint)
- Full transaction CRUD
- EXPENSE and INCOME types
- Category management
- Category suggestions (top 6 most used)
- Monthly/weekly statistics
- Budget calculation (Income - Expenses)
- Category breakdown with percentages
- 6-month trend data

### 🔜 Coming Next (Phase 2)
- Gamification (streaks, achievements, points)
- Budget limits per category
- Push notifications
- Smart templates

### 🔮 Future (Phase 3+)
- Email parsing (Gmail integration)
- OCR receipt scanning
- Voice input
- Social features
- AI insights

---

## 🧪 Testing

### Manual Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Quick Entry:**
```bash
curl -X POST http://localhost:3000/api/transactions/quick \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":45.50,"category":"Coffee"}'
```

**Get Stats:**
```bash
curl http://localhost:3000/api/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notes

- JWT tokens expire in 30 days
- Passwords are hashed with bcrypt (10 rounds)
- All amounts stored as Decimal(10, 2)
- Dates stored in UTC
- Quick entry always creates EXPENSE transactions
- Category suggestions limited to top 6

---

## 🤝 Contributing

See [agents.md](./agents.md) for development workflows.

---

## 📄 License

MIT

---

**Built with**: Node.js, Express, TypeScript, PostgreSQL, Prisma
