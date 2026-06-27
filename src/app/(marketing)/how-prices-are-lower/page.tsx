import { MessageCircle, Gift, Mail, Rocket, LifeBuoy, Sparkles, Globe, Ticket, CheckCircle2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/marketing/layout/site-chrome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Prices Are Lower & How Activation Works — SpendSmart Subscriptions",
  description: "Learn how we secure premium subscriptions at discounted prices and how our simple email/voucher-based activation process works.",
  openGraph: {
    title: "Pricing Transparency & Activations — SpendSmart Subscriptions",
    description: "Learn about regional arbitrage, promotional campaigns, and our 3-step activation process.",
  },
};

const POINTS = [
  {
    icon: Ticket,
    title: "Promotional Campaigns",
    desc: "Platforms run official promotional campaigns and distributor partner offers that distribute high-value gift vouchers.",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Globe,
    title: "Regional Arbitrage",
    desc: "Software pricing is adjusted regionally to fit purchasing power. We safely source and activate these local promotions.",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: CheckCircle2,
    title: "100% Legitimate Activation",
    desc: "Every subscription is activated officially on your personal email and account without policy violations.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
];

const STEPS = [
  {
    icon: Gift,
    title: "Receive Your Activation Details",
    desc: [
      "Once your subscription is confirmed, you will either receive an activation gift voucher link or be asked to share your email ID, depending on the subscription."
    ],
    color: "hover:border-purple-500/30 hover:shadow-purple-500/5",
    iconColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Mail,
    title: "Activate Your Subscription",
    desc: [
      "Gift Voucher Activation: You will receive an activation link along with simple instructions. Just follow the steps provided and redeem the voucher on the respective platform — in most cases, it only takes a few clicks.",
      "Email-Based Activation: For certain subscriptions, you only need to share your email ID, and our team will complete the activation for you."
    ],
    color: "hover:border-blue-500/30 hover:shadow-blue-500/5",
    iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Rocket,
    title: "Start Using Your Subscription",
    desc: [
      "Once activated, you can immediately access and enjoy all the benefits of your subscription."
    ],
    color: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
    iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function HowPricesAreLowerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* SECTION 1: HOW OUR PRICES ARE LOWER */}
        <section className="relative overflow-hidden mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Background Glows */}
          <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-40 pointer-events-none" />
          <div className="absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl opacity-30 pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Pricing Transparency
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
              How Our Prices <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">Are Lower?</span>
            </h1>
            <p className="mx-auto mt-5 text-base text-muted-foreground sm:text-lg">
              We secure subscriptions at discounted rates by leveraging official promotional campaigns, regional pricing differences, and legitimate partner channels.
            </p>
          </div>
 
          <div className="overflow-hidden rounded-3xl border border-border/40 bg-card/25 backdrop-blur-md p-8 sm:p-12 shadow-xl shadow-primary/5 relative z-10">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left side description */}
              <div className="lg:col-span-6 space-y-6">
                <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  Passing the savings directly to you.
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Many leading subscription providers run promotional campaigns and special events where official gift vouchers are distributed. Additionally, subscription pricing often varies across different regions, countries, and markets.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  By having access to these opportunities and making use of these legitimate offers, we are able to secure subscriptions at discounted rates and pass those savings directly to our customers. This allows us to provide official subscriptions at significant savings.
                </p>
              </div>
 
              {/* Right side checkmarks */}
              <div className="lg:col-span-6 space-y-5">
                {POINTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.title}
                      className="flex gap-4 p-5 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/10 hover:bg-card/70"
                    >
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${p.color}`}>
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
        </section>
 
        {/* SECTION 2: HOW ACTIVATIONS WORK */}
        <section className="border-t border-border bg-secondary/20 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur mb-5">
                <Sparkles className="h-3.5 w-3.5" /> Activation Guide
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
                How Activation <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">Works</span>
              </h2>
              <p className="mx-auto mt-5 text-base text-muted-foreground sm:text-lg">
                Getting started is simple. Once your subscription is confirmed, activation happens securely via official gift vouchers or email invitation, directly on your personal account.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div 
                  key={s.title} 
                  className={`group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${s.color} flex flex-col justify-between`}
                >
                  {/* Subtle top indicator bar on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${s.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${s.iconColor} shadow-sm transition-all duration-300 group-hover:scale-110`}>
                        <s.icon className="h-5 w-5" />
                      </div>
                      <div className={`text-xs font-bold tracking-wider bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                        STEP {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                    <div className="mt-2.5 space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {s.desc.map((pText, pIdx) => (
                        <p key={pIdx}>{pText}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NEED HELP CTA CARD */}
            <div className="mt-10 group relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/20">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col sm:flex-row items-start gap-4 w-full">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand transition-all duration-300 group-hover:scale-105">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">Need Help with Activation?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    If you face any issues during the activation process, our support team will be available to guide and assist you at every step and ensure a smooth experience.
                  </p>
                </div>
                <a
                  href="https://wa.me/918770066995?text=Hi%2C%20I%27m%20looking%20for%20a%20subscription%20from%20your%20website.%20Could%20you%20please%20help%20me%3F"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 transition-all self-start sm:self-center"
                >
                  <MessageCircle className="h-4 w-4" /> Chat with our team
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
