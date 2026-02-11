'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const AVAILABLE_TAGS = ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function EditRecipePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    title: '',
    ingredients: [{ quantity: '', item: '' }],
    instructions: '',
    cookingTime: '',
    servings: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchRecipe();
  }, [params.id]);

  const fetchRecipe = async () => {
    const res = await fetch(`/api/recipes/${params.id}`);
    if (!res.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.authorId !== session?.user?.id) {
      setIsAuthor(false);
      setLoading(false);
      return;
    }
    setIsAuthor(true);
    setForm({
      title: data.title || '',
      ingredients: data.ingredients?.length > 0 ? data.ingredients : [{ quantity: '', item: '' }],
      instructions: data.instructions || '',
      cookingTime: data.cookingTime?.toString() || '',
      servings: data.servings?.toString() || '',
      tags: data.tags || [],
    });
    setLoading(false);
  };

  const updateIngredient = (idx: number, field: 'quantity' | 'item', value: string) => {
    const updated = form.ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing));
    setForm({ ...form, ingredients: updated });
  };

  const toggleTag = (tag: string) => {
    setForm({
      ...form,
      tags: form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/recipes/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cookingTime: Number(form.cookingTime),
        servings: Number(form.servings),
      }),
    });

    if (res.ok) {
      router.push(`/recipes/${params.id}`);
    } else {
      alert('Failed to save recipe');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (notFound) return <div className="p-4 text-center">Recipe not found</div>;
  if (!isAuthor) return <div className="p-4 text-center">You can only edit your own recipes</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Ingredients</label>
          {form.ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                className="w-20 px-2 py-2 border rounded"
              />
              <input
                placeholder="Ingredient"
                value={ing.item}
                onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                className="flex-1 px-2 py-2 border rounded"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block font-medium mb-1">Instructions</label>
          <textarea
            rows={6}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Cooking Time (mins)</label>
            <input
              type="number"
              value={form.cookingTime}
              onChange={(e) => setForm({ ...form, cookingTime: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Servings</label>
            <input
              type="number"
              value={form.servings}
              onChange={(e) => setForm({ ...form, servings: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded text-sm cursor-pointer ${form.tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/recipes/${params.id}`}
            className="px-4 py-2 border rounded text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
