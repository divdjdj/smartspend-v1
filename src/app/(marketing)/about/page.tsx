import { Users, Handshake, Sparkles, Target } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/marketing/layout/site-chrome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — SpendSmart Subscriptions",
  description: "Founded in 2023, SpendSmart Subscriptions helps people access premium subscriptions without paying full price.",
  openGraph: {
    title: "About SpendSmart Subscriptions",
    description: "Helping customers save more while enjoying the services they use every day.",
  },
};

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

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-gradient-hero py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              About <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Us</span>
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Stats Boxes at the top */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-12">
            {STATS.map((s) => (
              <div 
                key={s.label} 
                className={`group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${s.color}`}
              >
                {/* Subtle top indicator bar on hover */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${s.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                
                <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${s.iconColor} shadow-sm transition-all duration-300 group-hover:scale-110`}>
                  <s.icon className="h-5 w-5" />
                </div>
                
                <div className={`mt-5 font-display text-3xl font-black bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent tracking-tight`}>
                  {s.value}
                </div>
                
                <div className="mt-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Narrative Text & Mission Card centered below */}
          <div className="mx-auto max-w-5xl space-y-6 text-base leading-relaxed text-foreground/90">
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
            <div className="rounded-2xl border border-primary/30 bg-secondary/60 p-6 shadow-soft">
              <h2 className="font-display text-xl font-bold">Our Mission</h2>
              <p className="mt-2 text-muted-foreground">
                Make premium subscriptions accessible to everyone — without the premium price tag.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter hideWhatsAppBanner={true} hideFloatingSocials={true} />
    </div>
  );
}
