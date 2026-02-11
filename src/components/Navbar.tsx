'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Tasty
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {session?.user ? (
              <>
                <Link href="/recipes/new" className="text-gray-700 hover:text-blue-600">
                  Add Recipe
                </Link>
                <Link href="/favorites" className="text-gray-700 hover:text-blue-600">
                  Favorites
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                  {session.user.name || 'Profile'}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t">
            {session?.user ? (
              <div className="flex flex-col gap-3">
                <Link href="/recipes/new" className="text-gray-700" onClick={() => setMobileOpen(false)}>
                  Add Recipe
                </Link>
                <Link href="/favorites" className="text-gray-700" onClick={() => setMobileOpen(false)}>
                  Favorites
                </Link>
                <Link href="/profile" className="text-gray-700" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="text-left text-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" className="text-gray-700" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="text-gray-700" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
