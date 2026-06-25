"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Testimonial } from "@/types";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/marketing/layout/site-chrome";

export function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const screenshots = t.screenshots ?? [];
  const total = screenshots.length;
  const current = screenshots[index];

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md hover:bg-card/60">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/30 to-emerald-500/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div>
        {/* Rating Stars */}
        <div className="flex gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 drop-shadow-sm" aria-hidden>
              <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
            </svg>
          ))}
        </div>

        {/* Quote text */}
        <p className="mt-5 text-sm leading-relaxed text-foreground/95 italic font-medium">
          &quot;{t.quote}&quot;
        </p>

        {/* Screenshot Previews */}
        {total > 0 && (
          <div className="mt-6">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366] fill-current" />
              WhatsApp Verified Chat
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {screenshots.map((s, i) => (
                <Button
                  key={i}
                  type="button"
                  onClick={() => openAt(i)}
                  className="group/thumb relative h-16 w-12 overflow-hidden rounded-xl border border-border/60 bg-muted/40 transition-all duration-300 hover:border-primary hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Open ${t.name} chat screenshot ${i + 1}`}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    className="h-full w-full object-cover object-top transition duration-300 group-hover/thumb:brightness-95"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Info Footing */}
      <div className="mt-6 border-t border-border/20 pt-4 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-bold text-foreground">{t.name}</div>
          <div className="text-xs text-muted-foreground">{t.role}</div>
        </div>
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" title="Verified Buyer" />
      </div>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed left-1/2 top-1/2 z-50 flex w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-3 outline-none"
          >
            <DialogPrimitive.Title className="sr-only">
              {t.name} — chat screenshot {index + 1} of {total}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {current?.alt}
            </DialogPrimitive.Description>

            <div className="flex items-center justify-between text-xs font-semibold text-white/90">
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                {index + 1} / {total}
              </span>
              <DialogPrimitive.Close
                aria-label="Close"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-white hover:text-white/95 backdrop-blur-md transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <X className="h-3.5 w-3.5" />
                Close
              </DialogPrimitive.Close>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
              {current && (
                <Image
                  src={current.src}
                  alt={current.alt}
                  className="h-auto max-h-[78vh] w-full object-contain"
                />
              )}
              {total > 1 && (
                <>
                  <Button
                    type="button"
                    onClick={prev}
                    aria-label="Previous screenshot"
                    className="absolute left-2.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-105 active:scale-95 focus:outline-none"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    onClick={next}
                    aria-label="Next screenshot"
                    className="absolute right-2.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-105 active:scale-95 focus:outline-none"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {total > 1 && (
              <div className="flex justify-center gap-1.5">
                {screenshots.map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to screenshot ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                  />
                ))}
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
