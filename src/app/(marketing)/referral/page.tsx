import { Share2, Wallet, Gift, Tag, Infinity as InfinityIcon, Check, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/marketing/layout/site-chrome";
import { ReferralForm } from "@/components/marketing/home/referral-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referral Program — Share the Savings, Earn Rewards",
  description: "Refer friends to SpendSmart Subscriptions and earn up to ₹1,000 cash or 3 months free subscription. Your referral also gets ₹500 OFF.",
  openGraph: {
    title: "Refer & Earn — SpendSmart Subscriptions",
    description: "Share the savings. Earn cash or free subscription months for every referral.",
  },
};

export default function ReferralPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-hero py-12 sm:py-16">
          <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-brand-soft opacity-40 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gold opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand backdrop-blur sm:text-base">
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" /> Referral Program
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Share the Savings. <span className="bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent font-extrabold">Earn Rewards.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Enjoying your savings with SpendSmart? Refer your friends, colleagues, or network and
              get rewarded when they make a successful purchase.
            </p>
          </div>
        </section>

        {/* REWARDS SECTION */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand backdrop-blur sm:text-base">
              Rewards
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Choose Your Reward
            </h2>
            <p className="mt-2 text-muted-foreground">Pick the perk that suits you best.</p>
          </div>

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

          {/* Referral bonus & Performance tracking */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Referral bonus */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col sm:flex-row items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand transition-all duration-300 group-hover:scale-105">
                  <Tag className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground">Bonus for Your Referral</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Your referral receives an additional <strong className="text-foreground">₹500 OFF</strong> on
                    their purchase when they join through your unique referral link.
                  </p>
                </div>
              </div>
            </div>

            {/* Real-Time Performance Tracking */}
            <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col sm:flex-row items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand transition-all duration-300 group-hover:scale-105">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground">Real-Time Performance Tracking</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
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
        </section>

        {/* REGISTRATION FORM */}
        <section id="register" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-8 shadow-elegant transition-all duration-300 hover:shadow-xl hover:border-brand/20 sm:p-10">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/5 blur-2xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="relative text-center">
              <h2 className="font-display text-2xl font-black bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent sm:text-3xl">Register as a Referrer</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in the details below. Our team will share your unique referral link and track
                referrals transparently.
              </p>
            </div>
            <ReferralForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
