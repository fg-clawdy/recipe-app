import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const recipes = await prisma.recipe.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
    });

    const favoriteRecipes = await Promise.all(
      favorites.map((f: any) => prisma.recipe.findUnique({ where: { id: f.recipeId } }))
    );

    return NextResponse.json({
      id: user.id,
      displayName: user.displayName,
      recipes,
      favorites: favoriteRecipes.filter(Boolean),
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
