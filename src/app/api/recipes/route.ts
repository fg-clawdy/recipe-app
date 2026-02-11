import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const recipeSchema = z.object({
  title: z.string().min(3).max(100),
  ingredients: z.array(z.object({
    quantity: z.string(),
    item: z.string(),
  })).min(1),
  instructions: z.string().min(10),
  cookingTime: z.number().int().positive(),
  servings: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const sort = searchParams.get('sort') || 'newest';

    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    let recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      recipes = recipes.filter((r: any) =>
        r.title.toLowerCase().includes(searchLower) ||
        r.ingredients.some((i: any) => i.item.toLowerCase().includes(searchLower))
      );
    }

    // Apply tags filter
    if (tags.length > 0 && tags[0] !== '') {
      recipes = recipes.filter((r: any) =>
        tags.every((tag) => r.tags.includes(tag))
      );
    }

    // Apply sort
    if (sort === 'oldest') {
      recipes.reverse();
    } else if (sort === 'cookingTime') {
      recipes.sort((a: any, b: any) => a.cookingTime - b.cookingTime);
    }

    // Get favorite counts
    const recipesWithFavorites = await Promise.all(
      recipes.map(async (recipe: any) => {
        const favoriteCount = await prisma.favorite.count({ where: { recipeId: recipe.id } });
        return { ...recipe, favoriteCount };
      })
    );

    return NextResponse.json({
      recipes: recipesWithFavorites,
      page,
      pageSize,
      total: recipes.length,
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = recipeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        ...result.data,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Create recipe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
