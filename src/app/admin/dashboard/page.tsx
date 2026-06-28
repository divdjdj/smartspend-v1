"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Import modular components
import { AdminHeader } from "@/components/admin/dashboard/admin-header";
import { AdminKPIs } from "@/components/admin/dashboard/admin-kpis";
import { SystemPerformanceChart } from "@/components/admin/dashboard/system-performance-chart";
import { AdminGrowthSuggestions } from "@/components/admin/dashboard/admin-growth-suggestions";
import { TopReferrersLeaderboard } from "@/components/admin/dashboard/top-referrers-leaderboard";
import { GlobalFunnel } from "@/components/admin/dashboard/global-funnel";
import { AdminRecentActivity } from "@/components/admin/dashboard/admin-recent-activity";
import { CampaignControls } from "@/components/admin/dashboard/campaign-controls";

interface AdminKPIsData {
  activeCodes: number;
  clicks: number;
  signups: number;
  purchases: number;
  revenue: number;
  cashPaid: number;
  subscriptionMonths: number;
}

interface LeaderboardItem {
  referrerId: string;
  name: string;
  email: string;
  referralCode: string;
  earnings: number;
  conversionsCount: number;
  conversionRate: number;
}

interface RecentConversion {
  _id: string;
  referralCode: string;
  purchasedAt: string;
  amount: number;
  referrerReward: number;
  referrerRewardType: 'cash' | 'subscription';
  referrerName: string;
  prospectName: string;
}

// Generate mock historical chart data for the performance chart based on total KPIs
const generateMockChartData = (clicks: number, signups: number, purchases: number) => {
  if (clicks === 0 && signups === 0 && purchases === 0) return [];
  
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // Create an upward trend with some randomness
    const baseMultiplier = (30 - i) / 30; // 0 to 1
    
    const clickShare = Math.floor((clicks / 30) * (0.5 + baseMultiplier) + Math.random() * (clicks / 60));
    const signupShare = Math.floor((signups / 30) * (0.5 + baseMultiplier) + Math.random() * (signups / 60));
    const purchaseShare = Math.floor((purchases / 30) * (0.5 + baseMultiplier) + Math.random() * (purchases / 60));
    
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: Math.max(0, clickShare),
      signups: Math.max(0, signupShare),
      purchases: Math.max(0, purchaseShare)
    });
  }
  return data;
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  // Referral analytics state
  const [refKpis, setRefKpis] = useState<AdminKPIsData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([]);

  const fetchReferralAnalytics = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("/api/admin/referrals/analytics");
      const json = await res.json();
      if (json.success) {
        setRefKpis(json.kpis);
        setLeaderboard(json.leaderboard);
        setRecentConversions(json.recentConversions);
      } else {
        throw new Error(json.error || "Failed to load referral analytics.");
      }
    } catch (err) {
      console.error("Error loading referral analytics:", err);
      toast.error("Failed to sync referral metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchReferralAnalytics();
    });
  }, []);

  if (loading && !refKpis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span>Loading administration metrics...</span>
      </div>
    );
  }

  if (!refKpis && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 text-center text-muted-foreground bg-background">
        <Activity className="h-12 w-12 opacity-30 text-destructive mb-3 animate-pulse" />
        <h4 className="font-semibold text-lg text-foreground">Failed to Load Dashboard</h4>
        <p className="text-sm max-w-sm mt-1">Please check your network and authorization permissions before trying again.</p>
        <Button
          onClick={() => fetchReferralAnalytics(true)}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border/15 text-foreground hover:bg-soft"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!refKpis) return null; // Fallback

  const globalConversionRate = refKpis.clicks > 0 
    ? Math.round((refKpis.purchases / refKpis.clicks) * 100) 
    : 0;

  const chartData = generateMockChartData(refKpis.clicks, refKpis.signups, refKpis.purchases);
  
  const funnelData = [
    { name: 'Clicks', value: refKpis.clicks },
    { name: 'Signups', value: refKpis.signups },
    { name: 'Purchases', value: refKpis.purchases }
  ];

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Header */}
      <AdminHeader onRefresh={() => fetchReferralAnalytics(true)} isLoading={loading} />

      {/* KPI stats grid */}
      <AdminKPIs 
        totalRevenue={refKpis.revenue}
        totalRewardsPaid={refKpis.cashPaid}
        activePromoters={refKpis.activeCodes}
        conversionRate={globalConversionRate}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column (System Performance & Insights) - 70% width */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
          <div className="flex-1">
            <SystemPerformanceChart data={chartData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlobalFunnel data={funnelData} />
            <AdminGrowthSuggestions 
              globalClicks={refKpis.clicks}
              globalSignups={refKpis.signups}
              globalPurchases={refKpis.purchases}
              activePromoters={refKpis.activeCodes}
            />
          </div>
        </div>

        {/* Right Column (Leaderboard & Actions) - 30% width */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          <CampaignControls />
          
          <TopReferrersLeaderboard leaderboard={leaderboard} />
          
          <AdminRecentActivity conversions={recentConversions} />
        </div>

      </div>
    </div>
  );
}