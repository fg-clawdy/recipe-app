'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  cookingTime: number;
  servings: number;
  tags: string[];
}

interface UserProfile {
  id: string;
  displayName: string;
  recipes: Recipe[];
  favorites: Recipe[];
}

export default function UserProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  const fetchProfile = async () => {
    const res = await fetch(`/api/users/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!profile) return <div className="p-4 text-center">User not found</div>;

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{profile.displayName}</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recipes by {profile.displayName}</h2>
          {profile.recipes.length === 0 ? (
            <p className="text-gray-500">No recipes yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.recipes.map(recipe => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
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

        <div>
          <h2 className="text-xl font-semibold mb-4">{profile.displayName}&apos;s Favorites</h2>
          {profile.favorites.length === 0 ? (
            <p className="text-gray-500">No favorites yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.favorites.map(recipe => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
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
    </div>
  );
}
