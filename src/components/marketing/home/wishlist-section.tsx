"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search, Send, Sparkles, X, Loader2, KeyRound, ExternalLink, MessageSquare, Copy } from "lucide-react";
import { ALL_TOOLS } from "@/data/tools";
import { ToolLogo } from "@/components/marketing/layout/tool-logo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/marketing/layout/site-chrome";

const WA_NUMBER = "918770066995";

const CATEGORY_LABELS: Record<string, string> = {
  Developer: "Developer Tools",
  Creative: "Design & Creative Tools",
  "Product/Marketing": "Product, Marketing & Growth",
  "Business/Operations": "Business & Operations",
  OTT: "OTT Platforms",
  Credits: "Platform Credits",
};

const CATEGORY_ORDER = [
  "Developer Tools",
  "Design & Creative Tools",
  "Product, Marketing & Growth",
  "Business & Operations",
  "OTT Platforms",
  "Platform Credits",
];

interface WishlistResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
  loginCredentials: {
    username: string;
    email: string;
    password: string;
  } | null;
}

export function WishlistSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseData, setResponseData] = useState<WishlistResponse | null>(null);

  const uniqueTools = useMemo(() => {
    const seen = new Set<string>();
    return ALL_TOOLS.filter((t) => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return uniqueTools;
    return uniqueTools.filter((t) => t.name.toLowerCase().includes(q));
  }, [uniqueTools, query]);

  const groupedFiltered = useMemo(() => {
    const groups: Record<string, typeof uniqueTools> = {};
    filtered.forEach((tool) => {
      const label = CATEGORY_LABELS[tool.category] || "Other Tools";
      if (!groups[label]) groups[label] = [];
      groups[label].push(tool);
    });
    // Sort tools inside each group
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => a.name.localeCompare(b.name));
    });
    // Return sorted entries as an array
    return Object.entries(groups).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a[0]);
      const idxB = CATEGORY_ORDER.indexOf(b[0]);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [filtered]);

  function toggle(name: string) {
    setPicked((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedOther = other.trim();

    if (!trimmedName || trimmedName.length > 80) {
      setError("Please enter your name (max 80 characters).");
      setLoading(false);
      return;
    }
    if (!/^[+0-9\s\-()]{7,20}$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number.");
      setLoading(false);
      return;
    }
    if (picked.length === 0 && !trimmedOther) {
      setError("Pick at least one subscription or tell us what you use.");
      setLoading(false);
      return;
    }
    if (trimmedOther.length > 300) {
      setError("Please keep the 'others' field under 300 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/public/wishlist/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          picked,
          other: trimmedOther
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit wishlist.");
      }

      setResponseData(json);
      setSubmitted(true);
      toast.success(json.message || "Wishlist submitted successfully!");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyPassword = () => {
    if (!responseData?.loginCredentials?.password) return;
    navigator.clipboard.writeText(responseData.loginCredentials.password);
    setCopied(true);
    toast.success("Password copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const lines = [
      `Hi, I'd like to share my subscription wishlist.`,
      ``,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      picked.length ? `From your list: ${picked.join(", ")}` : null,
      other.trim() ? `Others I use: ${other.trim()}` : null,
      ``,
      `Please let me know if you can get any of these at a discount.`,
    ].filter(Boolean) as string[];

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="wishlist"
      className="relative overflow-hidden border-y border-border/30 bg-secondary/20 py-20 sm:py-24"
    >
      {/* Background decorations */}
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl opacity-35 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 items-stretch">
          {/* LEFT COLUMN: WISHLIST FORM */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            {submitted ? (
              <div className="border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden h-full flex flex-col items-center justify-center text-center">
                {/* Glow accent */}
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

                <div className="space-y-3">
                  <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center shadow-soft">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-foreground">Wishlist Submitted!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Thank you for contacting us. Our team will be in touch shortly.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-soft transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-4.5 w-4.5" /> Share on WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-border/40 bg-card/45 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-primary/5 transition-all duration-300 h-full flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="space-y-4 mb-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5" /> Wishlist Directory
                    </span>
                    <h3 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl leading-tight">
                      Subscription Wishlist
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Tell us which AI, professional, creative, or developer subscriptions you pay for regularly. If we can source them at up to 50% discount, we will notify you first.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                        Your Name
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={80}
                        placeholder="e.g. Aditi Sharma"
                        className="mt-2.5 w-full rounded-2xl border border-border/50 bg-background/50 backdrop-blur px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                        WhatsApp / Phone
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={20}
                        placeholder="e.g. +91 98765 43210"
                        className="mt-2.5 w-full rounded-2xl border border-border/50 bg-background/50 backdrop-blur px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
                        required
                      />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                        Select Subscriptions Interested In
                      </span>
                      <Button
                        type="button"
                        onClick={() => setPickerOpen((v) => !v)}
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/85 px-4.5 py-2 text-xs font-bold text-foreground transition-all duration-200 hover:bg-accent/20 hover:border-primary/30"
                      >
                        <Plus className={`h-3.5 w-3.5 transition-transform duration-200 ${pickerOpen ? "rotate-45" : ""}`} />
                        {pickerOpen ? "Hide Directory" : "Browse Our List"}
                      </Button>
                    </div>

                    {/* Selected Tags list */}
                    {picked.length > 0 && (
                      <div className="flex flex-wrap gap-2 rounded-2xl border border-border/30 bg-background/30 p-3">
                        {picked.map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary animate-in fade-in zoom-in-95 duration-200"
                          >
                            {p === "Other" ? "Others" : p}
                            <Button
                              type="button"
                              onClick={() => toggle(p)}
                              aria-label={`Remove ${p}`}
                              className="rounded-full p-0.5 transition hover:bg-primary/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Collapsible search directory */}
                    {pickerOpen && (
                      <div className="rounded-2xl border border-border/40 bg-background/60 p-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                          <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search subscriptions (e.g. ChatGPT, Canva)..."
                            className="w-full rounded-xl border border-border/50 bg-card px-9 py-2.5 text-sm placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="mt-4 max-h-60 overflow-y-auto pr-1 space-y-4">
                          {groupedFiltered.map(([category, tools]) => (
                            <div key={category} className="space-y-1.5">
                              <div className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1.5 py-0.5 tracking-wider">
                                {category}
                              </div>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {tools.map((t) => {
                                  const active = picked.includes(t.name);
                                  return (
                                    <Button
                                      key={t.name}
                                      type="button"
                                      onClick={() => toggle(t.name)}
                                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition-all duration-200 ${
                                        active
                                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                                          : "border-border/40 bg-card text-foreground hover:bg-accent/15 hover:border-border/80"
                                      }`}
                                    >
                                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary/80 p-1">
                                        <ToolLogo tool={t} className="h-full w-full" />
                                      </span>
                                      <span className="flex-1 truncate text-foreground">{t.name}</span>
                                      {active && <Check className="h-4 w-4 shrink-0 text-primary animate-in zoom-in-75 duration-200" />}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          {/* "Other" Option button */}
                          <div className="space-y-1.5 border-t border-border/10 pt-3">
                            <div className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1.5 py-0.5 tracking-wider">
                              Other Options
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              <Button
                                type="button"
                                onClick={() => toggle("Other")}
                                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition-all duration-200 ${
                                  picked.includes("Other")
                                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                                    : "border-border/40 bg-card text-foreground hover:bg-accent/15 hover:border-border/80"
                                }`}
                              >
                                <span className="flex-1 truncate text-foreground">Others</span>
                                {picked.includes("Other") && <Check className="h-4 w-4 shrink-0 text-primary animate-in zoom-in-75 duration-200" />}
                              </Button>
                            </div>
                          </div>

                          {filtered.length === 0 && (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                              No matching subscriptions found.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <label className="block pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                        Let us know what you&apos;re looking for.
                      </span>
                      <textarea
                        value={other}
                        onChange={(e) => setOther(e.target.value)}
                        maxLength={300}
                        rows={2}
                        placeholder="e.g. Notion AI, Apple One, Audible, Claude Pro..."
                        className="mt-2.5 w-full resize-none rounded-2xl border border-border/50 bg-background/50 backdrop-blur px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
                      />
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-xs font-semibold text-rose-500 animate-in fade-in duration-200">
                      {error}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex flex-col items-center gap-4 border-t border-border/20 pt-6 sm:flex-row sm:justify-between">
                  <p className="text-xs text-muted-foreground/80 text-center sm:text-left">
                    We will try our best to source these at a discounted price.
                  </p>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Wishlist
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: WHATSAPP COMMUNITY CARD */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-card/30 to-emerald-950/10 backdrop-blur-xl p-8 flex flex-col justify-between h-full shadow-xl shadow-emerald-500/5 min-h-[380px] lg:min-h-0">
              {/* Subtle background grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#25d3660d_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_100%)] opacity-70 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500 dark:text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" /> Early Access &amp; Offers
                </span>
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Join Our <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-extrabold">WhatsApp Community</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Stay ahead of the curve. Get notified instantly about early drops, limited deal alerts, premium subscription slots, and member-only discounted subscription offers directly on your phone.
                </p>
              </div>

              <div className="relative z-10 mt-8 flex flex-col items-center gap-3">
                <a
                  href="https://chat.whatsapp.com/JV2dxX7Xyje4K8Wqn1TZKk"
                  target="_blank"
                  rel="noreferrer"
                  className="group w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <WhatsAppIcon className="transition-transform duration-300 group-hover:scale-110 h-5 w-5 fill-current" />
                  Join Community Now
                </a>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Free to Join &bull; Cancel Anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
