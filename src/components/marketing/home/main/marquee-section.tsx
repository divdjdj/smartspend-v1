"use client";

import { MARQUEE_TOOLS } from "@/data/tools";

export function MarqueeSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 overflow-hidden">


      {/* Marquee Track container */}
      <div className="relative overflow-hidden py-6 bg-gradient-to-b from-card/10 via-card/30 to-transparent rounded-3xl border border-border/10 p-4 sm:p-6">
        {/* Left Side Fade Shadow */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-20 bg-gradient-to-r from-background via-background/30 to-transparent sm:w-32" />
        {/* Right Side Fade Shadow */}
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-20 bg-gradient-to-l from-background via-background/30 to-transparent sm:w-32" />

        {/* Single Scrolling Flow */}
        <div className="flex overflow-hidden select-none">
          <div className="flex w-max items-center gap-5 px-2 animate-marquee">
            {[...MARQUEE_TOOLS, ...MARQUEE_TOOLS, ...MARQUEE_TOOLS].map((t, i) => {
              let logoSrc = `https://www.google.com/s2/favicons?domain=${t.domain}&sz=128`;
              if (t.name === "Lead.CM" || t.name === "Textshift" || t.name === "Guidless Pro" || t.name === "Otter.ai") {
                if (t.logo && typeof t.logo === "object" && "src" in t.logo) {
                  logoSrc = t.logo.src;
                }
              }
              return (
                <div
                  key={`${t.name}-${i}`}
                  className="group flex shrink-0 items-center gap-3 rounded-full border border-border/50 bg-card/60 py-2.5 pl-3 pr-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:bg-card hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                  title={t.name}
                >
                  {/* Circular Logo Frame with white background to make brand logos look perfect */}
                  <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white p-1.5 shadow-md ring-1 ring-border/10 overflow-hidden">
                    <img
                      src={logoSrc}
                      alt={t.name}
                      loading="lazy"
                      className="h-full w-full object-contain object-center"
                      onError={(e) => {
                        // Fallback to simpleicons or a default fallback
                        (e.target as HTMLImageElement).src = `https://cdn.simpleicons.org/${t.slug || "google"}`;
                      }}
                    />
                  </div>
                  {/* Subscription Name */}
                  <span className="whitespace-nowrap text-xs font-bold tracking-tight text-foreground/80 transition-colors group-hover:text-foreground">
                    {t.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
