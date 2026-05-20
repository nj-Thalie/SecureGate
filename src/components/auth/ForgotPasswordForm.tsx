'use client';

import { useState, FormEvent } from 'react';
import Spinner from '@/components/ui/Spinner';
import FormError from '@/components/ui/FormError';
import FormSuccess from '@/components/ui/FormSuccess';
import type { AuthMode } from './types';

export default function ForgotPasswordForm({ switchMode, urlError }: { switchMode: (m: AuthMode) => void; urlError: string }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setSuccess(data.message || 'If the email exists, a reset link has been sent');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 text-center mb-8">Reset your password</h1>
      {urlError && <div className="mb-4"><FormError message={urlError} /></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-zinc-700">Email</label>
          <input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <button type="submit" disabled={loading}
          className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Spinner />}{loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-600">
        <button onClick={() => switchMode('login')} className="text-indigo-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Back to login</button>
      </p>
    </div>
  );
}
