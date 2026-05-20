'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import FormError from '@/components/ui/FormError';
import FormSuccess from '@/components/ui/FormSuccess';
import Input from '@/components/ui/Input';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400) {
          router.push('/auth?mode=forgot-password&error=expired_or_invalid');
          return;
        }
        setError(data.error || 'Reset failed');
        return;
      }
      setSuccess('Password reset successful! Redirecting...');
      redirectTimer.current = setTimeout(() => router.push('/auth?mode=login'), 2000);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 text-center mb-8">Set new password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-zinc-700">New password</label>
          <Input id="new-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          {password && <PasswordStrengthIndicator password={password} />}
        </div>
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <button type="submit" disabled={loading}
          className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Spinner />}{loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
