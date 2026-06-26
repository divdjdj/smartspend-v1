import { SiteHeader, SiteFooter } from "@/components/marketing/layout/site-chrome";
import { FaqItem } from "@/components/marketing/home/faq-item";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — SpendSmart Subscriptions",
  description: "Read our FAQs to learn about activation, renewals, safety, and legitimacy of our premium subscriptions.",
  openGraph: {
    title: "FAQs — SpendSmart Subscriptions",
    description: "Get answers to common questions about activations, renewals, and refunds.",
  },
};

const FAQS = [
  {
    q: "Are the subscriptions activated on my own account?",
    a: "Yes. In most cases the subscription is activated directly on your own existing account using your own email ID, so you continue with the same profile, settings, and saved data. There is no shared login and no need to hand over your password — you remain the sole owner of the subscription.",
  },
  {
    q: "How exactly does the activation process work?",
    a: "Once you confirm your order, activation happens in one of two ways. For voucher-based subscriptions, you receive an official gift voucher or redemption link to apply on your account by following the simple steps we share. For email-based subscriptions, you only share the email ID, and our team applies the official voucher and completes the activation for you.",
  },
  {
    q: "Do I need to create a new account or change my login?",
    a: "No. You can continue using the same account you already have with the platform — no new sign-up or password change is required. If you don't have an account on that platform yet, you can create one normally on the official website and we will activate the subscription on it.",
  },
  {
    q: "How long does activation usually take?",
    a: "Most activations are completed within a few minutes to a couple of hours after the required details are shared and payment is done. A few subscriptions may take slightly longer depending on the platform's redemption process, usually within the same working day. Our team keeps you updated until activation is confirmed.",
  },
  {
    q: "Why are your prices lower than the official website?",
    a: "We secure subscriptions through official promotional campaigns, regional pricing differences, partner offers, and gift voucher programs that the platforms themselves run. By making use of these legitimate offers, we lower the cost and pass the savings on to you — while you still receive the exact same official subscription and features.",
  },
  {
    q: "Are the subscriptions 100% genuine and official?",
    a: "Yes. Every subscription we deliver is the official subscription from the original platform, activated through approved methods such as official gift vouchers and authorised promotional programs. You get the same features, updates, and experience as someone who paid full price directly.",
  },
  {
    q: "Is this safe? Can my account get suspended?",
    a: "Activations are done only through legitimate, platform-approved methods, which is why your account stays safe and works normally. We never use methods that violate any platform's terms of service, and our team takes full responsibility to resolve the rare issue that may arise.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, bank transfer, and other commonly used payment methods in India. Once you confirm your order, our team shares the available payment options along with the exact amount, so everything stays clear and straightforward before you pay.",
  },
  {
    q: "Will my subscription stop working before the validity ends?",
    a: "No. Subscriptions activated through official gift vouchers and approved methods remain active for the full validity period of your plan — whether that is one month, three months, six months, or a year. In the rare event of any issue with an active subscription, our team is available to resolve it.",
  },
  {
    q: "What if I face an issue during or after activation?",
    a: "Our support team is available to guide you through any activation step and to help resolve any issue that may come up. If something does not work as expected after activation, simply reach out with the details and we will fix the issue, re-activate the subscription, or arrange a suitable replacement.",
  },
  {
    q: "What is your refund and replacement policy?",
    a: "If you cancel your order before the subscription is activated, a refund can be processed. Once the subscription has been successfully activated on your account, refunds are generally not possible, as the voucher has already been redeemed. However, in case of any activation-related issue, a problem in using the subscription, any validity-related concern, or any issue from our side that we are unable to resolve, our team will review the case and provide a fair replacement or alternative resolution wherever possible.",
  },
  {
    q: "Can I renew my subscription with you when it expires?",
    a: "Yes. When your current subscription is nearing expiry, simply reach out to us again and we will help you renew it at the same kind of discounted pricing. Many of our customers continue to renew with us regularly because the savings add up over time.",
  },
  {
    q: "How can I contact SpendSmart Subscriptions?",
    a: "You can reach us through our website, WhatsApp, email, Instagram, or any of our official channels. Our team responds quickly during working hours and is happy to help with any question about a subscription, pricing, activation, or after-sales support.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-hero py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Frequently Asked <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">Questions</span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg">
              Everything you need to know about our activations, legitimacy, validity, and renewal process.
            </p>
          </div>
        </section>

        {/* QUESTIONS GRID/ACCORDION */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
