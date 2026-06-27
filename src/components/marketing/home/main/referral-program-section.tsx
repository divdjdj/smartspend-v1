"use client";

import { Share2, Wallet, Gift, Check, Tag, ShieldCheck, ArrowRight, Infinity as InfinityIcon } from "lucide-react";
import Link from "next/link";

export function ReferralProgramSection() {
  return (
    <section id="referral" className="relative overflow-hidden bg-secondary/30 py-20">
      <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-brand-soft/10 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-brand-soft/10 blur-3xl" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand backdrop-blur sm:text-base">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" /> Referral Program
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-4xl">
            Share the Savings. <span className="bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent font-extrabold">Earn Rewards.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
            Enjoying your savings with SpendSmart? Refer friends, colleagues or your network and
            get rewarded on each successful referral.
          </p>
        </div>

        {/* REWARDS SECTION */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Cash Reward Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-8 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/5 blur-2xl" />
            {/* Subtle top indicator bar on hover */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand shadow-sm transition-all duration-300 group-hover:scale-105">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-black bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent">
                  Cash Reward
                </h3>
              </div>
              <ul className="mt-6 space-y-4 text-[13px] sm:text-sm text-foreground/80">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
                  <span>
                    Get <strong>₹1,000</strong> for referrals resulting in purchases{" "}
                    <strong>above ₹4,000</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
                  <span>
                    Get <strong>₹500</strong> for referrals resulting in purchases{" "}
                    <strong>below ₹4,000</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Subscription Reward Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-8 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/5 blur-2xl" />
            {/* Subtle top indicator bar on hover */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand shadow-sm transition-all duration-300 group-hover:scale-105">
                  <Gift className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-black bg-gradient-to-r from-brand to-gold bg-clip-text text-transparent">
                  Subscription Reward
                </h3>
              </div>
              <ul className="mt-6 space-y-4 text-[13px] sm:text-sm text-foreground/80">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
                  <span>
                    Receive <strong>3 Months FREE</strong> on any subscription of your choice
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
                  <span>
                    Can also be applied to your existing subscription as well
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* INFO BOXES */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Bonus for Your Referral Box */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-all duration-300 group-hover:scale-105">
                <Tag className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-bold text-foreground">Bonus for Your Referral</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your referral receives an additional{" "}
                  <strong className="text-foreground">₹500 OFF</strong> on their purchase when they
                  join through your unique referral link.
                </p>
              </div>
            </div>
          </div>

          {/* Real-Time Performance Tracking Box */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-brand/20 bg-brand/10 text-brand transition-all duration-300 group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-bold text-foreground">Real-Time Performance Tracking</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  All referral commissions are tracked transparently through your{" "}
                  <strong className="text-foreground">unique referral link</strong>. Every registered
                  referrer receives a personalized tracking link, allowing you to monitor referrals
                  and earnings in real time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-foreground/80">
          <InfinityIcon className="h-5 w-5 text-brand animate-pulse" />
          <span>No limits. The more you refer, the more you earn.</span>
        </div>

        <div className="mt-12 text-center">
          <h3 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to <span className="text-brand">Start Earning?</span>
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Fill out the form below to register as a referrer and get your unique tracking link and promotional content.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/referral"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-md transition hover:bg-primary/95"
            >
              Register & Get My Link
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
