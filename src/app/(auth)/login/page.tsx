'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, getSession } from 'next-auth/react';
import { User, ShieldEllipsis, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthInput } from '@/components/auth/auth-input';
import { AuthPasswordInput } from '@/components/auth/auth-password-input';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthAlert } from '@/components/auth/auth-alert';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'client' | 'partner' | 'admin'>('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const verified = searchParams.get('verified');
  const reset = searchParams.get('reset');
  const callbackUrlError = searchParams.get('error');

  const [infoMessage, setInfoMessage] = useState(
    verified === 'true'
      ? 'Your email has been verified successfully. You can now log in.'
      : reset === 'true'
      ? 'Your password has been reset successfully. You can now log in.'
      : ''
  );

  const [error, setError] = useState(
    callbackUrlError === 'CredentialsSignin'
      ? 'Invalid email, mobile number, or password.'
      : callbackUrlError || ''
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email/mobile and password.');
      return;
    }

    setLoading(true);

    try {
      let targetUrl = '/clients/enquiries';
      if (activeTab === 'admin') targetUrl = '/admin/dashboard';
      else if (activeTab === 'partner') targetUrl = '/partner/dashboard';

      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: targetUrl
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        const session = await getSession();
        const userRole = session?.user?.role;

        if (activeTab === 'admin' && userRole !== 'admin') {
          setError('Access denied. You do not have administrator privileges.');
          await signOut({ redirect: false });
          setLoading(false);
          return;
        }

        if (activeTab === 'partner' && userRole !== 'referral_partner') {
          setError('Access denied. You do not have partner privileges.');
          await signOut({ redirect: false });
          setLoading(false);
          return;
        }

        if (activeTab === 'client' && userRole !== 'client') {
          setError('Access denied. You do not have client privileges.');
          await signOut({ redirect: false });
          setLoading(false);
          return;
        }

        router.push(targetUrl);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errMsg);
      setLoading(false);
    }
  };

  const footerLink = (
    <p className="text-sm text-muted-foreground select-none">
      Don&apos;t have an account?{' '}
      <Link href="/signup" className="text-brand hover:text-gold transition-colors font-semibold">
        Sign up
      </Link>
    </p>
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your premium subscriptions"
      footer={footerLink}
    >
      <AuthAlert type="error" message={error} />
      <AuthAlert type="success" message={infoMessage} />

      {/* Client / Partner / Admin Tabs */}
      <div className="relative flex p-1 bg-soft/40 border border-border/15 rounded-xl mb-6 gap-1">
        <Button
          type="button"
          onClick={() => setActiveTab('client')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${
            activeTab === 'client'
              ? 'bg-gradient-brand text-primary-foreground shadow-soft scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          Client
        </Button>
        <Button
          type="button"
          onClick={() => setActiveTab('partner')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${
            activeTab === 'partner'
              ? 'bg-gradient-brand text-primary-foreground shadow-soft scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          Partner
        </Button>
        <Button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer focus:outline-none ${
            activeTab === 'admin'
              ? 'bg-gradient-brand text-primary-foreground shadow-soft scale-[1.02]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldEllipsis className="h-4 w-4" />
          Admin
        </Button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthInput
          id="email"
          name="email"
          label="Email or Mobile Number"
          type="text"
          autoComplete="username"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email or mobile"
        />

        <AuthPasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          rightElement={
            <Link
              href="/forgot-password"
              className="text-xs text-brand hover:text-gold transition-colors font-medium"
            >
              Forgot password?
            </Link>
          }
        />

        <div className="flex items-center select-none">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-border/15 bg-soft/30 text-brand focus:ring-brand/40 focus:ring-offset-background transition-colors cursor-pointer"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-muted-foreground cursor-pointer">
            Remember me
          </label>
        </div>

        <AuthButton type="submit" loading={loading}>
          Sign In
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="dark min-h-screen bg-gradient-hero flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-mid/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
            <div className="h-16 w-16 bg-soft/50 rounded-full flex items-center justify-center mx-auto border border-border/5">
              <Loader2 className="h-8 w-8 text-brand animate-spin" />
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}