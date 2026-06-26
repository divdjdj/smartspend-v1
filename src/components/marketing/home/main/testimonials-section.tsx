"use client";

// Import local physical testimonials screenshots
import arunChat1 from "@/assets/testimonials/arun/arun-1.png";
import arunChat2 from "@/assets/testimonials/arun/arun-2.png";
import arunChat3 from "@/assets/testimonials/arun/arun-3.png";
import arunChat4 from "@/assets/testimonials/arun/arun-4.png";
import harshitChat1 from "@/assets/testimonials/harshit/harshit-1.png";
import harshitChat2 from "@/assets/testimonials/harshit/harshit-2.png";
import harshitChat3 from "@/assets/testimonials/harshit/harshit-3.png";
import chetaliChat1 from "@/assets/testimonials/chetali/chetali-1.png";
import chetaliChat2 from "@/assets/testimonials/chetali/chetali-2.png";
import chetaliChat3 from "@/assets/testimonials/chetali/chetali-3.png";
import { TestimonialCard } from "./testimonial-card";
import { MessageSquare } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "I had been paying full price for LinkedIn Sales Navigator for months. Got it here at less than half, and the activation was honestly quicker than I expected. Support actually replied when I had a question.",
    name: "Arun K.",
    role: "Mumbai",
    screenshots: [
      { src: arunChat1, alt: "Arun K. WhatsApp chat — initial enquiry" },
      { src: arunChat2, alt: "Arun K. WhatsApp chat — sharing email for activation" },
      { src: arunChat3, alt: "Arun K. WhatsApp chat — ₹2,500 payment confirmation" },
      { src: arunChat4, alt: "Arun K. WhatsApp chat — activation confirmed" },
    ],
  },
  {
    quote: "Honestly, I was a little skeptical at first about how something like this would actually work. But the whole thing turned out to be smooth and Gemini Pro has been running fine on my account ever since.",
    name: "Harshit G.",
    role: "Delhi",
    screenshots: [
      { src: harshitChat1, alt: "Harshit G. WhatsApp chat — Gemini Pro enquiry and pricing" },
      { src: harshitChat2, alt: "Harshit G. WhatsApp chat — activation confirmed" },
      { src: harshitChat3, alt: "Harshit G. WhatsApp chat — payment done and thank you" },
    ],
  },
  {
    quote: "I got to know about them at a meetup event and was quite eager to try. Got Cursor Pro through them, and compared to the official price, the savings were genuinely impressive.",
    name: "Chetali M.",
    role: "Hyderabad",
    screenshots: [
      { src: chetaliChat1, alt: "Chetali M. WhatsApp chat — Cursor Pro enquiry and pricing" },
      { src: chetaliChat2, alt: "Chetali M. WhatsApp chat — gift voucher and activation" },
      { src: chetaliChat3, alt: "Chetali M. WhatsApp chat — payment confirmed with thanks for savings" },
    ],
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-24 sm:py-28 bg-background">
      {/* Background decorations */}
      <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl opacity-40" />
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            <MessageSquare className="h-3.5 w-3.5" /> Loved by 850+ Professionals
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-4xl">
            What Our <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Customers Say</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Real customers. Real savings. Authenticity verified directly through WhatsApp chats.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
