import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const recipes = [
  {
    title: 'Classic Spaghetti Carbonara',
    ingredients: [
      { quantity: '400g', item: 'spaghetti' },
      { quantity: '4', item: 'eggs' },
      { quantity: '100g', item: 'Pecorino Romano cheese' },
      { quantity: '100g', item: 'guanciale' },
      { quantity: '1 tsp', item: 'black pepper' },
    ],
    instructions: '1. Cook spaghetti in salted boiling water.\n2. While pasta cooks, whisk eggs with grated cheese and pepper.\n3. Fry guanciale until crispy.\n4. Toss hot pasta with egg mixture and guanciale.\n5. Add reserved pasta water to create creamy sauce.\n6. Serve immediately with extra cheese.',
    cookingTime: 20,
    servings: 4,
    tags: ['Italian', 'Dinner'],
  },
  {
    title: 'Chicken Tikka Masala',
    ingredients: [
      { quantity: '500g', item: 'chicken breast' },
      { quantity: '1 can', item: 'coconut milk' },
      { quantity: '400g', item: 'canned tomatoes' },
      { quantity: '2 tbsp', item: 'garam masala' },
      { quantity: '1', item: 'onion' },
    ],
    instructions: '1. Marinate chicken in yogurt and spices.\n2. Grill marinated chicken until cooked.\n3. Sauté onions with spices.\n4. Add tomatoes and coconut milk, simmer.\n5. Add grilled chicken to sauce.\n6. Simmer for 15 minutes.',
    cookingTime: 45,
    servings: 4,
    tags: ['Asian', 'Dinner'],
  },
  {
    title: 'Vegan Buddha Bowl',
    ingredients: [
      { quantity: '1 cup', item: 'quinoa' },
      { quantity: '1', item: 'sweet potato' },
      { quantity: '1 cup', item: 'chickpeas' },
      { quantity: '1', item: 'avocado' },
      { quantity: '2 tbsp', item: 'tahini' },
    ],
    instructions: '1. Roast chickpeas and sweet potato cubes.\n2. Cook quinoa according to package.\n3. Slice avocado and prepare vegetables.\n4. Whisk tahini with lemon and water for dressing.\n5. Assemble bowls with quinoa, roasted veggies, and toppings.',
    cookingTime: 30,
    servings: 2,
    tags: ['Vegetarian', 'Vegan', 'Lunch'],
  },
  {
    title: 'Healthy Breakfast Smoothie',
    ingredients: [
      { quantity: '1 cup', item: 'spinach' },
      { quantity: '1', item: 'banana' },
      { quantity: '1/2 cup', item: 'frozen berries' },
      { quantity: '1 cup', item: 'almond milk' },
      { quantity: '1 tbsp', item: 'chia seeds' },
    ],
    instructions: '1. Add spinach and almond milk to blender.\n2. Add banana and berries.\n3. Blend until smooth.\n4. Add chia seeds and pulse briefly.\n5. Pour into glass and serve.',
    cookingTime: 5,
    servings: 1,
    tags: ['Vegan', 'Breakfast', 'Vegetarian'],
  },
];

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  const passwordHash = await hash('test1234', 12);
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash,
      displayName: 'Demo User',
    },
  });

  for (const recipe of recipes) {
    await prisma.recipe.create({
      data: {
        ...recipe,
        authorId: user.id,
      },
    });
  }

  console.log('Seeded 4 recipes with demo user');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
