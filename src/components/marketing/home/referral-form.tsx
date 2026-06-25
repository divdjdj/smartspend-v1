"use client";

import { useState } from "react";
import { ArrowRight, Copy, Check, Loader2, Sparkles, KeyRound, ExternalLink, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface RegistrationData {
  referralLink: string;
  code: string;
  loginCredentials: {
    username: string;
    email: string;
    password: string;
  };
}

export function ReferralForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regData, setRegData] = useState<RegistrationData | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim().slice(0, 100);
    const email = String(data.get("email") || "").trim().slice(0, 255);
    const phone = String(data.get("phone") || "").trim().slice(0, 20);
    const reward = String(data.get("reward") || "Cash Reward");
    const notes = String(data.get("notes") || "").trim().slice(0, 500);

    if (!name || !phone) {
      setError("Name and phone number are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/public/referral/register-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, reward, notes })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to register. Please try again.");
      }

      setRegData(json);
      setSubmitted(true);
      toast.success("Referral profile created successfully!");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(err instanceof Error ? err.message : "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!regData?.referralLink) return;
    navigator.clipboard.writeText(regData.referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!regData) return;
    const text = 
      `Hey! Check out SpentSmart to manage and optimize your premium subscriptions. ` +
      `Sign up using my referral link to get ₹500 OFF on your first purchase:\n\n` +
      `${regData.referralLink}`;
    window.open(`https://wa.me/${regData.loginCredentials.username}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (submitted && regData) {
    return (
      <div className="mt-8 border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center shadow-soft">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-foreground">Welcome to the Referral Program!</h3>
          <p className="text-xs text-muted-foreground">Your account has been created. Start sharing your link to earn cash!</p>
        </div>

        {/* Generated Invite Link Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Invite Link</label>
          <div className="flex items-center border border-border bg-background rounded-xl px-4 py-3 justify-between font-mono text-sm font-bold text-foreground">
            <span className="truncate mr-2">{regData.referralLink}</span>
            <button 
              onClick={handleCopyLink} 
              className="text-primary hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
              title="Copy Referral Link"
            >
              {copied ? <Check className="h-4.5 w-4.5 text-emerald-400" /> : <Copy className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Auto Generated Login Info */}
        <div className="border border-border bg-card/60 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center gap-2 font-bold text-xs text-muted-foreground uppercase tracking-wider">
            <KeyRound className="h-4 w-4 text-primary" /> Login Profile Created
          </div>
          <p className="text-xs text-muted-foreground">Log in with either your Mobile number or Email using these credentials:</p>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground block">Mobile / Username</span>
              <span className="font-mono font-bold text-foreground">{regData.loginCredentials.username}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Default Password</span>
              <span className="font-mono font-bold text-foreground">{regData.loginCredentials.password}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-soft transition-all cursor-pointer"
          >
            <MessageSquare className="h-4.5 w-4.5" /> Share on WhatsApp
          </button>
          <Link
            href="/login"
            className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-card border border-border hover:bg-soft text-foreground font-bold text-sm shadow-soft transition-all"
          >
            Log in to Dashboard <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/15 text-xs text-destructive font-semibold">
          {error}
        </div>
      )}

      <FormField label="Full Name" name="name" required placeholder="Your name" maxLength={100} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Phone / WhatsApp" name="phone" required placeholder="+91 …" maxLength={20} />
        <FormField label="Email (optional)" name="email" type="email" placeholder="you@example.com" maxLength={255} />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Preferred Reward
        </label>
        <select
          name="reward"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
        >
          <option>Cash Reward</option>
          <option>Subscription Reward (3 Months Free)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Anything we should know? (optional)
        </label>
        <textarea
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="Audience, network size, social handles…"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/95 disabled:opacity-50 cursor-pointer h-12"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Creating Profile...
          </>
        ) : (
          <>
            Register &amp; Get My Link <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Registration creates your credentials and generates your link instantly.
      </p>
    </form>
  );
}

function FormField({
  label,
  name,
  required,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1.5 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
      />
    </div>
  );
}
