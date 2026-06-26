"use client";

import { Lock, Gift, Users, Wallet } from "lucide-react";

export function WhyChooseUsSection() {
  const features = [
    { 
      icon: Lock, 
      title: "Own Account Activation", 
      desc: "Subscriptions are activated directly on your account — no shared logins.",
      color: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
      iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      gradient: "from-emerald-500 to-teal-500",
    },
    { 
      icon: Gift, 
      title: "Gift Vouchers via campaigns", 
      desc: "Exclusive promotional rewards you won't find anywhere else.",
      color: "hover:border-blue-500/30 hover:shadow-blue-500/5",
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      gradient: "from-blue-500 to-indigo-500",
    },
    { 
      icon: Users, 
      title: "Trusted by 850+ Professionals", 
      desc: "Join thousands of happy customers across India.",
      color: "hover:border-amber-500/30 hover:shadow-amber-500/5",
      iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      gradient: "from-amber-500 to-orange-500",
    },
    { 
      icon: Wallet, 
      title: "Save Thousands Every Month", 
      desc: "Minimum 50% savings on every subscription, guaranteed.",
      color: "hover:border-purple-500/30 hover:shadow-purple-500/5",
      iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 bg-background">
      <div className="absolute right-1/4 top-10 h-80 w-80 rounded-full bg-primary/5 blur-3xl opacity-50" />
      <div className="absolute left-1/4 bottom-10 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            Why Choose Us?
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-4xl">
            Why Choose <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">Us?</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Authentic activations, real savings, and support that actually responds.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${f.color}`}
            >
              {/* Subtle top indicator bar on hover */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${f.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              
              <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${f.iconColor} shadow-sm transition-all duration-300 group-hover:scale-110`}>
                <f.icon className="h-5 w-5" />
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

