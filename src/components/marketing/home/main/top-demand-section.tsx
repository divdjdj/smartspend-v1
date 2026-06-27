"use client";
 
import { useState } from "react";
import { BadgePercent, Tag, BellRing, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ToolLogo } from "@/components/marketing/layout/tool-logo";
import { TOP_DEMAND_CATEGORIES } from "@/data/tools";
 
export function TopDemandSection() {

 
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative">
      <div className="text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
          Top Demanded Subscriptions
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Professional, AI &amp; Creative Tools
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          The exact stack today&apos;s professionals, creators and founders pay for — all in one place.
        </p>
      </div>
 
      <div className="mt-12 space-y-14">
        {TOP_DEMAND_CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <div className="mb-6 flex items-center gap-4">
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                {cat.title}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-border via-border/60 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {cat.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md relative"
                >

 
                  <div className={`flex h-20 w-20 items-center justify-center rounded-lg p-3 sm:h-24 sm:w-24 ${tool.slug === "github" ? "" : "bg-secondary/40"}`}>
                    <ToolLogo tool={tool} className="h-full w-full" />
                  </div>
                  <div className="text-center text-sm font-semibold text-foreground" title={tool.name}>
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
              ))}
            </div>
          </div>
        ))}
      </div>
 
      <div className="mt-12 flex justify-center">
        <Link
          href="/tools"
          className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-md transition hover:bg-primary/95"
        >
          <Plus className="h-5 w-5" />
          View all products
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
 
      <div className="mt-12 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 sm:px-6 sm:py-4 shadow-sm max-w-full">
          <BadgePercent className="h-8 w-8 text-primary shrink-0 sm:h-10 sm:w-10" />
          <span className="font-display text-lg font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Minimum <span className="text-primary">50% Savings</span> — Guaranteed
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-display text-sm font-semibold text-foreground sm:text-base">
          <span className="flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-primary" />
            Offer valid while subscription lasts
          </span>
          <span className="text-muted-foreground hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <BellRing className="h-4 w-4 text-primary" />
            First come, first serve basis
          </span>
        </div>
      </div>
 

    </section>
  );
}
