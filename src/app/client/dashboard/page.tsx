"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Import new modular components
import { DashboardHeader } from "@/components/client/dashboard/referral/dashboard-header";
import { ReferralKPIs } from "@/components/client/dashboard/referral/referral-kpis";
import { PerformanceChart } from "@/components/client/dashboard/referral/performance-chart";
import { GrowthSuggestions } from "@/components/client/dashboard/referral/growth-suggestions";
import { QuickShareWidget } from "@/components/client/dashboard/referral/quick-share-widget";
import { GamificationProgress } from "@/components/client/dashboard/referral/gamification-progress";
import { RecentActivity } from "@/components/client/dashboard/referral/recent-activity";

export interface SubscriptionItem {
  _id?: string;
  packageId: string;
  packageName: string;
  billingCycle: string;
  price: number;
  discount: number;
  totalPrice: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
}

interface ConversionItem {
  _id: string;
  prospect_email: string;
  conversion_stage: 'clicked' | 'visited' | 'signed_up' | 'purchased';
  timeline: {
    clicked_at?: string;
    signed_up_at?: string;
    purchased_at?: string;
  };
  createdAt: string;
}

interface DashboardData {
  profile: {
    fullName: string;
    email: string;
    referralCode: string;
    accountBalance: number;
    createdAt: string;
  };
  stats: {
    activePlanName: string;
    daysRemaining: number;
    walletBalance: number;
    referredCount: number;
    referralClicks: number;
    referralSignups: number;
    referralPurchases: number;
  };
  // We keep the old interfaces here to not break the API fetch, even if we don't use them deeply on this specific view.
  activeSubscription: SubscriptionItem | null;
  conversions: ConversionItem[];
  billingHistory: SubscriptionItem[];
}

// Generate some mock chart data based on overall stats for visual representation
const generateMockChartData = (clicks: number, signups: number, purchases: number) => {
  // If no data, return empty array
  if (clicks === 0 && signups === 0 && purchases === 0) return [];
  
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // Distribute the totals somewhat randomly over the last 30 days
    const clickShare = i < 15 ? Math.floor((clicks / 30) * 1.5) : Math.floor((clicks / 30) * 0.5);
    const signupShare = i < 10 ? Math.floor((signups / 30) * 2) : Math.floor((signups / 30) * 0.2);
    const purchaseShare = i < 5 ? Math.floor((purchases / 30) * 3) : Math.floor((purchases / 30) * 0.1);
    
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: clickShare,
      signups: signupShare,
      purchases: purchaseShare
    });
  }
  return data;
};

// Generate mock activity based on actual stats for UI richness
const generateMockActivity = (clicks: number, signups: number, purchases: number) => {
  if (clicks === 0 && signups === 0 && purchases === 0) return [];

  const activities = [];
  let idCounter = 1

  if (purchases > 0) {
    activities.push({
      id: `act-${idCounter++}`,
      type: 'reward' as const,
      message: '₹500 reward unlocked from a successful referral purchase!',
      timestamp: '2 hours ago'
    });
    activities.push({
      id: `act-${idCounter++}`,
      type: 'purchase' as const,
      message: 'A referral upgraded to Premium.',
      timestamp: '2.5 hours ago'
    });
  }

  if (signups > 0) {
    activities.push({
      id: `act-${idCounter++}`,
      type: 'signup' as const,
      message: 'Someone just signed up using your link.',
      timestamp: '1 day ago'
    });
  }

  if (clicks > 0) {
    activities.push({
      id: `act-${idCounter++}`,
      type: 'click' as const,
      message: 'Your link received a new visitor.',
      timestamp: '1 day ago'
    });
  }

  return activities;
};

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/dashboard");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        throw new Error(json.error || "Failed to retrieve dashboard.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchDashboardData();
    }, 0);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 text-center text-muted-foreground bg-background">
        <CreditCard className="h-12 w-12 opacity-30 text-destructive mb-3" />
        <h4 className="font-semibold text-lg text-foreground">Failed to Load Dashboard</h4>
        <p className="text-sm max-w-sm mt-1">Please try refreshing or log back in.</p>
        <Button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border/15 text-foreground hover:bg-soft"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const { stats, profile } = data;
  
  // Calculate KPIs
  const totalEarnings = stats.walletBalance || 0;
  // Approximating pending rewards based on signups that haven't purchased
  const pendingSignups = Math.max(0, (stats.referralSignups || 0) - (stats.referralPurchases || 0));
  const pendingRewards = pendingSignups * 500; 
  const conversionRate = stats.referralClicks > 0 
    ? Math.round((stats.referralPurchases / stats.referralClicks) * 100) 
    : 0;

  const chartData = generateMockChartData(stats.referralClicks, stats.referralSignups, stats.referralPurchases);
  const recentActivities = generateMockActivity(stats.referralClicks, stats.referralSignups, stats.referralPurchases);

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 w-full">
        <DashboardHeader fullName={profile.fullName} totalEarnings={totalEarnings} />
        <Button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft shrink-0 self-end sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Top KPIs Row */}
      <ReferralKPIs 
        totalEarnings={totalEarnings} 
        pendingRewards={pendingRewards}
        conversionRate={conversionRate}
        totalNetwork={stats.referredCount || 0}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column (Performance & Analytics) - 70% width on large screens */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
          {/* Performance Chart */}
          <div className="flex-1">
            <PerformanceChart data={chartData} />
          </div>

          {/* AI Growth Suggestions */}
          <GrowthSuggestions 
            clicks={stats.referralClicks || 0} 
            signups={stats.referralSignups || 0} 
            purchases={stats.referralPurchases || 0} 
          />
        </div>

        {/* Right Column (Action Center & Gamification) - 30% width on large screens */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          {/* Share Widget */}
          <QuickShareWidget referralCode={profile.referralCode} />
          
          {/* Gamification Tier Progress */}
          <GamificationProgress totalNetwork={stats.referredCount || 0} />
          
          {/* Recent Activity Feed */}
          <RecentActivity activities={recentActivities} />
        </div>

      </div>
    </div>
  );
}