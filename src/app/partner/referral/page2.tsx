"use client";

import { useEffect, useState, useCallback } from "react";
import {  
  Copy, 
  Wallet, 
  Check, 
  Sparkles,  
  RefreshCw, 
  Loader2, 
  MessageSquare,
  TrendingUp,
  UserCheck,
  Plus,
  Coins,
  History,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  X
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ReferralStats {
  sale: number;
  purchase: number;
  commission: number;
  cashEarned: number;
}

interface ReferralCode {
  _id: string;
  code: string;
  name: string;
  is_active: boolean;
  reward: {
    type: 'cash' | 'subscription';
    cashAmount: number;
    subscriptionMonths: number;
    referralBonus: number;
  };
  stats: {
    clicks: number;
    signups: number;
    purchases: number;
    revenue: number;
  };
}

interface ReferralConversion {
  _id: string;
  referralCode: string;
  conversionStage: 'clicked' | 'signed_up' | 'purchased' | 'cancelled';
  clickedAt: string;
  signedUpAt?: string;
  purchasedAt?: string;
  prospect: {
    name: string;
    email: string;
  } | null;
  referrerReward?: {
    type: 'cash' | 'subscription';
    amount: number;
    status: 'calculated' | 'pending' | 'credited' | 'rejected' | 'completed';
  } | null;
}

interface RewardLedger {
  totalEarned: number;
  cashEarned: number;
  availableBalance: number;
  claimedCash: number;
  pendingCash: number;
  subscriptionMonths: number;
  preferredRewardType: 'cash' | 'subscription';
  redemptions: Array<{
    _id?: string;
    type: 'cash_claim' | 'subscription_activation';
    amount: number;
    months: number;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
  }>;
}

interface ActiveSubscription {
  _id: string;
  packageName: string;
  endDate: string;
}

export default function ClientReferralPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "links" | "history">("overview");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<ReferralStats>({ sale: 0, purchase: 0, commission: 0, cashEarned: 0 });
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [conversions, setConversions] = useState<ReferralConversion[]>([]);
  const [ledger, setLedger] = useState<RewardLedger | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);
  const [shareLinks, setShareLinks] = useState<{ referralLink: string; whatsapp: string; email: string; twitter: string } | null>(null);
  
  const [generatingCode, setGeneratingCode] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Claim Modals
  const [showClaimCashModal, setShowClaimCashModal] = useState(false);
  const [claimAmount, setClaimAmount] = useState("");
  
  const [showApplySubModal, setShowApplySubModal] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [applySubMonths, setApplySubMonths] = useState("1");

  const [processingClaim, setProcessingClaim] = useState(false);

  const fetchAllData = useCallback(async (showLoading?: boolean | React.MouseEvent) => {
    if (showLoading === true || (showLoading && typeof showLoading === "object")) {
      setLoading(true);
    }
    try {
      // 1. Get referral profile stats
      const profileRes = await fetch("/api/partner/referral/profile");
      const profileData = await profileRes.json();
      if (profileData.stats) {
        setStats(profileData.stats);
      }

      // 2. Get referral codes (now enriched with stats)
      const codesRes = await fetch("/api/partner/referral/code");
      const codesData = await codesRes.json();
      if (codesData.referralCodes) {
        setCodes(codesData.referralCodes);
      }

      // 3. Get share links for the active code (or first)
      const linksRes = await fetch("/api/partner/referral/share-links");
      const linksData = await linksRes.json();
      if (linksData.shareLinks) {
        setShareLinks(linksData.shareLinks);
      }

      // 4. Get conversions (referral history)
      const referralsRes = await fetch("/api/partner/referral/referrals");
      const referralsData = await referralsRes.json();
      if (referralsData.success && referralsData.referrals) {
        setConversions(referralsData.referrals);
      }

      // 5. Get reward ledger & active subscriptions
      const rewardsRes = await fetch("/api/partner/referral/rewards");
      const rewardsData = await rewardsRes.json();
      if (rewardsData.success) {
        setLedger(rewardsData.ledger);
        setActiveSubscriptions(rewardsData.activeSubscriptions || []);
        if (rewardsData.activeSubscriptions?.length > 0) {
          setSelectedSubId(rewardsData.activeSubscriptions[0]._id);
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
    Promise.resolve().then(() => {
      fetchAllData(false);
    });
  }, [fetchAllData]);

  // Handle generating referral link
  const handleGenerateCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLinkName) {
      toast.error("Please provide a name for this referral link.");
      return;
    }
    setGeneratingCode(true);
    try {
      const res = await fetch("/api/partner/referral/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkName: newLinkName })
      });
      const data = await res.json();
      if (res.ok && data.referralCode) {
        toast.success(`Referral link "${data.referralCode.code}" generated successfully!`);
        setNewLinkName("");
        fetchAllData(true);
      } else {
        throw new Error(data.error || "Generation failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate code.");
    } finally {
      setGeneratingCode(false);
    }
  };

  // Handle toggling referral link active status
  const handleToggleCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/partner/referral/code/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Referral link status updated.");
        fetchAllData(true);
      } else {
        throw new Error(data.error || "Failed to update status.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  // Handle deleting a referral link
  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this referral link?")) return;
    try {
      const res = await fetch(`/api/partner/referral/code/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Referral link deleted successfully.");
        fetchAllData(true);
      } else {
        throw new Error(data.error || "Failed to delete link.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete link.");
    }
  };

  // Handle updating preferred reward type
  const handleUpdatePreference = async (newPreference: 'cash' | 'subscription') => {
    try {
      const res = await fetch("/api/partner/referral/rewards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredRewardType: newPreference })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Preferred reward method updated to ${newPreference === 'cash' ? 'Cash Withdrawal' : 'Subscription Extension'}.`);
        fetchAllData(true);
      } else {
        throw new Error(data.error || "Failed to update preference.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update reward preference.");
    }
  };

  // Handle cash claim submission
  const handleClaimCash = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(claimAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (ledger && amount > ledger.availableBalance) {
      toast.error("Insufficient available balance.");
      return;
    }

    setProcessingClaim(true);
    try {
      const res = await fetch("/api/partner/referral/rewards/claim-cash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Payout requested successfully!");
        setShowClaimCashModal(false);
        setClaimAmount("");
        fetchAllData(true);
      } else {
        throw new Error(data.error || "Claim failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payout request failed.");
    } finally {
      setProcessingClaim(false);
    }
  };

  // Handle subscription months application
  const handleApplySubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const months = parseInt(applySubMonths, 10);
    if (isNaN(months) || months <= 0) {
      toast.error("Please specify a valid number of months.");
      return;
    }
    if (!selectedSubId) {
      toast.error("Please select a subscription to extend.");
      return;
    }

    setProcessingClaim(true);
    try {
      const res = await fetch("/api/partner/referral/rewards/apply-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: selectedSubId, months })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Subscription extended successfully!");
        setShowApplySubModal(false);
        fetchAllData(true);
      } else {
        throw new Error(data.error || "Extension failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription application failed.");
    } finally {
      setProcessingClaim(false);
    }
  };

  const handleCopyLink = (code: string) => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${appUrl}/ref/${code}`;
    navigator.clipboard.writeText(link);
    setCopied(code);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleWhatsAppShareCode = (code: string) => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${appUrl}/ref/${code}`;
    const message = encodeURIComponent(`Save on your SpendSmart subscription using my referral link! Signup here: ${link}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading && codes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <span>Loading referral dashboard...</span>
      </div>
    );
  }

  const activeCode = codes.find(c => c.is_active) || codes[0];

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-gradient">
            Refer &amp; Earn Rewards
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Invite friends to SpendSmart. Share code, track conversions, and claim your payouts.
          </p>
        </div>
        <Button
          onClick={fetchAllData}
          variant="outline"
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/45 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-card/70 transition-all cursor-pointer shadow-soft h-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Data
        </Button>
      </div>

      {/* Share Box Banner */}
      {codes.length > 0 && (
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 sm:p-8 relative z-10 shadow-elegant flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-brand-soft/20 px-2.5 py-0.5 text-xs font-bold text-brand">
              <Sparkles className="h-3 w-3" /> Active Invite Link
            </span>
            <h3 className="font-display font-extrabold text-2xl">Invite friends, claim rewards!</h3>
            <p className="text-sm text-muted-foreground">Share your custom link. When friends purchase, you get paid automatically.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center border border-border/15 bg-soft/30 rounded-xl px-4 py-3 justify-between w-full sm:w-64 font-mono font-bold text-foreground">
              <span>{activeCode?.code}</span>
              <Button 
                onClick={() => handleCopyLink(activeCode?.code || "")} 
                variant="ghost"
                size="icon-xs"
                className="text-brand hover:text-gold hover:bg-transparent transition-colors ml-4 cursor-pointer"
                title="Copy Invite Link"
              >
                {copied === activeCode?.code ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {shareLinks ? (
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white px-5 shadow-soft transition-all"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </a>
            ) : (
              <Button
                onClick={() => handleWhatsAppShareCode(activeCode?.code || "")}
                variant="ghost"
                className="h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white hover:text-white font-bold px-5 shadow-soft transition-all"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </Button>
            )}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales Driven</p>
            <h3 className="text-2xl font-bold font-display mt-2 text-blue-400">₹{stats.sale}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Commissions</p>
            <h3 className="text-2xl font-bold font-display mt-2 text-purple-400">₹{stats.commission}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Ledger-specific Cash Balance */}
        <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex flex-col justify-between gap-3 bg-gradient-to-r from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Cash Balance</p>
              <h3 className="text-2xl font-bold font-display mt-2 text-emerald-400">₹{ledger?.availableBalance ?? 0}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <Button
            onClick={() => setShowClaimCashModal(true)}
            disabled={!ledger || ledger.availableBalance <= 0}
            variant="ghost"
            className="w-full h-8 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white hover:text-white rounded-lg transition-all"
          >
            Withdraw Payout
          </Button>
        </div>

        {/* Subscription Months balance */}
        <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex flex-col justify-between gap-3 bg-gradient-to-r from-brand/5 to-transparent">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Free Sub Months</p>
              <h3 className="text-2xl font-bold font-display text-brand mt-2">{(ledger?.subscriptionMonths ?? 0)} Months</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <Button
            onClick={() => setShowApplySubModal(true)}
            disabled={!ledger || ledger.subscriptionMonths <= 0 || activeSubscriptions.length === 0}
            className="w-full h-8 text-xs font-bold bg-brand hover:brightness-110 text-primary-foreground hover:text-primary-foreground rounded-lg transition-all"
          >
            Apply Free Months
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/10 relative z-10 overflow-x-auto">
        {(["overview", "links", "history"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm capitalize transition-all border-b-2 cursor-pointer shrink-0 outline-none ${
              activeTab === tab
                ? "border-brand text-brand font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "overview" && "Funnel Overview"}
            {tab === "links" && "Manage Links"}
            {tab === "history" && "Payouts & Redemptions"}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          
          {/* Tab 1: Funnel Overview / Recent Referrals */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* How it works */}
              <div className="bg-card/20 border border-border/10 rounded-2xl p-6 shadow-elegant grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold font-display text-lg shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Share Invite link</h4>
                    <p className="text-xs text-muted-foreground mt-1">Generate custom tracking links and share them with friends or networks.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-display text-lg shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Friends SignUp &amp; Purchase</h4>
                    <p className="text-xs text-muted-foreground mt-1">Friends get ₹500 off subscription on sign-up. When they subscribe, you earn commission.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-display text-lg shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Earn Payout Rewards</h4>
                    <p className="text-xs text-muted-foreground mt-1">Choose between cash withdrawals or free months of premium subscription extension.</p>
                  </div>
                </div>
              </div>

              {/* Preference Setting box */}
              {ledger && (
                <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand" /> Reward Payout Preferences</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Select how your referral commissions should accrue: Cash balance or Free Subscription months.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdatePreference('cash')}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all border ${
                        ledger.preferredRewardType === 'cash'
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-soft"
                          : "bg-soft/10 text-muted-foreground border-border/10 hover:text-foreground hover:bg-soft/20"
                      }`}
                    >
                      Accrue Cash (₹)
                    </Button>
                    <Button
                      onClick={() => handleUpdatePreference('subscription')}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all border ${
                        ledger.preferredRewardType === 'subscription'
                          ? "bg-brand text-primary-foreground border-brand shadow-soft"
                          : "bg-soft/10 text-muted-foreground border-border/10 hover:text-foreground hover:bg-soft/20"
                      }`}
                    >
                      Accrue Free Sub Months
                    </Button>
                  </div>
                </div>
              )}

              {/* Recent Referrals conversions list */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden">
                <div className="p-5 border-b border-border/5 bg-soft/10 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-brand" />
                  <h3 className="font-bold text-base text-foreground">Recent Referrals Ledger</h3>
                </div>
                {conversions.length === 0 ? (
                  <div className="py-14 text-center text-muted-foreground text-sm">No conversion history tracked yet. Share links to get started!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/15 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-6 py-4">Referred Friend</th>
                          <th className="px-6 py-4">Link Used</th>
                          <th className="px-6 py-4">Funnel Stage</th>
                          <th className="px-6 py-4">Activity Timeline</th>
                          <th className="px-6 py-4 text-right">Commission Reward</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {conversions.map(c => (
                          <tr key={c._id} className="hover:bg-soft/5">
                            <td className="px-6 py-4">
                              {c.prospect ? (
                                <div>
                                  <span className="font-semibold text-foreground text-xs">{c.prospect.name}</span>
                                  <div className="text-[10px] text-muted-foreground">{c.prospect.email}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Anonymous visitor</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono font-bold text-brand">{c.referralCode}</td>
                            <td className="px-6 py-4 text-xs">
                              {c.conversionStage === 'clicked' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400">Clicked Link</span>}
                              {c.conversionStage === 'signed_up' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400">Registered</span>}
                              {c.conversionStage === 'purchased' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400">Purchased</span>}
                              {c.conversionStage === 'cancelled' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-destructive/10 text-destructive">Cancelled</span>}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {c.purchasedAt ? (
                                <>Purchased: {formatDate(c.purchasedAt)}</>
                              ) : c.signedUpAt ? (
                                <>Registered: {formatDate(c.signedUpAt)}</>
                              ) : (
                                <>Visited: {formatDate(c.clickedAt)}</>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right text-xs">
                              {c.referrerReward ? (
                                <div>
                                  <span className="font-bold text-brand">
                                    {c.referrerReward.type === 'cash' ? `₹${c.referrerReward.amount}` : `${c.referrerReward.amount} Mos`}
                                  </span>
                                  <div className="text-[9px] text-muted-foreground capitalize">({c.referrerReward.status})</div>
                                </div>
                              ) : <span className="text-muted-foreground/45">-</span>}
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

          {/* Tab 2: Manage Links */}
          {activeTab === "links" && (
            <motion.div
              key="links"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Generate Code Box */}
              <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-6 shadow-elegant">
                <h3 className="font-bold text-base mb-4 text-foreground flex items-center gap-2"><Plus className="h-4 w-4 text-brand" /> Generate New Referral Link</h3>
                <form onSubmit={handleGenerateCode} className="flex flex-col sm:flex-row gap-4 items-end max-w-xl">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Link Name / Nickname</label>
                    <input
                      type="text"
                      placeholder="e.g. YouTube Promo, Friend Group"
                      value={newLinkName}
                      onChange={e => setNewLinkName(e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={generatingCode || codes.length >= 5}
                    variant="ghost"
                    className="w-full sm:w-auto h-11 px-6 bg-brand hover:bg-brand/90 text-primary-foreground hover:text-primary-foreground font-bold rounded-xl text-sm active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Generate Link</>}
                  </Button>
                </form>
                {codes.length >= 5 ? (
                  <p className="text-xs text-destructive mt-2 font-semibold">You have reached the maximum of 5 referral links.</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">You can create up to 5 links to track different referral sources.</p>
                )}
              </div>

              {/* Active Links Table */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden">
                <div className="p-5 border-b border-border/5 bg-soft/10">
                  <h3 className="font-bold text-base text-foreground">Your Referral Links</h3>
                </div>
                {codes.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">No referral links generated yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/15 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-6 py-4">Link Name</th>
                          <th className="px-6 py-4">Code</th>
                          <th className="px-6 py-4">Share Actions</th>
                          <th className="px-6 py-4">Performance (Clicks/Sales)</th>
                          <th className="px-6 py-4">Revenue Driven</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {codes.map(c => (
                          <tr key={c._id} className="hover:bg-soft/5">
                            <td className="px-6 py-4 font-semibold text-foreground">{c.name || "N/A"}</td>
                            <td className="px-6 py-4 font-mono text-brand font-bold">{c.code}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button 
                                  onClick={() => handleCopyLink(c.code)} 
                                  variant="outline"
                                  size="sm"
                                  className="inline-flex h-7 px-2.5 items-center justify-center gap-1 rounded-lg border border-border/10 hover:bg-soft transition-all text-xs font-semibold cursor-pointer"
                                >
                                  {copied === c.code ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                  Copy
                                </Button>
                                <Button 
                                  onClick={() => handleWhatsAppShareCode(c.code)} 
                                  variant="ghost"
                                  size="sm"
                                  className="inline-flex h-7 px-2.5 items-center justify-center gap-1 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/25 hover:text-green-400 transition-all text-xs font-semibold cursor-pointer"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  WhatsApp
                                </Button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-foreground">
                              {c.stats?.clicks ?? 0} clicks / {c.stats?.purchases ?? 0} purchases
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-emerald-400">
                              ₹{c.stats?.revenue ?? 0}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleToggleCodeStatus(c._id, c.is_active)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg border border-border/15 flex items-center justify-center hover:bg-soft transition-all text-foreground cursor-pointer"
                                  title="Toggle Link Active Status"
                                >
                                  {c.is_active ? <ToggleRight className="h-5 w-5 text-brand" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                                </Button>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  c.is_active 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                                    : "bg-muted text-muted-foreground border-border/10"
                                }`}>
                                  {c.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                onClick={() => handleDeleteCode(c._id)}
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-lg border border-destructive/20 transition-all cursor-pointer inline-flex"
                                title="Delete Referral Code"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

          {/* Tab 3: Payouts & Redemptions History */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Redemption Ledger Table */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden">
                <div className="p-5 border-b border-border/5 bg-soft/10 flex items-center gap-2">
                  <History className="h-4 w-4 text-brand" />
                  <h3 className="font-bold text-base text-foreground">Redemption &amp; Payout Claims Log</h3>
                </div>
                {!ledger || !ledger.redemptions || ledger.redemptions.length === 0 ? (
                  <div className="py-14 text-center text-muted-foreground text-sm">No redemption requests or payout events logged yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/15 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-6 py-4">Redemption Date</th>
                          <th className="px-6 py-4">Reward Payout Type</th>
                          <th className="px-6 py-4">Claimed Value</th>
                          <th className="px-6 py-4">Transfer / Application Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {ledger.redemptions.map((r, index) => (
                          <tr key={r._id || index} className="hover:bg-soft/5">
                            <td className="px-6 py-4 text-xs font-medium text-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatDate(r.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold">
                              {r.type === 'cash_claim' ? (
                                <span className="text-emerald-400">Cash Withdrawal Payout</span>
                              ) : (
                                <span className="text-brand">Subscription Extension</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-foreground">
                              {r.type === 'cash_claim' ? `₹${r.amount}` : `${r.months} Months Extension`}
                            </td>
                            <td className="px-6 py-4">
                              {r.status === 'completed' && (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 inline-flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Completed
                                </span>
                              )}
                              {r.status === 'pending' && (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/10 inline-flex items-center gap-1">
                                  Awaiting Admin Approval
                                </span>
                              )}
                              {r.status === 'failed' && (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-destructive/10 text-destructive border border-destructive/10 inline-flex items-center gap-1">
                                  Declined / Failed
                                </span>
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

        </AnimatePresence>
      </div>

      {/* Cash Payout Withdrawal Dialog Modal */}
      <AnimatePresence>
        {showClaimCashModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/15 w-full max-w-md rounded-2xl p-6 shadow-elegant space-y-4 relative"
            >
              <Button
                onClick={() => setShowClaimCashModal(false)}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center bg-soft/10 text-muted-foreground hover:text-foreground border border-border/10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 text-emerald-400">
                <Wallet className="h-6 w-6" />
                <h3 className="text-lg font-bold text-foreground">Withdraw Cash Reward</h3>
              </div>

              <p className="text-xs text-muted-foreground">
                Enter the amount of commission cash you wish to transfer. Available balance: <strong>₹{ledger?.availableBalance ?? 0}</strong>.
              </p>

              <form onSubmit={handleClaimCash} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={ledger?.availableBalance ?? 0}
                    placeholder="e.g. 1000"
                    value={claimAmount}
                    onChange={e => setClaimAmount(e.target.value)}
                    required
                    className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-emerald-500/40 focus:outline-none"
                  />
                </div>

                <div className="bg-soft/10 border border-border/5 rounded-xl p-3 text-[11px] text-muted-foreground">
                  📝 Note: Cash payouts will be processed automatically or reviewed by admin depending on platform threshold settings. A confirmation email will be sent on completion.
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowClaimCashModal(false)}
                    variant="outline"
                    className="h-10 px-4 rounded-xl text-xs font-semibold border border-border/10 hover:bg-soft text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={processingClaim || !claimAmount}
                    variant="ghost"
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {processingClaim ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <><ArrowUpRight className="h-4 w-4" /> Process Withdrawal</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscription extension Dialog Modal */}
      <AnimatePresence>
        {showApplySubModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/15 w-full max-w-md rounded-2xl p-6 shadow-elegant space-y-4 relative"
            >
              <Button
                onClick={() => setShowApplySubModal(false)}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center bg-soft/10 text-muted-foreground hover:text-foreground border border-border/10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 text-brand">
                <Coins className="h-6 w-6" />
                <h3 className="text-lg font-bold text-foreground">Apply Subscription Extension</h3>
              </div>

              <p className="text-xs text-muted-foreground">
                Apply your free months to extend an active SpendSmart subscription. Available free months balance: <strong>{ledger?.subscriptionMonths ?? 0} Months</strong>.
              </p>

              <form onSubmit={handleApplySubscription} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase">Select Active Subscription</label>
                  <select
                    value={selectedSubId}
                    onChange={e => setSelectedSubId(e.target.value)}
                    required
                    className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                  >
                    {activeSubscriptions.map(s => (
                      <option key={s._id} value={s._id} className="bg-background text-foreground">
                        {s.packageName} (Ends: {formatDate(s.endDate)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-muted-foreground uppercase">Number of Months to Apply</label>
                  <input
                    type="number"
                    min="1"
                    max={ledger?.subscriptionMonths ?? 0}
                    placeholder="1"
                    value={applySubMonths}
                    onChange={e => setApplySubMonths(e.target.value)}
                    required
                    className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowApplySubModal(false)}
                    variant="outline"
                    className="h-10 px-4 rounded-xl text-xs font-semibold border border-border/10 hover:bg-soft text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={processingClaim || !applySubMonths || !selectedSubId}
                    className="h-10 px-5 rounded-xl text-xs font-bold bg-brand text-primary-foreground hover:brightness-110 hover:text-primary-foreground transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {processingClaim ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <>Apply Free Months</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
