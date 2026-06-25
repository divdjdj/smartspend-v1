"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Gift, ArrowRight, Loader2, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RefCodeLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code } = use(params);
  const uppercaseCode = code.toUpperCase();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [referrerName, setReferrerName] = useState("");
  const [discountAmount, setDiscountAmount] = useState(500);

  useEffect(() => {
    async function trackClickAndValidate() {
      try {
        // 1. Track the click (sets the cookie and logs conversion clicked stage)
        const clickRes = await fetch("/api/public/referral/track-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: uppercaseCode })
        });

        if (!clickRes.ok) {
          setStatus("error");
          return;
        }

        // 2. Fetch landing details
        const infoRes = await fetch(`/api/public/referral/${uppercaseCode}`);
        if (infoRes.ok) {
          const info = await infoRes.json();
          setReferrerName(info.referrer.name);
          setDiscountAmount(info.discountAmount);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Referral landing click tracking failed:", err);
        setStatus("error");
      }
    }

    trackClickAndValidate();
  }, [uppercaseCode]);

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-10 bg-card/25 border border-border/10 backdrop-blur-xl rounded-3xl p-8 shadow-elegant">
            <Loader2 className="h-10 w-10 animate-spin text-brand" />
            <h2 className="text-xl font-display font-bold">Activating Referral Link...</h2>
            <p className="text-sm text-muted-foreground">Verifying invitation code {uppercaseCode}</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-card/30 border border-destructive/15 backdrop-blur-xl rounded-3xl p-8 shadow-elegant text-center flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">Link Expired or Invalid</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              The referral code <span className="font-mono font-semibold text-destructive">{uppercaseCode}</span> does not exist or has been deactivated by the admin.
            </p>
            <Link 
              href="/" 
              className="mt-2 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold rounded-xl bg-card border border-border/20 text-foreground hover:bg-soft transition-all"
            >
              Go to Homepage
            </Link>
          </div>
        )}

        {status === "success" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card/25 border border-border/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-elegant relative overflow-hidden"
          >
            {/* Overlay glow */}
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-brand opacity-15 blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center gap-5">
              {/* Gift Badge */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-soft relative">
                <Gift className="h-8 w-8" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gold text-brand font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="h-3 w-3" />
                </span>
              </div>

              {/* Title & Invitation */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Referral Active
                </span>
                <h1 className="text-3xl font-display font-extrabold tracking-tight mt-2">
                  You&apos;re Invited to <span className="text-gradient">SpendSmart</span>
                </h1>
                {referrerName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Shared by <span className="text-foreground font-semibold">{referrerName}</span>
                  </p>
                )}
              </div>

              {/* Reward Highlights Card */}
              <div className="w-full bg-soft/20 border border-border/5 rounded-2xl p-5 my-2 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Signup Bonus</span>
                <span className="text-4xl font-display font-black text-foreground">₹{discountAmount} OFF</span>
                <span className="text-xs text-muted-foreground mt-1">Automatically deducted from your first subscription purchase.</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.push(`/signup?ref=${uppercaseCode}`)}
                className="w-full h-12 bg-gradient-brand hover:brightness-110 active:scale-[0.99] text-primary-foreground font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-card cursor-pointer"
              >
                Claim Your Discount <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mt-1">
                <span>Invited using code</span>
                <span className="font-mono font-bold text-foreground bg-soft/40 px-2 py-0.5 rounded border border-border/5">{uppercaseCode}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
