'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  cookingTime: number;
  servings: number;
  tags: string[];
}

export default function FavoritesPage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const res = await fetch('/api/favorites');
    if (res.ok) {
      const data = await res.json();
      setRecipes(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Favorites</h1>
        {recipes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No favorites yet.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
              Browse recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(recipe => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-lg mb-2">{recipe.title}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  ⏱ {recipe.cookingTime} min • 👥 {recipe.servings} servings
                </p>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
