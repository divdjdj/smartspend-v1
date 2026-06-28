"use client";

import { CheckCircle2, AlertTriangle, Info, Sparkles } from "lucide-react";

interface GrowthSuggestionsProps {
  clicks: number;
  signups: number;
  purchases: number;
}

const getRecommendation = (clicks: number, signups: number, purchases: number) => {
  const clickToSignupRate = clicks > 0 ? (signups / clicks) * 100 : 0;
  const signupToPurchaseRate = signups > 0 ? (purchases / signups) * 100 : 0;

  if (clicks === 0) {
    return {
      title: "Launch Your Campaign 🚀",
      insight: "Your referral links haven't received any clicks yet. Let's generate some traffic!",
      advice: "Share your referral link on WhatsApp status, LinkedIn, or in active chat communities. Explicitly mentioning the ₹500 discount is a great hook!",
      type: "info"
    };
  }

  if (clickToSignupRate < 20) {
    return {
      title: "Optimize Signup Rate ✍️",
      insight: `Your link is getting clicks, but only ${Math.round(clickToSignupRate)}% are registering.`,
      advice: "Highlight the ₹500 discount clearly! Personal messages explaining the value of SpentSmart convert visitors to signups 3x better than bare links.",
      type: "warning"
    };
  }

  if (signups > 0 && signupToPurchaseRate < 30) {
    return {
      title: "Boost Premium Upgrades 💳",
      insight: `You have signed-up prospects, but only ${Math.round(signupToPurchaseRate)}% upgraded to paid subscriptions.`,
      advice: "Send a friendly nudge to your signups! Remind them that upgrading unlocks the full tracking platform and redeems their ₹500 coupon.",
      type: "warning"
    };
  }

  return {
    title: "Top Performer Funnel ⭐",
    insight: `Your funnel is highly optimized! Click-to-Signup: ${Math.round(clickToSignupRate)}% | Signup-to-Purchase: ${Math.round(signupToPurchaseRate)}%.`,
    advice: "Keep sharing! Post screenshots of your dashboard savings on X (Twitter), or share your link in newsletter community segments to scale up.",
    type: "success"
  };
};

export function GrowthSuggestions({ clicks, signups, purchases }: GrowthSuggestionsProps) {
  const rec = getRecommendation(clicks, signups, purchases);

  const getStyles = () => {
    switch (rec.type) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  const getIcon = () => {
    switch (rec.type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />;
      default: return <Info className="h-5 w-5 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-brand" /> AI Growth Coach
      </h3>
      
      <div className={`border rounded-2xl p-5 space-y-3 transition-all ${getStyles()}`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="space-y-1.5">
            <h6 className="font-bold text-sm text-foreground uppercase tracking-wider">{rec.title}</h6>
            <p className="text-xs text-foreground/90 font-medium leading-relaxed">{rec.insight}</p>
          </div>
        </div>
        <div className="text-[12px] text-foreground/80 border-t border-current/10 pt-3 leading-relaxed">
          <strong className="text-foreground">Action Plan: </strong>{rec.advice}
        </div>
      </div>
    </div>
  );
}
