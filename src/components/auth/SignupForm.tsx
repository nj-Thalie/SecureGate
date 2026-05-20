'use client';

import { useState, FormEvent } from 'react';
import Spinner from '@/components/ui/Spinner';
import FormError from '@/components/ui/FormError';
import FormSuccess from '@/components/ui/FormSuccess';
import Input from '@/components/ui/Input';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import type { AuthMode } from './types';

export default function SignupForm({ switchMode }: { switchMode: (m: AuthMode) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || 'Registration failed');
        return;
      }
      setSuccess(data.message || 'Check your email to verify your account');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 text-center mb-8">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700">Full name</label>
          <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-700">Enter e-mail</label>
          <Input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-zinc-700">Choose Password</label>
          <Input id="signup-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          {password && <PasswordStrengthIndicator password={password} />}
        </div>
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <button type="submit" disabled={loading}
          className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Spinner />}{loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <button onClick={() => switchMode('login')} className="text-indigo-600 hover:underline bg-transparent border-none p-0 cursor-pointer">Sign in</button>
      </p>
    </div>
  );
}
