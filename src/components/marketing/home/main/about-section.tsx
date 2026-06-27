"use client";

import { Sparkles, Users, Handshake, Target } from "lucide-react";

const STATS = [
  { 
    icon: Sparkles, 
    value: "80+", 
    label: "Subscriptions",
    color: "hover:border-purple-500/30 hover:shadow-purple-500/5",
    iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    gradient: "from-purple-500 to-pink-500"
  },
  { 
    icon: Users, 
    value: "850+", 
    label: "Customers Served",
    color: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
    iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-500"
  },
  { 
    icon: Handshake, 
    value: "150+", 
    label: "Resellers Network",
    color: "hover:border-blue-500/30 hover:shadow-blue-500/5",
    iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    gradient: "from-blue-500 to-indigo-500"
  },
  { 
    icon: Target, 
    value: "2023", 
    label: "Founded",
    color: "hover:border-amber-500/30 hover:shadow-amber-500/5",
    iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    gradient: "from-amber-500 to-orange-500"
  },
];

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-border/30">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
          Our Story
        </span>
        <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-4xl">
          About <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">Us</span>
        </h2>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-12">
        <div className="space-y-5 text-sm sm:text-base leading-relaxed text-muted-foreground/95 lg:col-span-7">
          <p>
            At <strong>SpendSmart Subscriptions</strong>, our journey started with a simple problem.
          </p>
          <p>
            Like many people, we wanted access to premium subscriptions for work, learning,
            entertainment, and productivity — but often found the official prices too
            expensive. While exploring different options, we discovered that many companies
            regularly offer special promotions, gifting programs, and regional pricing
            opportunities that can significantly reduce subscription costs.
          </p>
          <p>
            As we gained access to these opportunities through trusted and official channels,
            we realized that many others were facing the same challenge we once did. That
            sparked an idea: why not build a business that helps people access the same
            subscriptions at more affordable prices?
          </p>
          <p>
            Founded in <strong>2023</strong>, SpendSmart Subscriptions was created to make
            premium subscriptions more accessible and affordable. Since then, we have served{" "}
            <strong>850+ customers</strong> and built a network of{" "}
            <strong>150+ resellers</strong>, providing access to{" "}
            <strong>80+ popular AI, professional, productivity, learning, and entertainment
            subscriptions</strong>.
          </p>
          <p>
            Today, we help individuals and businesses save significantly on the subscriptions
            they use every day while enjoying a simple and seamless activation experience
            directly on their own accounts.
          </p>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-soft">
            <h3 className="font-display text-lg font-bold text-foreground">Our Mission</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Make premium subscriptions accessible to everyone — without the premium price tag.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-5 lg:content-start">
          {STATS.map((s) => (
            <div 
              key={s.label} 
              className={`group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-5 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${s.color}`}
            >
              {/* Subtle top indicator bar on hover */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${s.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              
              <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${s.iconColor} shadow-sm transition-all duration-300 group-hover:scale-110`}>
                <s.icon className="h-5 w-5" />
              </div>
              
              <div className={`mt-5 font-display text-2xl sm:text-3xl font-extrabold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent tracking-tight`}>
                {s.value}
              </div>
              
              <div className="mt-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

