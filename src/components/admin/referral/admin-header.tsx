"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminHeader({ onRefresh, isLoading }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 w-full">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Referral Command Center
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor system-wide referral metrics, manage active promoters, and optimize conversion funnels.
        </p>
      </div>
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft shrink-0 self-end sm:self-auto"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Syncing...' : 'Refresh Metrics'}
      </Button>
    </div>
  );
}
