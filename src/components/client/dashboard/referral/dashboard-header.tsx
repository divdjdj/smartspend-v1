"use client";

import { Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  fullName: string;
  totalEarnings: number;
}

export function DashboardHeader({ fullName, totalEarnings }: DashboardHeaderProps) {
  const scrollToShare = () => {
    const el = document.getElementById("share-widget");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10 w-full">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Welcome back, {fullName}!
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          You have earned <strong className="text-purple-400 font-semibold">₹{totalEarnings}</strong> so far. Keep sharing to unlock more rewards!
        </p>
      </div>
      <Button
        onClick={scrollToShare}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Share2 className="h-4 w-4" />
        Share Your Link
        <ArrowRight className="h-4 w-4 ml-1 opacity-70" />
      </Button>
    </div>
  );
}
