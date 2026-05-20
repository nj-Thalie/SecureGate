'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';
import type { AuthMode } from '@/components/auth/types';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get('mode') as AuthMode) || 'login';
  const token = searchParams.get('token') || '';
  const urlError = searchParams.get('error') || '';

  const switchMode = (m: AuthMode) => {
    const params = new URLSearchParams({ mode: m });
    if ((m === 'reset-password' || m === 'verify-email') && token) {
      params.set('token', token);
    }
    router.push(`/auth?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        {mode === 'login' && <LoginForm key="login" switchMode={switchMode} />}
        {mode === 'signup' && <SignupForm key="signup" switchMode={switchMode} />}
        {mode === 'forgot-password' && <ForgotPasswordForm key="forgot-password" switchMode={switchMode} urlError={urlError === 'expired_or_invalid' ? 'The reset link is expired or invalid. Please request a new one.' : ''} />}
        {mode === 'reset-password' && <ResetPasswordForm key="reset-password" token={token} />}
        {mode === 'verify-email' && <VerifyEmailForm key="verify-email" token={token} switchMode={switchMode} />}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Spinner />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
