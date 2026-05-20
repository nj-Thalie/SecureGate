'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Spinner from '@/components/ui/Spinner';
import FormError from '@/components/ui/FormError';
import FormSuccess from '@/components/ui/FormSuccess';
import type { AuthMode } from './types';

export default function VerifyEmailForm({ token, switchMode }: { token: string; switchMode: (m: AuthMode) => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.message === 'Email verified') {
          setStatus('success');
          setMessage('Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('An unexpected error occurred');
      });
  }, [token]);

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    setResending(true);
    setResendMsg('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(data.message || 'If the account exists, a verification email has been sent');
    } catch {
      setResendMsg('An unexpected error occurred');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 mb-8">Email Verification</h1>
      {status === 'loading' && (
        <div>
          <Spinner />
          <p className="mt-4 text-zinc-600">Verifying your email...</p>
        </div>
      )}
      {status === 'success' && (
        <div>
          <FormSuccess message={message} />
          <button onClick={() => switchMode('login')} className="mt-6 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Go to login
          </button>
        </div>
      )}
      {status === 'error' && (
        <div>
          <FormError message={message} />
          <p className="mt-6 text-sm font-medium text-zinc-700">Resend verification email</p>
          <form onSubmit={handleResend} className="mt-2 space-y-3">
            <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 bg-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            {resendMsg && <FormSuccess message={resendMsg} />}
            <button type="submit" disabled={resending}
              className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
