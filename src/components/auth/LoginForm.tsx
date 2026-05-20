'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Spinner from '@/components/ui/Spinner';
import FormError from '@/components/ui/FormError';
import type { AuthMode } from './types';

export default function LoginForm({ switchMode }: { switchMode: (m: AuthMode) => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before logging in. Check your inbox.');
        return;
      }
      if (result?.error) {
        setError('Invalid credentials');
        return;
      }
      if (result?.ok) router.push('/dashboard');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 text-center mb-8">Sign in to SecureGate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        {error && <FormError message={error} />}
        <button type="submit" disabled={loading}
          className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Spinner />}{loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-600">
        Don&apos;t have an account?{' '}
        <button onClick={() => switchMode('signup')} className="text-indigo-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Sign up</button>
      </p>
      <p className="mt-2 text-center text-sm text-zinc-600">
        <button onClick={() => switchMode('forgot-password')} className="text-indigo-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Forgot password?</button>
      </p>
    </div>
  );
}
