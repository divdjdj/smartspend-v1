"use client";

import { Sparkles, Gift, Mail, Rocket, LifeBuoy, MessageCircle } from "lucide-react";

export function HowActivationWorksSection() {
  const steps = [
    {
      icon: Gift,
      step: "01",
      title: "Subscription Confirmation",
      body: (
        <p>
          Once your subscription is confirmed, our team will explain the activation
          process, share the required details, and guide you through the next steps to
          ensure a smooth experience.
        </p>
      ),
      color: "hover:border-purple-500/30 hover:shadow-purple-500/5",
      iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Mail,
      step: "02",
      title: "Activate Your Subscription",
      body: (
        <p>
          All subscriptions are activated either through a gift voucher or by sharing
          your email ID, depending on the subscription. For gift voucher activations,
          simply follow the steps shared by our team. For email-based subscriptions,
          you only need to share your email ID, and our team will apply the gift
          voucher and complete the activation for you.
        </p>
      ),
      color: "hover:border-blue-500/30 hover:shadow-blue-500/5",
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Rocket,
      step: "03",
      title: "Start Using Your Subscription",
      body: (
        <p>
          Once activated, you can immediately verify your subscription validity, access
          all included features, and start enjoying the benefits of your subscription.
        </p>
      ),
      color: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
      iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section id="how-activation-works" className="relative overflow-hidden py-24 sm:py-28 bg-background border-t border-border/30">
      {/* Background Glows */}
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Activation Guide
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-4xl leading-tight">
            How Activation <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">Works</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Getting started is simple. Once your subscription is confirmed, activation happens securely via official gift vouchers or email invitation, directly on your personal account.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div 
              key={s.step} 
              className={`group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${s.color}`}
            >
              {/* Subtle top indicator bar on hover */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${s.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              
              <div className="flex items-center gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-lg border ${s.iconColor} shadow-sm transition-all duration-300 group-hover:scale-110`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className={`text-xs font-bold tracking-wider bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                  STEP {s.step}
                </div>
              </div>
              <h4 className="mt-4 font-display text-lg font-semibold text-foreground">{s.title}</h4>
              <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</div>
            </div>
          ))}
        </div>

        {/* NEED HELP CTA CARD */}
        <div className="mt-8 flex flex-col items-start gap-4 rounded-3xl border border-primary/20 bg-card p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20 sm:flex-row sm:items-center">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-base font-semibold text-foreground">Need Help?</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              If you face any issues during the activation process, our support team will be
              available to assist you at every step and ensure a smooth experience.
            </p>
          </div>
          <a
            href="https://wa.me/918770066995?text=Hi%2C%20I%27m%20looking%20for%20a%20subscription%20from%20your%20website.%20Could%20you%20please%20help%20me%3F"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Chat with our team
          </a>
        </div>
      </div>
    </section>
  );
}
