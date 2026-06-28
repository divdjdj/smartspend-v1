"use client";

import { DollarSign, Clock, Target, Users } from "lucide-react";

interface ReferralKPIsProps {
  totalEarnings: number;
  pendingRewards: number;
  conversionRate: number;
  totalNetwork: number;
}

export function ReferralKPIs({ totalEarnings, pendingRewards, conversionRate, totalNetwork }: ReferralKPIsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 w-full">
      {/* Total Earnings */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between transition-all hover:bg-card/40">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Earnings</p>
          <h3 className="text-2xl font-bold font-display text-purple-400 mt-2">₹{totalEarnings}</h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>

      {/* Pending Rewards */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between transition-all hover:bg-card/40">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Rewards</p>
          <h3 className="text-2xl font-bold font-display text-amber-400 mt-2">₹{pendingRewards}</h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between transition-all hover:bg-card/40">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
          <h3 className="text-2xl font-bold font-display text-emerald-400 mt-2">{conversionRate}%</h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <Target className="h-5 w-5" />
        </div>
      </div>

      {/* Total Network */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between transition-all hover:bg-card/40">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Network</p>
          <h3 className="text-2xl font-bold font-display text-foreground mt-2">{totalNetwork}</h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
          <Users className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
