'use client';
 
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
 
interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string | React.ReactNode;
  footer?: React.ReactNode;
  bannerTitle?: string;
  bannerDescription?: string;
}
 
export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative font-sans antialiased overflow-x-hidden">
      {/* Subtle modern radial glow in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
 
      <div className="w-full max-w-[420px] py-8 flex flex-col gap-6 relative z-10">
        {/* Centered Brand Branding */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-soft p-1 transition-all duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                width={120}
                height={120}
                className="object-contain rounded-lg"
                alt="SpendSmart logo"
                priority
              />
            </div>
            <div className="text-center select-none mt-1">
              <span className="block font-display font-extrabold text-xl tracking-tight text-foreground leading-none">
                SpendSmart
              </span>
              <span className="text-[9px] uppercase tracking-widest text-primary/95 font-bold mt-1 block">
                Subscriptions
              </span>
            </div>
          </Link>
        </div>
 
        {/* Minimal Card Container */}
        <div className="bg-card border border-border/80 shadow-elegant rounded-2xl p-6 sm:p-8">
          <div className="mb-6 space-y-1 text-center">
            {title && (
              <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
 
        {footer && (
          <div className="text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
