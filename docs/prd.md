# Tasty - Recipe Sharing Platform PRD

## Overview
**Tasty** is a recipe sharing platform where users can create, share, search, and favorite recipes. Mobile-first design, Vercel-deployable.

**Deadline:** Live on Vercel by 04:09 UTC (1 hour from requirements)

---

## Tech Stack

### Core
- **Next.js 14** (App Router) - Vercel-native, fast deployment
- **TypeScript** - Type safety
- **Tailwind CSS** - Mobile-first styling
- **Prisma ORM** - Database management
- **SQLite** (development) / **PostgreSQL** (production via Vercel Postgres)

### Auth
- **NextAuth.js** - Email/password authentication

### Deployment
- **Vercel** - Zero-config, automatic HTTPS, serverless

**Why this stack:** Fastest path to Vercel deployment. Next.js is Vercel's native framework. SQLite for rapid local dev, Postgres for production. NextAuth.js standard for Next.js auth.

---

## Features

### 1. User Authentication
- **Register:** email, password, display name
- **Login:** email + password
- **No email verification** (faster onboarding)
- Passwords hashed with bcrypt

### 2. Recipes
- **Create:** logged-in users create recipes
- **Fields:** title, ingredients (structured list), instructions, cooking time, servings, tags (cuisine/dietary)
- **View:** public board, anyone can view all recipes
- **Edit/Delete:** only recipe owner
- **No images** (MVP simplification)

### 3. Search & Filter
- **Search by ingredient** (case-insensitive)
- **Filter by tags:** cuisine type, dietary restrictions
- **Sort:** newest, oldest, most favorited

### 4. Favorites
- Logged-in users can favorite/unfavorite recipes
- View personal favorites list
- Favorite count displayed on recipes

### 5. User Profiles
- View own profile: recipes created, favorites
- View others' profiles: their recipes and favorites
- No private info displayed on public profiles

### 6. Bootstrap Data
- Seed with **15 diverse recipes** on first deploy
- Cover various cuisines and dietary options

---

## Database Schema

```prisma
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  displayName  String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  recipes      Recipe[]
  favorites    Favorite[]
}

model Recipe {
  id           String     @id @default(cuid())
  title        String
  ingredients  Json       // [{quantity, item}]
  instructions String     @db.Text
  cookingTime  Int        // minutes
  servings     Int
  tags         String[]   // [Italian, Vegetarian, etc]
  authorId     String
  author       User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  favorites    Favorite[]
  
  @@index([authorId])
  @@index([createdAt])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  recipeId  String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([userId, recipeId])
  @@index([userId])
  @@index([recipeId])
}
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- NextAuth.js handles login/logout

### Recipes
- `GET /api/recipes` - List recipes (query: page, search, tags, sort)
- `GET /api/recipes/[id]` - Get single recipe
- `POST /api/recipes` - Create recipe (auth required)
- `PUT /api/recipes/[id]` - Update recipe (auth required, owner only)
- `DELETE /api/recipes/[id]` - Delete recipe (auth required, owner only)

### Favorites
- `POST /api/favorites` - Add favorite (auth required, body: {recipeId})
- `DELETE /api/favorites/[recipeId]` - Remove favorite (auth required)
- `GET /api/favorites` - Get user's favorites (auth required)

### Users
- `GET /api/users/[id]` - Get user profile
- `GET /api/users/[id]/recipes` - Get user's recipes
- `GET /api/users/[id]/favorites` - Get user's favorites

---

## Security

### Authentication
- Passwords hashed with bcrypt (cost 12)
- NextAuth.js JWT sessions (HTTP-only cookies)
- CSRF protection built into NextAuth

### Authorization
- Protected routes check authentication
- Users can only edit/delete own recipes
- 403 errors for unauthorized actions

### Input Validation
- Email format validation
- Password: min 8 chars, letter + number
- Title: 3-100 chars
- Numeric fields validated (time, servings > 0)
- Tags from predefined list only

### Data Protection
- Passwords never stored plain text
- Email case-normalized
- Emails not exposed on public profiles

---

## Mobile-First UX

### Responsive Breakpoints
- **Mobile:** 320-639px (1 column)
- **Tablet:** 640-1023px (2 columns)
- **Desktop:** 1024px+ (3 columns)

### Touch Targets
- Minimum 44x44px for all interactive elements
- Large favorite button
- Native mobile form controls

### Performance
- Server-side rendering (Next.js default)
- Code splitting and lazy loading
- Optimistic UI for favorites

---

## Deployment (for Jan)

### Vercel Setup
1. Connect GitHub repo to Vercel
2. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<random-32-char-string>
   ```
3. Generate secret: `openssl rand -base64 32`
4. Deploy: push to `main` branch

### Database
- Development: SQLite (local)
- Production: Vercel Postgres (auto-provisioned)
- Run migrations: `npx prisma migrate deploy`
- Seed: `npx prisma db seed`

### Health Check
- Endpoint: `GET /api/health`
- Monitor: API response times, error rates

---

## File Structure

```
/app
  /api
    /auth
      /register/route.ts
      [...nextauth]/route.ts
    /recipes
      route.ts
      /[id]/route.ts
    /favorites
      route.ts
      /[recipeId]/route.ts
    /users
      /[id]/route.ts
      /[id]/recipes/route.ts
      /[id]/favorites/route.ts
    /health/route.ts
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(app)
    page.tsx (homepage - recipe list)
    /recipes
      /[id]/page.tsx
      /new/page.tsx
      /[id]/edit/page.tsx
    /favorites/page.tsx
    /profile/page.tsx
    /users/[id]/page.tsx
/components
  /ui (shadcn components)
  RecipeCard.tsx
  RecipeForm.tsx
  SearchBar.tsx
  FilterPanel.tsx
  Navbar.tsx
  FavoriteButton.tsx
/lib
  prisma.ts
  auth.ts
  validations.ts
/prisma
  schema.prisma
  seed.ts
```

---

## Acceptance Criteria

### Must Have (MVP)
- ✅ User registration/login (email/password, no verification)
- ✅ Public recipe board (viewable by all)
- ✅ Create/edit/delete recipes (auth required, owner only)
- ✅ Recipe fields: title, ingredients, instructions, time, servings, tags
- ✅ Search by ingredient
- ✅ Filter by tags
- ✅ Favorite/unfavorite recipes
- ✅ View own favorites
- ✅ User profiles (own + others)
- ✅ 15 seed recipes
- ✅ Mobile-responsive
- ✅ Deployed to Vercel

### Nice to Have (Future)
- Recipe images
- Ratings/reviews
- Social features (follow, activity feed)
- Advanced search
- Nutritional info

---

## Timeline

**Total: 40 minutes** (Deb implementation)
- Setup & auth: 10 min
- Recipe CRUD: 15 min
- Search/filter/favorites: 10 min
- Seed data & styling: 5 min

**Testing:** 10 min (Qan)
**Deploy:** 5 min (Jan)

---

## Bootstrap Recipe Ideas

Seed 15 recipes covering:
1. Italian: Spaghetti Carbonara, Margherita Pizza
2. Mexican: Tacos, Guacamole
3. Asian: Pad Thai, Fried Rice
4. American: Burger, Mac & Cheese
5. Mediterranean: Greek Salad, Hummus
6. Desserts: Chocolate Chip Cookies, Brownies
7. Breakfast: Pancakes, Omelette
8. Dietary: Vegan Buddha Bowl

Each with realistic ingredients, instructions, time, servings.

---

## Notes for Deb

- Use `create-next-app` for rapid setup
- Install: `prisma`, `@prisma/client`, `next-auth`, `bcryptjs`, `zod`
- Tailwind + shadcn/ui for quick styling
- Focus on functionality > polish
- Test locally before deploying
- Push to `main` when ready

---

**PRD Version:** 1.0  
**Created:** 2026-02-11 03:36 UTC  
**Author:** Archie  
**Status:** Submitted for Cito review  
**Deadline:** Live app by 04:09 UTC
