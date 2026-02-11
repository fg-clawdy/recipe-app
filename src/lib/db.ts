// Simple in-memory store for demo (Vercel serverless compatible)
// In production, replace with PrismaClient
interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
}

interface Recipe {
  id: string;
  title: string;
  ingredients: { quantity: string; item: string }[];
  instructions: string;
  cookingTime: number;
  servings: number;
  tags: string[];
  authorId: string;
  createdAt: Date;
}

interface Favorite {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: Date;
}

// In-memory stores
const users: Map<string, User> = new Map();
const recipes: Map<string, Recipe> = new Map();
const favorites: Map<string, Favorite> = new Map();
const emailToUserId: Map<string, string> = new Map();

export const db = {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      if (where.email) {
        const id = emailToUserId.get(where.email.toLowerCase());
        return id ? users.get(id) || null : null;
      }
      if (where.id) {
        return users.get(where.id) || null;
      }
      return null;
    },
    findMany: async () => Array.from(users.values()),
    create: async ({ data }: { data: any }) => {
      const user = { ...data, id: data.id || crypto.randomUUID(), createdAt: new Date() };
      users.set(user.id, user);
      emailToUserId.set(user.email.toLowerCase(), user.id);
      return user;
    },
    count: async () => users.size,
  },
  recipe: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      return recipes.get(where.id) || null;
    },
    findMany: async ({ where, orderBy, skip, take }: any = {}) => {
      let result = Array.from(recipes.values());
      if (where?.authorId) {
        result = result.filter((r) => r.authorId === where.authorId);
      }
      if (orderBy?.createdAt === 'desc') {
        result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      if (skip) result = result.slice(skip);
      if (take) result = result.slice(0, take);
      return result;
    },
    create: async ({ data }: { data: any }) => {
      const recipe = { ...data, id: data.id || crypto.randomUUID(), createdAt: new Date() };
      recipes.set(recipe.id, recipe);
      return recipe;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      recipes.delete(where.id);
    },
  },
  favorite: {
    findUnique: async ({ where }: { where: { userId_recipeId?: { userId: string; recipeId: string } } }) => {
      if (where.userId_recipeId) {
        const key = `${where.userId_recipeId.userId}:${where.userId_recipeId.recipeId}`;
        return favorites.get(key) || null;
      }
      return null;
    },
    findMany: async ({ where }: { where?: { userId?: string } } = {}) => {
      let result = Array.from(favorites.values());
      if (where?.userId) {
        result = result.filter((f) => f.userId === where.userId);
      }
      return result;
    },
    create: async ({ data }: { data: any }) => {
      const key = `${data.userId}:${data.recipeId}`;
      const fav = { ...data, id: data.id || crypto.randomUUID(), createdAt: new Date() };
      favorites.set(key, fav);
      return fav;
    },
    delete: async ({ where }: { where: { id: string } | { userId: string; recipeId: string } }) => {
      if ('id' in where) {
        for (const [key, fav] of favorites) {
          if (fav.id === where.id) {
            favorites.delete(key);
            return;
          }
        }
      } else {
        const key = `${where.userId}:${where.recipeId}`;
        favorites.delete(key);
      }
    },
    count: async ({ where }: { where?: { recipeId?: string } } = {}) => {
      let result = Array.from(favorites.values());
      if (where?.recipeId) {
        result = result.filter((f) => f.recipeId === where.recipeId);
      }
      return result.length;
    },
  },
  $connect: async () => {},
  $disconnect: async () => {},
};

// Seed data
export async function seedData() {
  if (await db.user.count() > 0) return;

  const { hash } = await import('bcryptjs');
  const user = await db.user.create({
    data: {
      id: 'demo-user',
      email: 'demo@example.com',
      passwordHash: await hash('test1234', 12),
      displayName: 'Demo User',
    },
  });

  const seedRecipes = [
    {
      title: 'Classic Spaghetti Carbonara',
      ingredients: [
        { quantity: '400g', item: 'spaghetti' },
        { quantity: '4', item: 'eggs' },
        { quantity: '100g', item: 'Pecorino Romano cheese' },
        { quantity: '100g', item: 'guanciale' },
        { quantity: '1 tsp', item: 'black pepper' },
      ].map((i) => JSON.parse(JSON.stringify(i))),
      instructions: '1. Cook spaghetti in salted boiling water.\n2. While pasta cooks, whisk eggs with grated cheese and pepper.\n3. Fry guanciale until crispy.\n4. Toss hot pasta with egg mixture and guanciale.\n5. Add reserved pasta water to create creamy sauce.\n6. Serve immediately with extra cheese.',
      cookingTime: 20,
      servings: 4,
      tags: ['Italian', 'Dinner'],
      authorId: user.id,
    },
    {
      title: 'Chicken Tikka Masala',
      ingredients: [
        { quantity: '500g', item: 'chicken breast' },
        { quantity: '1 can', item: 'coconut milk' },
        { quantity: '400g', item: 'canned tomatoes' },
        { quantity: '2 tbsp', item: 'garam masala' },
        { quantity: '1', item: 'onion' },
      ].map((i) => JSON.parse(JSON.stringify(i))),
      instructions: '1. Marinate chicken in yogurt and spices.\n2. Grill marinated chicken until cooked.\n3. Sauté onions with spices.\n4. Add tomatoes and coconut milk, simmer.\n5. Add grilled chicken to sauce.\n6. Simmer for 15 minutes.',
      cookingTime: 45,
      servings: 4,
      tags: ['Asian', 'Dinner'],
      authorId: user.id,
    },
    {
      title: 'Vegan Buddha Bowl',
      ingredients: [
        { quantity: '1 cup', item: 'quinoa' },
        { quantity: '1', item: 'sweet potato' },
        { quantity: '1 cup', item: 'chickpeas' },
        { quantity: '1', item: 'avocado' },
        { quantity: '2 tbsp', item: 'tahini' },
      ].map((i) => JSON.parse(JSON.stringify(i))),
      instructions: '1. Roast chickpeas and sweet potato cubes.\n2. Cook quinoa according to package.\n3. Slice avocado and prepare vegetables.\n4. Whisk tahini with lemon and water for dressing.\n5. Assemble bowls with quinoa, roasted veggies, and toppings.',
      cookingTime: 30,
      servings: 2,
      tags: ['Vegetarian', 'Vegan', 'Lunch'],
      authorId: user.id,
    },
    {
      title: 'Healthy Breakfast Smoothie',
      ingredients: [
        { quantity: '1 cup', item: 'spinach' },
        { quantity: '1', item: 'banana' },
        { quantity: '1/2 cup', item: 'frozen berries' },
        { quantity: '1 cup', item: 'almond milk' },
        { quantity: '1 tbsp', item: 'chia seeds' },
      ].map((i) => JSON.parse(JSON.stringify(i))),
      instructions: '1. Add spinach and almond milk to blender.\n2. Add banana and berries.\n3. Blend until smooth.\n4. Add chia seeds and pulse briefly.\n5. Pour into glass and serve.',
      cookingTime: 5,
      servings: 1,
      tags: ['Vegan', 'Breakfast', 'Vegetarian'],
      authorId: user.id,
    },
  ];

  for (const recipe of seedRecipes) {
    await db.recipe.create({ data: recipe });
  }
}
