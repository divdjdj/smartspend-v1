"use client";

import { Lock, Gift, Users, Wallet } from "lucide-react";

export function WhyChooseUsSection() {
  const features = [
    { 
      icon: <Lock className="h-5 w-5" />, 
      title: "Own Account Activation", 
      desc: "Subscriptions are activated directly on your account — no shared logins or password sharing required.",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    { 
      icon: <Gift className="h-5 w-5" />, 
      title: "Promotional Campaigns", 
      desc: "We source official gift vouchers and campaign activations that you won't find anywhere else.",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
    },
    { 
      icon: <Users className="h-5 w-5" />, 
      title: "850+ Professionals Served", 
      desc: "Join thousands of designers, developers, creators, and businesses across India who trust us daily.",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    { 
      icon: <Wallet className="h-5 w-5" />, 
      title: "Save Thousands Monthly", 
      desc: "Get a minimum 50% discount on top-tier premium software compared to official retail rates.",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-background">
      <div className="absolute right-1/4 top-10 h-80 w-80 rounded-full bg-primary/5 blur-3xl opacity-50" />
      <div className="absolute left-1/4 bottom-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            Why Choose Us
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Reliable activation. <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Real savings.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Enjoy premium tools with absolute peace of mind. We provide authentic licenses, instant support, and guaranteed security.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 hover:bg-card/60"
            >
              {/* Subtle top indicator bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/30 to-emerald-500/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <div className={`grid h-11 w-11 place-items-center rounded-xl border ${f.color} shadow-sm transition-all duration-300 group-hover:scale-105`}>
                {f.icon}
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">{f.title}</h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
