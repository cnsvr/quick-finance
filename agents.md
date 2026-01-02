# AGENTS.md - QuickFinance

## Dev environment tips

### Backend (Node.js + Express)
- Use `npm install` after pulling new changes in `/backend`
- Start backend: `npm run backend:dev` from root or `npm run dev` from `/backend` (runs on port 3000)
- Build: `npm run backend:build` from root or `npm run build` from `/backend` creates production bundle in `/backend/dist`
- Check `.env` file exists in `/backend` with required variables (copy from `.env.example`)
- Database client: `npm run db:studio` from `/backend` opens Prisma Studio

### Frontend (React Native)
- Use `npm install` after pulling new changes in `/FinanceTrackerMobile`
- Start iOS: `npm run mobile:ios` from root or `npm run ios` from `/mobile`
- Start Android: `npm run mobile:android` from root or `npm run android` from `/mobile`
- Metro bundler: `npm run mobile:dev` from root or `npm start` from `/mobile`
- Check `.env.local` file exists in `/mobile` for API URL config

### Quick navigation
- Backend API routes: `/backend/src/routes/`
- Backend services: `/backend/src/services/`
- Database schema: `/backend/prisma/schema.prisma`
- Mobile screens: `/mobile/src/screens/`
- Mobile components: `/mobile/src/components/`

## Testing instructions

### Backend tests (Jest)
- Run all tests: `npm run backend:test` from root or `npm test` from `/backend`
- Run specific file: `npm test -- TransactionService.test.ts` (from `/backend`)
- Run with coverage: `npm test -- --coverage` (from `/backend`)
- Run in watch mode: `npm test -- --watch` (from `/backend`)
- Tests should be in `/backend/tests/` matching `*.test.ts` pattern

### Frontend tests (Jest + React Native Testing Library)
- Run all tests: `npm run mobile:test` from root or `npm test` from `/mobile`
- Run specific file: `npm test -- QuickEntry.test.tsx` (from `/mobile`)
- Run with coverage: `npm test -- --coverage` (from `/mobile`)
- Update snapshots: `npm test -- -u` (from `/mobile`)

### E2E tests (Detox - Future)
- Run E2E: `detox test` from `/mobile`
- Build and test iOS: `detox build -c ios && detox test -c ios`
- Build and test Android: `detox build -c android && detox test -c android`

### Before committing
1. Backend: `npm run backend:test` must pass
2. Frontend: `npm run mobile:test` must pass (from root) or `npm test` from `/mobile`
3. Type check: `npm run backend:build` must succeed
4. Lint: Fix any ESLint warnings
5. If you changed models: Create and apply migration

## Database workflow

### Local development
- Uses PostgreSQL (recommended) or SQLite for quick testing
- Connection string in `.env`: `DATABASE_URL`

### Migrations (Prisma)
- Generate Prisma client: `npm run db:generate` (from `/backend`)
- Create migration: `npm run db:migrate` (from `/backend`) (will prompt for name)
- Check migration files in `/backend/prisma/migrations/` before applying
- Reset database: `npx prisma migrate reset` (from `/backend`) (WARNING: destroys data)
- View data: `npm run db:studio` (from `/backend`)

### When to create migration
- Added/modified model in `/backend/prisma/schema.prisma`
- Changed field types or constraints
- Added/removed tables or relations

## Code conventions

### Backend (TypeScript)
- Use type annotations: `function create(data: CreateDTO): Promise<Transaction>`
- Async routes: `async (req: AuthRequest, res: Response, next: NextFunction) =>`
- Import Prisma client from `@/lib/prisma`
- Services go in `/backend/src/services/`
- Use Zod for request validation
- Error handling: throw `AppError` for expected errors

### Frontend (React Native + TypeScript)
- Components use PascalCase: `QuickEntry.tsx`
- Props interface: `interface QuickEntryProps {}`
- Use functional components with hooks
- Styles: Use StyleSheet in same file or shared `/FinanceTrackerMobile/src/styles/`
- API calls go in `/FinanceTrackerMobile/src/services/api.ts`

### File naming
- TypeScript: camelCase for files (e.g., `transactionService.ts`)
- React/React Native: PascalCase for components (e.g., `QuickEntry.tsx`)
- Routes: kebab-case or plural (e.g., `transactions.ts`, `auth.ts`)

## Git workflow

### Branch naming
- Feature: `feature/<short-description>`
- Bug fix: `fix/<short-description>`
- Example: `feature/email-parsing` or `fix/streak-calculation`

### Commit messages
- Format: `<type>: <description>`
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`
- Examples:
  - `feat: add voice input for transactions`
  - `fix: resolve streak reset bug`
  - `docs: update API documentation`
  - `test: add tests for gamification service`

### Before pushing
- [ ] Run tests (`npm test`)
- [ ] Type check succeeds (`npm run build`)
- [ ] Apply migrations if needed (`npm run db:migrate`)
- [ ] Update documentation if changing API or major features
- [ ] No console.log or debugging code left in
- [ ] Remove unused imports

## Environment variables

### Backend `.env`
Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 3000)

Optional:
- `OPENAI_API_KEY` - For AI features (email parsing, insights)
- `REDIS_URL` - Redis connection for caching
- `NODE_ENV` - Set to `production` in prod

### Frontend `.env.local` (in `/mobile`)
Required:
- `API_URL` - Backend API URL (e.g., `http://localhost:3000/api`)

Optional:
- `SENTRY_DSN` - Error tracking (production)

## Common issues

### Backend won't start
- Run `npm install` to update dependencies
- Verify `.env` file exists in `/backend` with correct values
- Check port 3000 isn't already in use: `lsof -i :3000`
- Ensure PostgreSQL is running: `psql $DATABASE_URL`

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check `API_URL` in `.env.local` in `/mobile`
- For iOS simulator: Use `http://localhost:3000`
- For Android emulator: Use `http://10.0.2.2:3000`
- For physical device: Use your computer's local IP

### Database errors
- Run migrations: `npm run db:migrate` (from `/backend`)
- Generate Prisma client: `npm run db:generate` (from `/backend`)
- Check `DATABASE_URL` format is correct
- Reset and reseed: `npx prisma migrate reset` (from `/backend`)

### React Native build fails
- Clear Metro cache: `npm start -- --reset-cache` (from `/mobile`)
- Clean iOS build: `cd mobile/ios && pod install && cd ../..`
- Clean Android build: `cd mobile/android && ./gradlew clean && cd ../..`
- Delete `node_modules` and reinstall

### TypeScript errors after pulling
- Run `npm install` to update dependencies (in both `/backend` and `/mobile`)
- Delete `node_modules` and `package-lock.json`, reinstall
- Regenerate Prisma client: `npm run db:generate` (from `/backend`)

## Deployment

### Deploy backend (Railway/Render)
- Connect GitHub repository
- Set environment variables in dashboard
- Build command: `npm run build`
- Start command: `npm start`
- Run migrations: Add to build command or run manually

### Deploy mobile apps
**iOS (App Store):**
- Build: `cd mobile/ios && pod install && cd .. && npx react-native run-ios --configuration Release`
- Archive in Xcode
- Upload to App Store Connect
- Submit for review

**Android (Play Store):**
- Build: `cd mobile/android && ./gradlew assembleRelease`
- Sign APK/AAB
- Upload to Play Console
- Submit for review

### Pre-deployment checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build succeeds locally
- [ ] Check production API URL is correct
- [ ] Update version numbers

## Helpful commands

### Backend
```bash
# Install dependencies
cd backend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create and apply migration
npm run db:studio      # Open Prisma Studio
```

### Frontend (Mobile)
```bash
# Install dependencies
cd mobile && npm install

# Start Metro bundler
npm start

# Run iOS simulator
npm run ios

# Run Android emulator
npm run android

# Run tests
npm test

# Clear cache
npm start -- --reset-cache
```

## Documentation structure

- `/design/` - Product roadmap and implementation plans
- `PRODUCT_ROADMAP.md` - Phase-by-phase product development plan
- `README.md` - Project setup and overview
- `agents.md` - This file (development workflows)
- `/backend/prisma/schema.prisma` - Database schema

## When adding new features

1. **New API endpoint:**
   - Add route in `/src/routes/<domain>.ts`
   - Add service logic in `/src/services/<Domain>Service.ts`
   - Add Zod validation schema in route file
   - Register router in `/src/index.ts`
   - Write tests in `/tests/<Domain>Service.test.ts`

2. **New database model:**
   - Update schema in `/prisma/schema.prisma`
   - Run `npm run db:migrate` (creates migration)
   - Review generated migration file in `/prisma/migrations/`
   - Run `npm run db:generate` (updates Prisma client)

3. **New mobile screen:**
   - Create screen in `/mobile/src/screens/<ScreenName>.tsx`
   - Add to navigation in `/mobile/src/navigation/`
   - Create components in `/mobile/src/components/`
   - Write tests in `/mobile/src/tests/<ScreenName>.test.tsx`

4. **New mobile component:**
   - Create component in `/mobile/src/components/<ComponentName>.tsx`
   - Add styles using StyleSheet
   - Export from `/mobile/src/components/index.ts`
   - Write tests in `/mobile/src/tests/<ComponentName>.test.tsx`

## Performance tips

- Backend: Use async/await for all I/O operations
- Backend: Add database indexes for frequently queried fields
- Frontend: Use React.memo for expensive components
- Frontend: Implement pagination for long lists (FlatList)
- Frontend: Optimize images before bundling
- Cache: Use Redis for expensive computations
- Database: Use Prisma's connection pooling

## Security reminders

- Never commit secrets (`.env` files in `.gitignore`)
- Use `authenticate` middleware for protected endpoints
- Validate all user input with Zod schemas
- Hash passwords with bcrypt (never store plaintext)
- Use HTTPS in production
- Set CORS origins correctly
- JWT tokens expire in 30 days (configurable)
- Sanitize user input before database queries

## Getting help

- Prisma docs: https://www.prisma.io/docs
- Express docs: https://expressjs.com
- React Native docs: https://reactnative.dev
- Zod validation: https://zod.dev
- Check `/design/` folder for product roadmap

## AI Features (Email Parsing)

### Email parsing workflow
1. User grants Gmail OAuth permission
2. Backend fetches unread emails from specific senders
3. Email content sent to OpenAI API with custom prompt
4. AI extracts: amount, category, date, merchant
5. Transaction created with `source: EMAIL`
6. User can review/edit before confirming

### Supported banks (MVP)
- Akbank
- Garanti BBVA
- İş Bankası
- Ziraat Bankası
- YapıKredi

### Adding new bank support
1. Collect 10+ sample emails from bank
2. Add bank email patterns to `/src/services/EmailParserService.ts`
3. Test parsing accuracy
4. Update user-facing bank list
5. Monitor parsing failures in production

## Gamification System

### Achievement types
- **Streak**: Daily entry, under-budget, no-category spending
- **Milestone**: First transaction, 100th transaction, save 1000 TL
- **Savings**: Monthly savings goals
- **Social**: Friend challenges, leaderboard positions

### Adding new achievement
1. Add achievement definition to database (seed file)
2. Update achievement checking logic in `GamificationService.ts`
3. Create badge icon/image
4. Add notification template
5. Test unlock conditions

### Points calculation
- Daily entry: 10 points
- Stay under budget: 50 points
- 7-day streak: 100 points
- Achievement unlock: Varies (defined in achievement)

## Mobile App Architecture

### Navigation structure
```
App
├── Auth Stack (not logged in)
│   ├── Login
│   └── Register
└── Main Stack (logged in)
    ├── Home (Dashboard)
    ├── Quick Entry
    ├── Transactions
    ├── Budgets
    ├── Achievements
    └── Profile
```

### State management
- Use React Context for global state (user, auth)
- Local state with useState for component-specific data
- Consider Redux Toolkit if complexity grows

### Offline support (Future)
- Use AsyncStorage for caching
- Queue transactions when offline
- Sync when connection restored
