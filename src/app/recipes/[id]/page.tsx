'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  ingredients: { quantity: string; item: string }[];
  instructions: string;
  cookingTime: number;
  servings: number;
  tags: string[];
  authorId: string;
  author: { id: string; displayName: string } | null;
  favoriteCount: number;
  createdAt: string;
}

export default function RecipeDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [params.id]);

  const fetchRecipe = async () => {
    const res = await fetch(`/api/recipes/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setRecipe(data);
    }
    setLoading(false);
  };

  const toggleFavorite = async () => {
    if (!session?.user) return;
    
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: params.id }),
    });

    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
      fetchRecipe();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    const res = await fetch(`/api/recipes/${params.id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.push('/');
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!recipe) return <div className="p-4 text-center">Recipe not found</div>;

  const isAuthor = session?.user?.id === recipe.authorId;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{recipe.title}</h1>
          {session?.user && (
            <button
              onClick={toggleFavorite}
              className="text-2xl"
              aria-label={favorited ? 'Unfavorite' : 'Favorite'}
            >
              {favorited ? '❤️' : '🤍'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {recipe.author && (
            <span>
              By{' '}
              <Link href={`/users/${recipe.author.id}`} className="text-blue-600">
                {recipe.author.displayName}
              </Link>
            </span>
          )}
          <span>• ⏱ {recipe.cookingTime} min</span>
          <span>• 👥 {recipe.servings} servings</span>
          <span>• ❤️ {recipe.favoriteCount} favorites</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-medium">{ing.quantity}</span>
                <span>{ing.item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Instructions</h2>
          <div className="whitespace-pre-wrap">{recipe.instructions}</div>
        </div>

        {isAuthor && (
          <div className="flex gap-4 pt-4 border-t">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
