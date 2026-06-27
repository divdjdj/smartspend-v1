"use client";
 
import { useMemo, useState } from "react";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/marketing/layout/site-chrome";
import { ALL_TOOLS, logoUrl } from "@/data/tools";
import { Tool } from "@/types";
import { LOGOS } from "@/data/logo-map";
 
const CATEGORIES = ["All", "Developer", "Creative", "Product/Marketing", "Business/Operations", "OTT", "Credits"] as const;
type Category = (typeof CATEGORIES)[number];
 
const CATEGORY_LABELS: Record<Category, string> = {
  All: "All",
  Developer: "Developer Tools",
  Creative: "Design & Creative Tools",
  "Product/Marketing": "Product, Marketing & Growth",
  "Business/Operations": "Business & Operations",
  OTT: "OTT Platforms",
  Credits: "Platform Credits",
};
 
const LOGO_OVERRIDES: Record<string, any> = {
  // Developer Tools
  "Firecrawl": "https://logos.hunter.io/firecrawl.dev",
  "Firecrawl Credits": "https://logos.hunter.io/firecrawl.dev",
  "Railway": "https://logos.hunter.io/railway.app",
  "Factory": "https://logos.hunter.io/factory.ai",
  "Warpbuild": "https://logos.hunter.io/warpbuild.com",
  "Bolt": "https://www.google.com/s2/favicons?domain=bolt.new&sz=128",
 
  // Design & Creative Tools
  "Adobe Creative Cloud": LOGOS["adobe-cc"],
  "Canva Pro": "https://logos.hunter.io/canva.com",
  "Canva Business + Leonardo AI": "https://logos.hunter.io/canva.com",
  "CapCut": "https://logos.hunter.io/capcut.com",
  "InVideo": "https://logos.hunter.io/invideo.io",
  "Gamma": "https://logos.hunter.io/gamma.app",
  "Descript": "https://logos.hunter.io/descript.com",
  "Leonardo AI": "https://logos.hunter.io/leonardo.ai",
 
  // Product Marketing
  "Customer.io": "https://logos.hunter.io/customer.io",
  "Mobbin Team": "https://logos.hunter.io/mobbin.com",
  "Guidless Pro": "https://logos.hunter.io/guideless.ai",
 
  // Business & Operations
  "Lead.CM": "https://www.google.com/s2/favicons?domain=leads.cm&sz=128",
  "TextShift": "https://www.google.com/s2/favicons?domain=textshift.org&sz=128",
 
  // OTT Platforms
  "Amazon Prime Video": "https://logos.hunter.io/primevideo.com",
  "JioHotstar": "https://logos.hunter.io/jiocinema.com",
  "SonyLIV": "https://upload.wikimedia.org/wikipedia/commons/f/f7/SonyLIV_2020.png",
  "ZEE 5": "https://logos.hunter.io/zee5.com",
 
  // Platform Credits
  "OpenAI Credits": "https://logos.hunter.io/openai.com",
  "AWS Credits": LOGOS["aws-credits"],
  "MongoDB Credits": "https://logos.hunter.io/mongodb.com",
  "Vapi Credits": "https://logos.hunter.io/vapi.ai",
  "Airtable Credits": "https://logos.hunter.io/airtable.com",
  "Render Credits": "https://logos.hunter.io/render.com",
  "Scalingo Credits": "https://logos.hunter.io/scalingo.com",
};
 
export function ToolsPageClient() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("All");

 
  const filtered = useMemo(() => {
    return ALL_TOOLS.filter((t) => {
      const matchesCat = cat === "All" || t.category === cat;
      const matchesQ = !query || t.name.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [query, cat]);
 
  const grouped = useMemo(() => {
    const groups: Record<Category, Tool[]> = {
      All: [],
      Developer: [],
      Creative: [],
      "Product/Marketing": [],
      "Business/Operations": [],
      OTT: [],
      Credits: [],
    };
 
    filtered.forEach((t) => {
      if (t.category in groups) {
        groups[t.category as Category].push(t);
      }
    });
 
    const orderedCategories = CATEGORIES.filter((c) => c !== "All");
    return orderedCategories
      .map((c) => ({
        category: c,
        tools: groups[c] || [],
      }))
      .filter((g) => g.tools.length > 0);
  }, [filtered]);
 
  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-secondary/10 py-16 sm:py-20">
          {/* Background Glow */}
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl opacity-40 pointer-events-none" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Direct Access &amp; Savings
            </span>
            <h1 className="mt-5 font-display text-lg font-extrabold tracking-tight text-foreground sm:text-xl lg:text-2xl max-w-xl leading-tight">
              Explore <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">80+ Most Demanded Subscriptions</span> Across Various Categories with Guaranteed Savings of <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">50% &amp; More</span>.
            </h1>
 
            {/* search */}
            <div className="relative mt-8 max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subscriptions by name…"
                className="h-12 w-full rounded-2xl border border-border/80 bg-card pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
 
            {/* categories */}
            <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-1">
              <div className="flex w-max gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    type="button"
                    className={`whitespace-nowrap rounded-full border px-4.5 py-2 text-sm font-semibold transition ${
                      cat === c
                        ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
 
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No subscriptions match your search.</p>
          ) : (
            <div className="space-y-16">
              {grouped.map(({ category, tools }) => (
                <div key={category} className="space-y-6">
                  {/* Category Title & Divider */}
                  <div className="flex items-center gap-4">
                    <h3 className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" />
                  </div>
 
                  {/* Category Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
                    {tools.map((t) => (
                      <ToolTile
                        key={`${t.name}-${t.category}`}
                        tool={t}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
 
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/20 bg-card p-8 text-center shadow-elegant">
            <h2 className="font-display text-2xl font-bold text-foreground">Don&apos;t see what you need?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We source many more subscriptions on request. Drop us a message.
            </p>
            <a
              href={`https://wa.me/918770066995?text=${encodeURIComponent("Hi, I'm looking for a subscription that isn't currently listed on your website. Could you please help me find it?")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/95 transition-colors"
            >
              Request a subscription
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
 

    </div>
  );
}
 
function AllSubscriptionsLogo({ tool, className = "h-8 w-8" }: { tool: Tool; className?: string }) {
  const [failed, setFailed] = useState(false);
 
  let primary: string | undefined = undefined;
  const override = LOGO_OVERRIDES[tool.name];
  if (override) {
    primary = typeof override === "object" && override !== null && "src" in override ? override.src : override;
  } else if (tool.logo) {
    primary = typeof tool.logo === "object" && tool.logo !== null && "src" in tool.logo ? tool.logo.src : tool.logo;
  } else if (tool.slug) {
    primary = logoUrl(tool);
  } else if (tool.domain) {
    primary = `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`;
  }
 
  if (!primary || failed) {
    return (
      <div
        className={`grid place-items-center rounded-md font-display text-[10px] font-extrabold uppercase tracking-tight text-white ${className}`}
        style={{ backgroundColor: `#${tool.color ?? "0A66C2"}` }}
        title={tool.name}
      >
        {tool.name
          .replace(/\b(Pro|Plus|Premium|Cloud|Credits|Business|Elements|Flow|Labs)\b/gi, "")
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)}
      </div>
    );
  }
 
  return (
    <div className={`grid place-items-center p-0.5 overflow-hidden ${className}`}>
      <img
        src={primary}
        alt={tool.name}
        loading="lazy"
        className="block h-full w-full object-contain object-center transition-transform"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
 
function ToolTile({
  tool,
}: {
  tool: Tool;
}) {
  return (
    <div
      className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md duration-200 relative"
    >
 
      <div className="flex h-20 w-20 items-center justify-center rounded-lg p-3 bg-secondary/40">
        <AllSubscriptionsLogo tool={tool} className="h-full w-full" />
      </div>
      <div className="text-center text-sm font-semibold text-foreground min-w-0 w-full truncate" title={tool.name}>
        {tool.name}
      </div>
      <a
        href={`https://wa.me/918770066995?text=${encodeURIComponent(`Hi, I'm looking for the following subscription(s): ${tool.name}. Could you please help me with the details?`)}`}
        target="_blank"
        rel="noreferrer"
        className="mt-auto inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-full border border-primary/20 bg-secondary px-2.5 py-1.5 text-[10px] font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground hover:border-transparent"
      >
        Get subscription details
        <ArrowRight className="h-3 w-3" />
      </a>
    </div>
  );
}
