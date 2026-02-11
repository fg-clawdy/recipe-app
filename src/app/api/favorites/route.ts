import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const favoriteSchema = z.object({
  recipeId: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
    });

    const recipes = await Promise.all(
      favorites.map((f: any) => prisma.recipe.findUnique({ where: { id: f.recipeId } }))
    );

    return NextResponse.json(recipes.filter(Boolean));
  } catch (error) {
    console.error('Get favorites error:', error);
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
    const result = favoriteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId: session.user.id, recipeId: result.data.recipeId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId: session.user.id, recipeId: result.data.recipeId },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
