"use client";
 
import { useState } from "react";
import { Phone, Mail, Clock, MessageCircle, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
 
export function ContactSection() {
  const [isBookCallOpen, setIsBookCallOpen] = useState(false);
  const [bookCallSubmitted, setBookCallSubmitted] = useState(false);
 
  const contactMethods = [
    {
      icon: Phone,
      label: "Call Us",
      value: "+91 8770066995",
      href: "tel:918770066995",
      color: "hover:border-blue-500/30 hover:shadow-blue-500/5",
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Mail,
      label: "Email",
      value: "support@spendsmartsubscriptions.in",
      href: "mailto:support@spendsmartsubscriptions.in",
      color: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
      iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Mon–Sat, 10 AM – 8 PM IST",
      color: "hover:border-amber-500/30 hover:shadow-amber-500/5",
      iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      gradient: "from-amber-500 to-orange-500",
    },
  ];
 
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-28 bg-background">
      {/* Background decorations */}
      <div className="absolute right-10 top-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute left-10 bottom-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl opacity-30 pointer-events-none" />
 
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
            Contact
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-4xl">
            Get In <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent font-extrabold">Touch</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Questions? Ready to save? We're one message away.
          </p>
        </div>
 
        {/* Contact Cards Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contactMethods.map((c) => {
            const inner = (
              <div className="flex flex-col items-start w-full">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${c.iconColor} shadow-sm transition-all duration-300 group-hover:scale-110`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                  {c.label}
                </div>
                <div className="mt-2 font-display text-lg font-bold text-foreground break-all transition-colors group-hover:text-primary">
                  {c.value}
                </div>
              </div>
            );
            const className = `group relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card to-card/50 p-6 shadow-elegant transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${c.color} block w-full text-left`;
            return c.href ? (
              <a key={c.label} href={c.href} className={className}>
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                {inner}
              </a>
            ) : (
              <div key={c.label} className={className}>
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                {inner}
              </div>
            );
          })}
        </div>
 
        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-8 h-12 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 cursor-pointer"
          >
            <a
              href="https://wa.me/918770066995?text=Hi%2C%20I%27m%20looking%20for%20a%20subscription%20from%20your%20website.%20Could%20you%20please%20help%20me%3F"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4.5 w-4.5 fill-current" />
              Chat with us on WhatsApp
            </a>
          </Button>
 
          <Button
            onClick={() => setIsBookCallOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 h-12 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:opacity-95 transition-all duration-300 border-0 cursor-pointer"
          >
            <Phone className="h-4 w-4 text-white fill-none" />
            Book a call
          </Button>
        </div>
      </div>
 
      {/* Book a Call Modal Dialog */}
      <Dialog 
        open={isBookCallOpen} 
        onOpenChange={(open) => {
          setIsBookCallOpen(open);
          if (!open) {
            setBookCallSubmitted(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display text-center">Book a Call</DialogTitle>
          </DialogHeader>
          
          {bookCallSubmitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center shadow-soft">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-foreground">Booking Scheduled!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Your call has been scheduled successfully. Our team will contact you at your preferred time.
              </p>
            </div>
          ) : (
            <BookCallForm onSuccess={() => setBookCallSubmitted(true)} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
 
const TIME_SLOTS = [
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
];

function BookCallForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    date: "",
    time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
 
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = formData.name.trim();
    const mobile = formData.mobile.trim();
    const date = formData.date;
    const time = formData.time.trim();
    const notes = formData.notes.trim();
 
    if (!name || !mobile || !date || !time) {
      toast.error("Please fill in all required fields.");
      return;
    }
 
    setSubmitting(true);
 
    try {
      const messageContent = `Preferred Date: ${date}, Preferred Time: ${time}. ` + (notes ? `Notes: ${notes}` : "");
      
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          subscription: "Call Booking",
          message: messageContent,
        }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        throw new Error(data.error || "Failed to book a call.");
      }
 
      toast.success("Call booking request saved successfully!");
      onSuccess();
 
      // Open WhatsApp link with prefilled call booking message
      const whatsappMsg =
        `Hi, I'd like to book a call.\n\n` +
        `*Name:* ${name}\n` +
        `*Mobile:* ${mobile}\n` +
        `*Preferred Date:* ${date}\n` +
        `*Preferred Time:* ${time}\n` +
        (notes ? `*Notes:* ${notes}\n` : "");
 
      window.open(`https://wa.me/918770066995?text=${encodeURIComponent(whatsappMsg)}`, "_blank");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-2">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Name <span className="text-brand font-bold">*</span>
        </label>
        <input
          name="name"
          required
          type="text"
          placeholder="Your name"
          maxLength={100}
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground placeholder:text-muted-foreground/45 focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all shadow-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Mobile Number <span className="text-brand font-bold">*</span>
        </label>
        <input
          name="mobile"
          required
          type="tel"
          placeholder="e.g. 9876543210"
          maxLength={20}
          value={formData.mobile}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground placeholder:text-muted-foreground/45 focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all shadow-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Preferred Date <span className="text-brand font-bold">*</span>
          </label>
          <input
            name="date"
            required
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Preferred Time <span className="text-brand font-bold">*</span>
          </label>
          <select
            name="time"
            required
            value={formData.time}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="" disabled className="text-muted-foreground bg-card">Select a time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot} className="bg-card text-foreground">
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          Tell us anything more (Optional)
        </label>
        <textarea
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="Topic of call, specific tools of interest..."
          value={formData.notes}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground placeholder:text-muted-foreground/45 focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all resize-none shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 mt-2 bg-gradient-brand hover:brightness-110 active:scale-[0.99] text-primary-foreground font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-card cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            Scheduling...
          </>
        ) : (
          "Book Call"
        )}
      </button>
    </form>
  );
}
