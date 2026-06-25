"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  Share2, 
  Calendar, 
  Loader2, 
  RefreshCw, 
  Clock, 
  Copy, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox,
  UserCheck,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SubscriptionItem {
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
  };
  activeSubscription: SubscriptionItem | null;
  conversions: ConversionItem[];
  billingHistory: SubscriptionItem[];
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
    fetchDashboardData();
  }, []);

  const handleCopyLink = () => {
    if (!data?.profile?.referralCode) return;
    const appUrl = window.location.origin;
    const referralLink = `${appUrl}/ref/${data.profile.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!data?.profile?.referralCode) return;
    const appUrl = window.location.origin;
    const referralLink = `${appUrl}/ref/${data.profile.referralCode}`;
    const text = 
      `Hey! Check out SpentSmart to manage and optimize your premium subscriptions. ` +
      `Sign up using my link to get a ₹500 discount on your first subscription purchase:\n\n` +
      `${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const renderStageBadge = (stage: string) => {
    switch (stage) {
      case "purchased":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">Completed</Badge>;
      case "signed_up":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-medium">Signed Up</Badge>;
      case "visited":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">Visited Link</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border/10 text-[10px]">{stage}</Badge>;
    }
  };

  const renderSubStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-medium">Active</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border/10 text-[10px]">{status}</Badge>;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span>Loading your subscription dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 text-center text-muted-foreground bg-background">
        <CreditCard className="h-12 w-12 opacity-30 text-destructive mb-3" />
        <h4 className="font-semibold text-lg text-foreground">Failed to Load Dashboard</h4>
        <p className="text-sm max-w-sm mt-1">Please try refreshing or log back in to review your profile billing details.</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border/15 text-foreground hover:bg-soft"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[40%] h-[40%] bg-teal-mid/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Welcome back, {data.profile.fullName}!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Check your active subscriptions validity, monitor wallet rewards, and invite friends.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Active Subscription Name */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Plan</p>
            <h3 className="text-lg font-bold text-foreground mt-2 truncate max-w-[150px]">{data.stats.activePlanName}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* Days Remaining */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Days Remaining</p>
            <h3 className={`text-2xl font-bold font-display mt-2 ${data.stats.daysRemaining > 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {data.stats.daysRemaining} {data.stats.daysRemaining === 1 ? 'day' : 'days'}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Wallet rewards */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referral Wallet</p>
            <h3 className="text-2xl font-bold font-display text-purple-400 mt-2">₹{data.stats.walletBalance}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Referred Count */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Friends Referred</p>
            <h3 className="text-2xl font-bold font-display text-foreground mt-2">{data.stats.referredCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <Share2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Plan Details & Referral Invite Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Side: Active Plan and Billing history */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Plan Detail Card */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-brand" /> Active Subscription Details</h3>
            
            {data.activeSubscription ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-soft/20 border border-border/5 rounded-2xl p-5 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <span>Package Name</span>
                    <strong className="text-sm text-foreground block font-semibold">{data.activeSubscription.packageName}</strong>
                  </div>
                  <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-border/10 py-3 sm:py-0 sm:px-4">
                    <span>Billing Cycle / Price</span>
                    <strong className="text-sm text-foreground block font-semibold capitalize">{data.activeSubscription.billingCycle} (₹{data.activeSubscription.totalPrice})</strong>
                  </div>
                  <div className="space-y-1 sm:pl-4">
                    <span>Validity Range</span>
                    <strong className="text-sm text-foreground block font-mono">{formatDate(data.activeSubscription.startDate)} - {formatDate(data.activeSubscription.endDate)}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground bg-soft/10 p-3 rounded-xl">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Plan is verified and currently active.</span>
                  <Link href="/" className="text-brand hover:underline font-semibold flex items-center gap-0.5">Renew or Upgrade <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </div>
            ) : (
              <div className="bg-soft/15 border border-border/5 rounded-2xl p-8 text-center space-y-4">
                <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">No Active Plan Subscription</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">Activate professional access today at up to 50% discount rates.</p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-5 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  Explore Packages <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Billing Transaction History */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Calendar className="h-4 w-4 text-muted-foreground" /> Invoice & Subscription History</h3>
            
            <div className="border border-border/5 rounded-2xl overflow-hidden bg-soft/10">
              {data.billingHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground italic">No historical subscription payments recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/10 bg-soft/20 font-medium text-muted-foreground">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Package</th>
                        <th className="px-4 py-3">Billing</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5 text-foreground">
                      {data.billingHistory.map((billing, idx) => (
                        <tr key={idx} className="hover:bg-soft/5">
                          <td className="px-4 py-3 font-mono text-muted-foreground">{formatDate(billing.startDate)}</td>
                          <td className="px-4 py-3 font-semibold text-brand">{billing.packageName}</td>
                          <td className="px-4 py-3 capitalize">{billing.billingCycle}</td>
                          <td className="px-4 py-3">₹{billing.totalPrice}</td>
                          <td className="px-4 py-3 text-right">{renderSubStatusBadge(billing.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Referral Invite card & Referral Checklist */}
        <div className="lg:col-span-4 space-y-8">
          {/* Share Invitation widget */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-4 relative overflow-hidden">
            {/* Overlay glow */}
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand/10 blur-xl pointer-events-none" />

            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Share2 className="h-4 w-4 text-brand" /> Invite & Earn ₹500</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Share your referral link. Friends get <strong className="text-foreground">₹500 OFF</strong> on their first subscription checkout, and you earn cash rewards or free subscription months!
            </p>

            {data.profile.referralCode ? (
              <div className="space-y-3.5 pt-2">
                {/* Code display */}
                <div className="flex justify-between items-center bg-soft/20 border border-border/5 rounded-xl px-4 py-2.5 text-xs font-semibold">
                  <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Your Code</span>
                  <span className="font-mono text-foreground font-bold tracking-wider">{data.profile.referralCode}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="h-10 text-xs font-semibold rounded-xl border border-border/15 bg-card/45 hover:bg-card/75 text-foreground flex items-center justify-center gap-1.5 cursor-pointer shadow-soft transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="h-10 text-xs font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-border/20 rounded-2xl bg-soft/10 text-xs text-muted-foreground">
                <Sparkles className="h-6 w-6 text-brand/40 mx-auto mb-2" />
                Please generate a referral link in the <Link href="/client/referral" className="text-brand underline hover:text-brand-light">Referrals</Link> portal to start earning.
              </div>
            )}
          </div>

          {/* Referral Checklist progress tracker */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-5 shadow-elegant space-y-4">
            <div className="flex justify-between items-center border-b border-border/10 pb-3">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5"><UserCheck className="h-4 w-4 text-purple-400" /> Referred Friends</h4>
              <Link href="/client/referral" className="text-[10px] text-brand hover:underline flex items-center gap-0.5">Rewards Portal <ArrowRight className="h-3 w-3" /></Link>
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto">
              {data.conversions.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-10 italic">No referred signups yet. Share your link to get started!</div>
              ) : (
                data.conversions.map((conv, idx) => (
                  <div key={conv._id} className="flex justify-between items-start text-xs border-b border-border/5 pb-3.5 last:border-0 last:pb-0">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-semibold text-foreground truncate block">{conv.prospect_email}</span>
                      <span className="text-[9px] text-muted-foreground block font-mono">Invited on {formatDate(conv.createdAt)}</span>
                    </div>
                    <div className="shrink-0 pl-2">
                      {renderStageBadge(conv.conversion_stage)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}