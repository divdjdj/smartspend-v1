"use client";

import { Sparkles, CheckCircle2, Globe, Ticket } from "lucide-react";

export function PricingTransparencySection() {
  const points = [
    {
      icon: Ticket,
      title: "Promotional Campaigns",
      desc: "Platforms run official promotional campaigns and distributor partner offers that distribute high-value gift vouchers.",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: Globe,
      title: "Regional Arbitrage",
      desc: "Software pricing is adjusted regionally to fit purchasing power. We safely source and activate these local promotions.",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: CheckCircle2,
      title: "100% Legitimate Activation",
      desc: "Every subscription is activated officially on your personal email and account without policy violations.",
      color: "text-amber-500 bg-amber-500/10",
    },
  ];

  return (
    <section id="why-lower-prices" className="relative overflow-hidden py-24 sm:py-28 bg-background">
      {/* Background Glows */}
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-40" />
      <div className="absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Pricing Transparency
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-4xl">
            How Are Our <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Prices Lower?</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            We bypass retail markups by leveraging official channels, promotional campaigns, and regional pricing differences.
          </p>
        </div>

        {/* Outer Card with Grid */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-border/40 bg-card/25 backdrop-blur-md p-8 sm:p-12 shadow-xl shadow-primary/5">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left side description */}
            <div className="lg:col-span-6 space-y-6">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Passing the savings directly to you.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Many leading subscription providers run promotional campaigns and special events where official gift vouchers are distributed. Additionally, subscription pricing often varies across different regions, countries, and markets.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By having access to these opportunities and making use of these legitimate offers, we are able to secure subscriptions at discounted rates and pass those savings directly to our customers. This allows us to provide official subscriptions at significant savings.
              </p>
            </div>

            {/* Right side checkmarks */}
            <div className="lg:col-span-6 space-y-5">
              {points.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="flex gap-4 p-5 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/10 hover:bg-card/70"
                  >
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${p.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold text-foreground">{p.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
