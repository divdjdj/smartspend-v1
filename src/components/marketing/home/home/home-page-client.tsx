"use client";

import { SiteHeader, SiteFooter } from "@/components/marketing/layout/site-chrome";
import { WishlistSection } from "@/components/marketing/home/wishlist-section";
import { HeroSection } from "@/components/marketing/home/main/hero-section";
import { MarqueeSection } from "@/components/marketing/home/main/marquee-section";
import { TopDemandSection } from "@/components/marketing/home/main/top-demand-section";
import { PricingTransparencySection } from "@/components/marketing/home/main/pricing-transparency-section";
import { HowActivationWorksSection } from "@/components/marketing/home/main/how-it-works-section";
import { WhyChooseUsSection } from "@/components/marketing/home/main/why-choose-us-section";
import { TestimonialsSection } from "@/components/marketing/home/main/testimonials-section";
import { ContactSection } from "@/components/marketing/home/main/contact-section";
import { ReferralProgramSection } from "@/components/marketing/home/main/referral-program-section";
import { AboutSection } from "@/components/marketing/home/main/about-section";

export function HomePageClient() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <HeroSection />

        {/* LOGO MARQUEE */}
        <MarqueeSection />

        {/* 1. TOP-DEMAND LOGO GRID */}
        <TopDemandSection />

        {/* 2. SUBSCRIPTION WISHLIST & WHATSAPP COMMUNITY */}
        <WishlistSection />

        {/* ABOUT US */}
        <AboutSection />

        {/* 4. PRICING TRANSPARENCY */}
        <PricingTransparencySection />

        {/* 5. HOW ACTIVATION WORKS */}
        <HowActivationWorksSection />

        {/* 6. CUSTOMER TESTIMONIALS */}
        <TestimonialsSection />

        {/* 7. REFERRAL PROGRAMME */}
        <ReferralProgramSection />

        {/* 8. WHY CHOOSE US */}
        <WhyChooseUsSection />

        {/* 9. REACH US */}
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
