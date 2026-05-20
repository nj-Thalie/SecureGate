'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-zinc-900">SecureGate</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/auth' })}
            className="rounded bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12">
        <h2 className="text-2xl font-semibold text-zinc-900">Dashboard</h2>
        <p className="mt-2 text-zinc-600">Welcome, {session.user?.name || session.user?.email}.</p>
        <div className="mt-8 rounded border border-zinc-200 bg-white p-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Account</h3>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500">Name</dt>
              <dd className="text-sm text-zinc-900">{session.user?.name || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500">Email</dt>
              <dd className="text-sm text-zinc-900">{session.user?.email}</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}