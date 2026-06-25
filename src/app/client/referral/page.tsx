"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Gift, 
  Copy, 
  Wallet, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  ArrowRight, 
  MessageSquare,
  History,
  Send,
  UserCheck,
  TrendingUp} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReferralStats {
  clicks: number;
  signups: number;
  purchases: number;
  totalEarnings: number;
  cashEarned: number;
  availableBalance: number;
  claimedCash: number;
  pendingCash: number;
  subscriptionMonths: number;
  preferredRewardType: 'cash' | 'subscription';
}

interface ReferralItem {
  _id: string;
  referralCode: string;
  conversionStage: 'clicked' | 'visited' | 'signed_up' | 'purchased' | 'cancelled';
  clickedAt: string;
  signedUpAt?: string;
  purchasedAt?: string;
  prospect: {
    name: string;
    email: string;
  } | null;
  purchaseDetails: {
    grossAmount: number;
    referralBonusApplied: number;
    netAmount: number;
    referrerReward: number;
  } | null;
  referrerReward: {
    type: 'cash' | 'subscription';
    amount: number;
    status: 'calculated' | 'credited' | 'claimed';
  } | null;
}

interface HistoryItem {
  date: string;
  type: string;
  details: string;
  amount: number;
  months: number;
  status: 'pending' | 'completed' | 'failed';
}

interface ActiveSubscription {
  _id: string;
  packageName: string;
  endDate: string;
}

export default function ClientReferralPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "earnings" | "simulator">("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeSubs, setActiveSubs] = useState<ActiveSubscription[]>([]);
  
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [shareLinks, setShareLinks] = useState<{ referralLink: string; whatsapp: string; email: string; twitter: string } | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Forms states
  const [claimAmount, setClaimAmount] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [extSubId, setExtSubId] = useState("");
  const [extMonths, setExtMonths] = useState("3");
  const [extending, setExtending] = useState(false);

  // Simulator states
  const [simPackage, setSimPackage] = useState("Cursor Pro");
  const [simPrice, setSimPrice] = useState("4500");
  const [simulating, setSimulating] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get referral code info
      const codeRes = await fetch("/api/customer/referral/code");
      const codeData = await codeRes.json();
      if (codeData.referralCode) {
        setReferralCode(codeData.referralCode);
        
        // Fetch share links if code exists
        const linksRes = await fetch("/api/customer/referral/share-links");
        const linksData = await linksRes.json();
        if (linksData.shareLinks) {
          setShareLinks(linksData.shareLinks);
        }
      }

      // 2. Fetch stats
      const statsRes = await fetch("/api/customer/referral/stats");
      const statsData = await statsRes.json();
      if (statsData.stats) {
        setStats(statsData.stats);
      }

      // 3. Fetch referrals conversions
      const referralsRes = await fetch("/api/customer/referral/referrals");
      const referralsData = await referralsRes.json();
      if (referralsData.referrals) {
        setReferrals(referralsData.referrals);
      }

      // 4. Fetch history ledger
      const historyRes = await fetch("/api/customer/referral/history");
      const historyData = await historyRes.json();
      if (historyData.history) {
        setHistory(historyData.history);
      }

      // 5. Fetch active subscriptions for extension dropdown
      const rewardsRes = await fetch("/api/customer/referral/rewards");
      const rewardsData = await rewardsRes.json();
      if (rewardsData.activeSubscriptions) {
        setActiveSubs(rewardsData.activeSubscriptions);
        if (rewardsData.activeSubscriptions.length > 0) {
          setExtSubId(rewardsData.activeSubscriptions[0]._id);
        }
      }

    } catch (err) {
      console.error("Failed to load customer referral page data:", err);
      toast.error("Error loading referral records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchAllData();
    }, 0);
  }, [fetchAllData]);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const res = await fetch("/api/customer/referral/code/generate", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.code) {
        toast.success(`Referral code "${data.code}" generated successfully!`);
        setReferralCode(data.code);
        fetchAllData();
      } else {
        throw new Error(data.error || "Generation failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate code.");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareLinks?.referralLink) return;
    navigator.clipboard.writeText(shareLinks.referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount || parseFloat(claimAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch("/api/customer/referral/rewards/claim-cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: claimAmount })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Cash claimed successfully!");
        setClaimAmount("");
        fetchAllData();
      } else {
        throw new Error(data.error || "Claim failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not process claim.");
    } finally {
      setClaiming(false);
    }
  };

  const handleApplySubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extSubId) {
      toast.error("Please select a subscription to extend.");
      return;
    }
    setExtending(true);
    try {
      const res = await fetch("/api/customer/referral/rewards/apply-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: extSubId, months: extMonths })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Subscription extended successfully!");
        fetchAllData();
      } else {
        throw new Error(data.error || "Failed to extend subscription.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not apply extension.");
    } finally {
      setExtending(false);
    }
  };

  const handleSimulatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const res = await fetch("/api/customer/subscription/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageName: simPackage, grossAmount: simPrice })
      });
      const data = await res.json();
      if (res.ok) {
        const details = data.details;
        if (details.referralApplied) {
          toast.success(
            `Purchase Successful! Referral Applied: ₹${details.discountApplied} OFF. Net paid: ₹${details.netAmount}. Referrer rewarded!`,
            { duration: 6000 }
          );
        } else {
          toast.success(`Purchase Successful! Price paid: ₹${details.grossAmount}.`);
        }
        fetchAllData();
      } else {
        throw new Error(data.error || "Purchase simulation failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Simulation error.");
    } finally {
      setSimulating(false);
    }
  };

  const renderStageBadge = (stage: string) => {
    switch (stage) {
      case "clicked":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/10">Clicked</span>;
      case "visited":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/10">Visited</span>;
      case "signed_up":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/10">Signed Up</span>;
      case "purchased":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Purchased</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive border border-destructive/10">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">{stage}</span>;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/15 text-emerald-400">Completed</span>;
      case "pending":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/15 text-amber-400 animate-pulse">Pending</span>;
      case "failed":
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-destructive/15 text-destructive">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-muted text-muted-foreground">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <span>Loading referral records...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] bg-brand/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] bg-gold/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-gradient">
            Refer &amp; Earn Rewards
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share SpentSmart with your network. Earn cash and free months; friends get ₹500 off.
          </p>
        </div>
        <button
          onClick={fetchAllData}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/45 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-card/70 transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Data
        </button>
      </div>

      {/* Referral Code Generation Box */}
      {!referralCode ? (
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 shadow-elegant">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Generate Your Referral Code</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Activate your personalized invite link and start earning today.</p>
            </div>
          </div>
          <button
            onClick={handleGenerateCode}
            disabled={generatingCode}
            className="inline-flex h-12 items-center justify-center px-6 rounded-xl bg-gradient-brand text-primary-foreground font-bold hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {generatingCode ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                Generate Code <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 sm:p-8 relative z-10 shadow-elegant flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-brand-soft/20 px-2.5 py-0.5 text-xs font-bold text-brand">
              <Sparkles className="h-3 w-3" /> Active Invite Link
            </span>
            <h3 className="font-display font-extrabold text-2xl">Share the savings, pocket the cash!</h3>
            <p className="text-sm text-muted-foreground">Invite friends. When they buy, you get paid automatically.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Display Code */}
            <div className="flex items-center border border-border/15 bg-soft/30 rounded-xl px-4 py-3 justify-between w-full sm:w-64 font-mono font-bold text-foreground">
              <span>{referralCode}</span>
              <button 
                onClick={handleCopyLink} 
                className="text-brand hover:text-gold transition-colors ml-4 cursor-pointer"
                title="Copy Invite Link"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* WhatsApp Share */}
            {shareLinks && (
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white px-5 shadow-soft transition-all"
              >
                <MessageSquare className="h-4 w-4" /> Share on WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      {/* KPI Stats Panel */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Link Clicks</p>
              <h3 className="text-2xl font-bold font-display mt-2">{stats.clicks}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prospect Signups</p>
              <h3 className="text-2xl font-bold font-display mt-2">{stats.signups}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paid Conversions</p>
              <h3 className="text-2xl font-bold font-display mt-2">{stats.purchases}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between bg-gradient-to-r from-brand/5 to-transparent">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Earned</p>
              <h3 className="text-2xl font-bold font-display text-brand mt-2">₹{stats.totalEarnings}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-border/10 relative z-10">
        {(["dashboard", "earnings", "simulator"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm capitalize transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? "border-brand text-brand font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "simulator" ? "🧪 Purchase Simulator" : tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Referrals Conversion Funnel List */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden">
                <div className="p-5 border-b border-border/5 bg-soft/10">
                  <h3 className="font-bold text-base">Funnel Conversion List</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time status of referred friends who clicked or signed up.</p>
                </div>
                {referrals.length === 0 ? (
                  <div className="py-14 text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto opacity-20 text-brand mb-3" />
                    <p className="text-sm">No referrals tracked yet. Share your invite link to begin!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/15 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-6 py-4">Referred Customer</th>
                          <th className="px-6 py-4">Funnel Stage</th>
                          <th className="px-6 py-4">Last Event Date</th>
                          <th className="px-6 py-4 text-right">Earned Reward</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {referrals.map(item => (
                          <tr key={item._id} className="hover:bg-soft/5">
                            <td className="px-6 py-4">
                              {item.prospect ? (
                                <div>
                                  <div className="font-semibold text-foreground">{item.prospect.name}</div>
                                  <div className="text-xs text-muted-foreground">{item.prospect.email}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic font-mono">Anonymous click</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {renderStageBadge(item.conversionStage)}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {formatDate(item.clickedAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {item.referrerReward ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-brand">
                                    {item.referrerReward.type === 'cash' 
                                      ? `₹${item.referrerReward.amount}` 
                                      : `${item.referrerReward.amount} Free Months`}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground capitalize">
                                    Status: {item.referrerReward.status}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "earnings" && (
            <motion.div
              key="earnings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {/* Claim Reward Box */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-6 shadow-elegant flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Claim Cash Reward</h3>
                  </div>
                  
                  <div className="mt-5 space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Available Balance</span>
                    <h4 className="text-3xl font-black text-foreground">₹{stats?.availableBalance || 0}</h4>
                    <p className="text-[11px] text-muted-foreground mt-2">Cash is auto-credited to account balance instantly if set in configs.</p>
                  </div>
                </div>

                <form onSubmit={handleClaimCash} className="mt-6 space-y-3">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={claimAmount}
                      onChange={e => setClaimAmount(e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={claiming || !claimAmount || parseFloat(claimAmount) <= 0}
                    className="w-full h-11 bg-gradient-brand text-primary-foreground font-bold rounded-xl text-sm hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {claiming ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Withdraw Cash"}
                  </button>
                </form>
              </div>

              {/* Apply Free Months Box */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-6 shadow-elegant flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gold/10 text-brand flex items-center justify-center">
                      <Gift className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Apply Free Months</h3>
                  </div>
                  
                  <div className="mt-5 space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Free Months Available</span>
                    <h4 className="text-3xl font-black text-foreground">{stats?.subscriptionMonths || 0} Months</h4>
                    <p className="text-[11px] text-muted-foreground mt-2">Extend any active premium plan end date directly.</p>
                  </div>
                </div>

                {activeSubs.length === 0 ? (
                  <div className="mt-6 py-4 text-center text-xs text-muted-foreground border border-dashed border-border/10 rounded-xl">
                    No active subscriptions found to extend. Purchase a subscription in the Simulator first!
                  </div>
                ) : (
                  <form onSubmit={handleApplySubscription} className="mt-6 space-y-3">
                    <div>
                      <select
                        value={extSubId}
                        onChange={e => setExtSubId(e.target.value)}
                        className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                      >
                        {activeSubs.map(sub => (
                          <option key={sub._id} value={sub._id} className="bg-background text-foreground">
                            {sub.packageName} (Ends: {formatDate(sub.endDate)})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={extMonths}
                        onChange={e => setExtMonths(e.target.value)}
                        className="w-24 bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                      </select>
                      
                      <button
                        type="submit"
                        disabled={extending || (stats?.subscriptionMonths || 0) < parseInt(extMonths, 10)}
                        className="flex-1 h-11 bg-gradient-brand text-primary-foreground font-bold rounded-xl text-sm hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {extending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Apply Free Plan"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Transaction Ledger list */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant p-6 flex flex-col justify-between md:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-brand" />
                  <h3 className="font-bold">Transaction History Ledger</h3>
                </div>

                {history.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <p className="text-sm">No transaction entries recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[300px]">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Type</th>
                          <th className="py-2.5">Transaction Details</th>
                          <th className="py-2.5 text-right">Value Details</th>
                          <th className="py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/5">
                        {history.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-soft/5">
                            <td className="py-3 text-xs text-muted-foreground">{formatDate(tx.date)}</td>
                            <td className="py-3 font-semibold text-foreground">{tx.type}</td>
                            <td className="py-3 text-xs text-muted-foreground">{tx.details}</td>
                            <td className="py-3 text-right font-bold text-brand">
                              {tx.amount > 0 ? `₹${tx.amount}` : `${tx.months} Months`}
                            </td>
                            <td className="py-3 text-right">{renderStatusBadge(tx.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "simulator" && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-6 sm:p-8 shadow-elegant space-y-6"
            >
              <div className="space-y-2 border-b border-border/5 pb-4">
                <h3 className="font-display font-extrabold text-xl flex items-center gap-2">
                  🧪 E2E Referral &amp; Purchase Simulator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Test the threshold rewards logic. Simulate checking out. If you signed up with a referral code (i.e. you have a referrer linked), your first purchase gets a ₹500 discount automatically. The referrer gets credited instantly!
                </p>
              </div>

              <form onSubmit={handleSimulatePurchase} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Select Package to Buy
                    </label>
                    <select
                      value={simPackage}
                      onChange={e => {
                        setSimPackage(e.target.value);
                        setSimPrice(e.target.value === "Cursor Pro" ? "4500" : "2500");
                      }}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:outline-none cursor-pointer"
                    >
                      <option value="Cursor Pro" className="bg-background text-foreground">Cursor Pro (Original: ₹4,500)</option>
                      <option value="ChatGPT Plus" className="bg-background text-foreground">ChatGPT Plus (Original: ₹2,500)</option>
                      <option value="LinkedIn Sales Navigator" className="bg-background text-foreground">LinkedIn Sales Nav (Original: ₹6,500)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Simulation Price (Rupees)
                    </label>
                    <input
                      type="number"
                      value={simPrice}
                      onChange={e => setSimPrice(e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-soft/10 border border-border/5 rounded-xl p-4 text-xs text-muted-foreground space-y-2">
                  <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-brand" /> Threshold logic demo details:
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>If price is <strong>₹4,500</strong>: referred discount is ₹500 (Net price: ₹4,000). Since Net price ≥ ₹4,000, Referrer gets **₹1,000 cash**.</li>
                    <li>If price is <strong>₹2,500</strong>: referred discount is ₹500 (Net price: ₹2,000). Since Net price &lt; ₹4,000, Referrer gets **₹500 cash**.</li>
                    <li>Referrer reward is auto-credited to referrer account balance immediately based on current configurations.</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={simulating}
                  className="w-full h-12 bg-gradient-brand hover:brightness-110 active:scale-[0.99] text-primary-foreground font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft"
                >
                  {simulating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing Simulated Checkout...
                    </>
                  ) : (
                    <>
                      Simulate Checkout Purchase <Send className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
