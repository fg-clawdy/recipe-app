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
  authorId: string;
  favoriteCount: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const res = await fetch('/api/recipes');
    const data = await res.json();
    setRecipes(data.recipes || []);
    setLoading(false);
  };

  const allTags = [...new Set(recipes.flatMap(r => r.tags))];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.id;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => recipe.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sort === 'newest') return new Date(b.id).getTime() - new Date(a.id).getTime();
    if (sort === 'oldest') return new Date(a.id).getTime() - new Date(b.id).getTime();
    if (sort === 'cookingTime') return a.cookingTime - b.cookingTime;
    return 0;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="cookingTime">Cooking Time</option>
            </select>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 py-1">Filter by tag:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {session?.user && (
          <div className="mb-6">
            <Link
              href="/recipes/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add New Recipe
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRecipes.map(recipe => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold text-lg mb-2">{recipe.title}</h2>
              <p className="text-sm text-gray-600 mb-2">
                ⏱ {recipe.cookingTime} min • 👥 {recipe.servings} servings • ❤️ {recipe.favoriteCount}
              </p>
              <div className="flex flex-wrap gap-1">
                {recipe.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {sortedRecipes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No recipes found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
