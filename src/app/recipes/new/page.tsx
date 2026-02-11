'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: '',
    ingredients: [{ quantity: '', item: '' }],
    instructions: '',
    cookingTime: '',
    servings: '',
    tags: [] as string[],
  });

  const AVAILABLE_TAGS = ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const validateForm = (): boolean => {
    const errs: string[] = [];
    if (form.title.length < 3) errs.push('Title must be at least 3 characters');
    if (form.ingredients.filter(i => i.quantity && i.item).length === 0) errs.push('At least one ingredient required');
    if (form.instructions.length < 10) errs.push('Instructions must be at least 10 characters');
    if (!form.cookingTime || Number(form.cookingTime) <= 0) errs.push('Cooking time must be greater than 0');
    if (!form.servings || Number(form.servings) <= 0) errs.push('Servings must be greater than 0');
    setErrors(errs);
    return errs.length === 0;
  };

  const addIngredient = () => {
    setForm({ ...form, ingredients: [...form.ingredients, { quantity: '', item: '' }] });
  };

  const updateIngredient = (idx: number, field: keyof typeof form.ingredients[0], value: string) => {
    const updated = form.ingredients.map((ing, i) =>
      i === idx ? { ...ing, [field]: value } : ing
    );
    setForm({ ...form, ingredients: updated });
  };

  const removeIngredient = (idx: number) => {
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });
  };

  const toggleTag = (tag: string) => {
    setForm({
      ...form,
      tags: form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cookingTime: Number(form.cookingTime),
        servings: Number(form.servings),
        ingredients: form.ingredients.filter(i => i.quantity && i.item),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/recipes/${data.id}`);
    } else {
      setLoading(false);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p>Please <Link href="/login" className="text-blue-600 underline">sign in</Link> to create recipes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Recipe</h1>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 rounded">
          {errors.map((err, i) => <p key={i} className="text-red-700 text-sm">{err}</p>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
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
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="px-2 py-2 text-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="text-sm text-blue-600">
            + Add ingredient
          </button>
        </div>

        <div>
          <label className="block font-medium mb-1">Instructions</label>
          <textarea
            rows={6}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Cooking Time (mins)</label>
            <input
              type="number"
              value={form.cookingTime}
              onChange={(e) => setForm({ ...form, cookingTime: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Servings</label>
            <input
              type="number"
              value={form.servings}
              onChange={(e) => setForm({ ...form, servings: e.target.value })}
              required
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
                className={`px-3 py-1 rounded text-sm ${
                  form.tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Recipe'}
        </button>
      </form>
    </div>
  );
}
