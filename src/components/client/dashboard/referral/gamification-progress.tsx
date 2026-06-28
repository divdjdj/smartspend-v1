"use client";

import { Trophy, Star, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GamificationProgressProps {
  totalNetwork: number;
}

export function GamificationProgress({ totalNetwork }: GamificationProgressProps) {
  // Define Gamification Tiers
  const tiers = [
    { name: "Starter", min: 0, max: 4, bonus: "₹500 per referral", icon: Star, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "Pro", min: 5, max: 19, bonus: "₹750 per referral", icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "Elite", min: 20, max: Infinity, bonus: "₹1000 per referral", icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/10" }
  ];

  const currentTierIndex = tiers.findIndex(t => totalNetwork >= t.min && totalNetwork <= t.max);
  const currentTier = tiers[currentTierIndex] || tiers[0];
  const nextTier = tiers[currentTierIndex + 1];

  const CurrentIcon = currentTier.icon;
  const progressPercentage = nextTier 
    ? ((totalNetwork - currentTier.min) / (nextTier.min - currentTier.min)) * 100 
    : 100;

  const referralsNeeded = nextTier ? nextTier.min - totalNetwork : 0;

  return (
    <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-brand" /> Referral Tier Status
        </h3>
        <Badge variant="outline" className={`${currentTier.bg} ${currentTier.color} border-current/20 text-[10px] uppercase font-bold tracking-wider`}>
          {currentTier.name} Tier
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full ${currentTier.bg} ${currentTier.color} flex items-center justify-center shrink-0`}>
          <CurrentIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current Perk</p>
          <p className="font-semibold text-sm text-foreground">{currentTier.bonus}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end text-xs">
          <span className="font-medium text-muted-foreground">
            {nextTier ? `${referralsNeeded} more to ${nextTier.name}` : 'Max Tier Reached!'}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{totalNetwork} / {nextTier ? nextTier.min : '∞'}</span>
        </div>
        <div className="h-2 w-full bg-soft/30 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-brand to-teal-mid`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
