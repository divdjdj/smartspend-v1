'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingSocials } from "@/components/marketing/layout/floating-socials";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InquiryForm } from "@/components/marketing/home/main/inquiry-form";

export const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
  </svg>
);
 
const SpendSmartMark = ({ className = "h-full w-full" }: { className?: string }) => (
  <Image
    src="/logo.png"
    width={200}
    height={200}
    className={`${className} object-contain rounded-lg`} alt="SpendSmart logo" />
);
 
export function SiteHeader() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative flex h-16 items-center justify-between px-6 bg-background/90 backdrop-blur-md border border-border/10 rounded-2xl shadow-soft">
        <Link href="/" className="flex items-center gap-3" aria-label="SpendSmart Subscriptions">
          <span className="grid h-10 w-10 place-items-center">
            <SpendSmartMark />
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-foreground leading-none sm:text-lg">
            SpendSmart
            <span className="block text-[9px] uppercase tracking-widest text-primary font-bold mt-0.5 leading-none">
              Subscriptions
            </span>
          </span>
        </Link>
        
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/tools" className="hover:text-primary transition-colors">Subscriptions</Link>
          <Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
          <Link href="/referral" className="hover:text-primary transition-colors">Referral Program</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
        </nav>
 
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Navigation Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="rounded-full border-border px-4 h-9 text-xs font-semibold hover:bg-muted"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full border-border px-4 h-9 text-xs font-semibold hover:bg-muted"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button
              variant="default"
              onClick={() => setIsEnquiryOpen(true)}
              className="rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 border-0 px-4 h-9 text-xs font-semibold"
            >
              <span>Enquire Now</span>
            </Button>
            <ThemeToggle />
          
          </div>
 
          {/* Mobile Menu Trigger & Drawer */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between">
                <div className="flex flex-col gap-6">
                  <SheetHeader className="p-0 border-b border-border/40 pb-4">
                    <SheetTitle>
                      <Link href="/" className="flex items-center gap-2.5" aria-label="SpendSmart Subscriptions">
                        <span className="grid h-10 w-10 place-items-center">
                          <SpendSmartMark />
                        </span>
                        <span className="font-display text-base font-extrabold tracking-tight text-foreground">
                          SpendSmart
                          <span className="ml-1 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Subs</span>
                        </span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 text-base font-medium">
                    <Link href="/" className="hover:text-primary transition-colors py-1">Home</Link>
                    <Link href="/tools" className="hover:text-primary transition-colors py-1">Subscriptions</Link>
                    <Link href="/how-it-works" className="hover:text-primary transition-colors py-1">How It Works</Link>
                    <Link href="/referral" className="hover:text-primary transition-colors py-1">Referral Program</Link>
                    <Link href="/about" className="hover:text-primary transition-colors py-1">About Us</Link>
                  </nav>
                </div>
                <div className="flex flex-col gap-3 border-t border-border/40 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsEnquiryOpen(true)}
                    className="w-full rounded-full text-sm font-semibold hover:bg-muted"
                  >
                    <span>Enquire Now</span>
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      asChild
                      className="flex-1 rounded-full border-border text-sm font-semibold hover:bg-muted"
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      variant="default"
                      asChild
                      className="flex-1 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 border-0 text-sm font-semibold"
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <Dialog open={isEnquiryOpen} onOpenChange={setIsEnquiryOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display text-center">Submit an Enquiry</DialogTitle>
          </DialogHeader>
          <InquiryForm />
        </DialogContent>
      </Dialog>
    </header>
  );
}

export function SiteFooter() {
  return (
    <>
      <FloatingSocials />
      <footer className="border-t border-border bg-card text-foreground">
        {/* Top Banner Row */}
        <div className="border-b border-border/10 bg-soft/10 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-soft">
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-base font-bold text-foreground">
                  Join our WhatsApp community
                </p>
                <p className="text-xs text-muted-foreground">
                  Early drops, deal alerts, and member-only subscription offers.
                </p>
              </div>
            </div>
            <a
              href="https://chat.whatsapp.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:brightness-105 active:scale-[0.99] px-6 py-3 text-sm font-semibold text-white shadow-card transition-all duration-200"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              Join Community
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Brand Col */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center">
                  <SpendSmartMark />
                </span>
                <div className="text-left select-none">
                  <span className="block font-display font-extrabold text-xl tracking-tight text-foreground leading-none">
                    SpendSmart
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-primary font-bold mt-0.5 leading-none">
                    Subscriptions
                  </span>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Helping professionals, creators, and businesses access premium AI, productivity,
                and creative subscriptions at 50%+ lower prices through a seamless gift voucher
                activation process across India.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://wa.me/918770066995"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-[#25D366] text-white shadow-soft transition hover:opacity-90 hover:scale-105"
                >
                  <WhatsAppIcon className="h-5 w-5 fill-current" />
                </a>
                <a
                  href="mailto:support@spendsmartsubscriptions.in"
                  aria-label="Email us on Gmail"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-soft/40 border border-border/10 text-foreground shadow-soft transition hover:opacity-90 hover:scale-105"
                >
                  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
                    <path fill="#4285F4" d="M44 35.5V13.6c0-1.5-1.2-2.6-2.6-2.6h-1.7L24 22 8.3 11H6.6C5.2 11 4 12.1 4 13.6v21.9C4 37 5.2 38 6.6 38H12V21.8l12 8.7 12-8.7V38h5.4c1.4 0 2.6-1 2.6-2.5z"/>
                    <path fill="#34A853" d="M12 38V21.8L4 15.8v19.7C4 37 5.2 38 6.6 38H12z"/>
                    <path fill="#FBBC04" d="M36 38h5.4c1.4 0 2.6-1 2.6-2.5V15.8l-8 6V38z"/>
                    <path fill="#EA4335" d="M44 13.6c0-1.5-1.2-2.6-2.6-2.6h-1.7L24 22 8.3 11H6.6C5.2 11 4 12.1 4 13.6v2.2l8 6 12 8.7 12-8.7 8-6v-2.2z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links Col */}
            <div className="lg:col-span-3 lg:col-start-7">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-primary border-b border-border/10 pb-2 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/tools" className="text-sm text-muted-foreground hover:text-primary transition-colors">Subscriptions</Link></li>
                <li><Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link href="/referral" className="text-sm text-muted-foreground hover:text-primary transition-colors">Referral Program</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Reach Us Col */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-primary border-b border-border/10 pb-2 mb-4">Reach Us</h3>
              <ul className="space-y-3.5 text-sm text-muted-foreground">
                <li><a href="tel:918770066995" className="hover:text-primary transition-colors font-semibold text-foreground">+91 8770066995</a></li>
                <li><a href="mailto:support@spendsmartsubscriptions.in" className="hover:text-primary transition-colors break-all">support@spendsmartsubscriptions.in</a></li>
                <li className="text-xs">Mon–Sat, 10 AM – 8 PM IST</li>
                <li className="text-xs text-muted-foreground/60">SpendSmartSubscriptions.in &bull; Safe & Secure</li>
              </ul>
            </div>
          </div>

          {/* Copyright Subfooter */}
          <div className="mt-16 pt-8 border-t border-border/15 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground/60 gap-4">
            <p>© {new Date().getFullYear()} SpendSmart Subscriptions. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
