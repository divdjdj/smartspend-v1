"use client";

import { Users, Zap, Handshake, Tag, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ToolsOrbit } from "@/components/marketing/home/tools-orbit";
import { WhatsAppIcon } from "@/components/marketing/layout/site-chrome";

const HERO_STATS = [
  { value: "850+", label: "Professionals Served", icon: Users, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { value: "1,500+", label: "Activations Done", icon: Zap, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { value: "150+", label: "Trusted Resellers", icon: Handshake, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { value: "50%+", label: "Guaranteed Savings", icon: Tag, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28">
      {/* Premium Background Decorative Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute left-10 top-20 h-96 w-96 rounded-full bg-primary/10 opacity-30 blur-3xl" />
      <div className="absolute right-10 bottom-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 opacity-25 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-8">
        {/* Left Side Content */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <span className="block font-display text-xs font-bold uppercase tracking-[0.25em] text-primary sm:text-sm">
            Stop overpaying for subscriptions
          </span>

          <h1 className="mt-3.5 font-display text-5xl sm:text-6.5xl lg:text-7.5xl xl:text-8.5xl font-extrabold leading-[1.08] tracking-tight text-foreground">
            Same Subscriptions.
            <br />
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
              Lower Prices.
            </span>
          </h1>

          <div className="mt-6 h-[2px] w-24 bg-gradient-to-r from-primary via-emerald-500 to-teal-500 rounded-full" />

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl lg:leading-relaxed">
            We help professionals and businesses access premium subscriptions across various categories, including Professional, AI, Design, Productivity and more, through official gift vouchers with 50%+ savings.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
            <Link
              href="/tools"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/35 hover:bg-primary/95 active:translate-y-0 sm:w-auto"
            >
              <Sparkles className="h-5 w-5 animate-pulse" />
              Explore All Products
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/918770066995?text=Hi%2C%20I%27m%20looking%20for%20a%20subscription%20from%20your%20website.%20Could%20you%20please%20help%20me%3F"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-7 py-4 text-base font-bold text-emerald-600 dark:text-emerald-400 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/10 active:translate-y-0 sm:w-auto"
            >
              <WhatsAppIcon className="h-5 w-5 fill-current text-emerald-500" />
              WhatsApp Us
            </a>
          </div>

          {/* Grid Stats */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-md hover:bg-card/50"
              >
                <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-primary/5 blur-xl transition-all duration-300 group-hover:scale-150" />
                <div className="flex items-center gap-2.5">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${s.color} transition-all duration-300 group-hover:scale-105`}>
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="font-display text-xl font-extrabold leading-none text-foreground tracking-tight sm:text-2.5xl">
                    {s.value}
                  </div>
                </div>
                <div className="mt-3.5 text-[10.5px] font-bold uppercase leading-tight tracking-[0.14em] text-muted-foreground/80">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Orbit (Interactive 3D Look) */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center mt-8 lg:mt-0">
          <div className="absolute -inset-4 rounded-full bg-primary/5 opacity-50 blur-3xl" aria-hidden />
          <div className="relative z-10 w-full transition-transform duration-500 hover:scale-[1.02]">
            <ToolsOrbit />
          </div>
        </div>
      </div>
    </section>
  );
}
