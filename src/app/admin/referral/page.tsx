"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Users, 
  Settings, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Trash2, 
  CheckCircle2, 
  ArrowUpRight,  
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Loader2, 
  Coins,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AdminKPIs {
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

interface CodeItem {
  _id: string;
  code: string;
  is_active: boolean;
  expires_at?: string;
  created_at?: string;
  reward: {
    type: 'cash' | 'subscription';
    cashAmount: number;
    subscriptionMonths: number;
    referralBonus: number;
  };
  referrer: {
    _id: string;
    name: string;
    email: string;
  } | null;
  stats: {
    clicks: number;
    signups: number;
    purchases: number;
    revenue: number;
  };
}

interface ConversionItem {
  _id: string;
  referralCode: string;
  conversionStage: string;
  timeline: {
    clicked_at?: string;
    visited_at?: string;
    signed_up_at?: string;
    purchased_at?: string;
  };
  purchaseDetails?: {
    grossAmount: number;
    netAmount: number;
  };
  referrerReward?: {
    type: 'cash' | 'subscription';
    amount: number;
    status: string;
  };
  referrer: { name: string; email: string } | null;
  prospect: { name: string; email: string } | null;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt?: string;
}

interface PendingApprovalItem {
  customerId: string;
  customerName: string;
  customerEmail: string;
  redemptionId: string;
  type: 'cash_claim' | 'subscription_activation';
  amount: number;
  months: number;
  date: string;
}

interface ProgramSettings {
  cash_reward_high: number;
  cash_reward_low: number;
  subscription_months: number;
  referral_bonus_amount: number;
  min_purchase_for_reward: number;
  auto_credit_cash: boolean;
  auto_apply_subscription: boolean;
  currency: string;
}

export default function AdminReferralsPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "codes" | "conversions" | "settings">("analytics");
  const [loading, setLoading] = useState(true);

  // States for analytics
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([]);

  // States for codes
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [codesSearch, setCodesSearch] = useState("");
  const [codesFilter, setCodesFilter] = useState("all");
  const [codesPage, setCodesPage] = useState(1);
  const [codesTotalPages, setCodesTotalPages] = useState(1);

  // States for conversions
  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [convStageFilter, setConvStageFilter] = useState("all");
  const [convSearch, setConvSearch] = useState("");
  const [convPage, setConvPage] = useState(1);
  const [convTotalPages, setConvTotalPages] = useState(1);

  // Pending queue derived or loaded
  const [pendingQueue, setPendingQueue] = useState<PendingApprovalItem[]>([]);
  const [processingRewardId, setProcessingRewardId] = useState<string | null>(null);

  // States for settings
  const [settings, setSettings] = useState<ProgramSettings | null>(null);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Creation forms states
  const [newCode, setNewCode] = useState("");
  const [newReferrerEmail, setNewReferrerEmail] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newRewardType, setNewRewardType] = useState<"cash" | "subscription">("cash");
  const [creatingCode, setCreatingCode] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/analytics");
      const data = await res.json();
      if (data.success) {
        setKpis(data.kpis);
        setLeaderboard(data.leaderboard);
        setRecentConversions(data.recentConversions);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  }, []);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/referrals/codes?status=${codesFilter}&search=${encodeURIComponent(codesSearch)}&page=${codesPage}&limit=10`
      );
      const data = await res.json();
      if (data.success) {
        setCodes(data.codes);
        setCodesTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error("Error loading codes:", err);
    }
  }, [codesFilter, codesSearch, codesPage]);

  const fetchConversions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/referrals/conversions?stage=${convStageFilter}&search=${encodeURIComponent(convSearch)}&page=${convPage}&limit=15`
      );
      const data = await res.json();
      if (data.success) {
        setConversions(data.conversions);
        setConvTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error("Error loading conversions:", err);
    }
  }, [convStageFilter, convSearch, convPage]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }, []);

  // Fetch pending approvals queue
  const fetchPendingQueue = useCallback(async () => {
    try {
      // Find conversions with pending status, or redemptions that are pending
      // For simplicity, we fetch all active customers' reward ledgers to pull pending redemptions
      // In a production app, we would query the db directly. Let's make a mock check on conversions with status "calculated"
      // or pending cash claims
      const resConvs = await fetch("/api/admin/referrals/conversions?stage=purchased&limit=200");
      const dataConvs = await resConvs.json();
      
      const pending: PendingApprovalItem[] = [];

      if (dataConvs.success) {
        // Look for calculated stage conversions (unfunded rewards)
        dataConvs.conversions
          .filter((c: any) => c.referrerReward?.status === 'calculated')
          .forEach((c: any) => {
            pending.push({
              customerId: c.referrer?._id || 'unknown',
              customerName: c.referrer?.name || 'Referrer',
              customerEmail: c.referrer?.email || '',
              redemptionId: c._id, // use conversion id as trigger for approve conversion
              type: c.referrerReward?.type === 'subscription' ? 'subscription_activation' : 'cash_claim',
              amount: c.referrerReward?.type === 'cash' ? c.referrerReward?.amount : 0,
              months: c.referrerReward?.type === 'subscription' ? c.referrerReward?.amount : 0,
              date: c.timeline?.purchased_at || c.createdAt
            });
          });
      }

      setPendingQueue(pending);
    } catch (err) {
      console.error("Error fetching pending approvals queue:", err);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchCodes(),
      fetchConversions(),
      fetchSettings(),
      fetchPendingQueue()
    ]);
    setLoading(false);
  }, [fetchAnalytics, fetchCodes, fetchConversions, fetchSettings, fetchPendingQueue]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle toggling referral code status
  const handleToggleCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/referrals/codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        toast.success(`Referral code status updated.`);
        fetchCodes();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to toggle code status.");
    }
  };

  // Handle deleting code
  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this code?")) return;
    try {
      const res = await fetch(`/api/admin/referrals/codes/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Referral code deleted.");
        fetchCodes();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to delete code.");
    }
  };

  // Handle creating code
  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newReferrerEmail) {
      toast.error("Please fill in code name and referrer email.");
      return;
    }
    setCreatingCode(true);
    try {
      const res = await fetch("/api/admin/referrals/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          referrerEmail: newReferrerEmail,
          expiresAt: newExpiresAt || undefined,
          reward: {
            type: newRewardType
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Referral code created successfully!");
        setNewCode("");
        setNewReferrerEmail("");
        setNewExpiresAt("");
        fetchCodes();
      } else {
        throw new Error(data.error || "Creation failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create code.");
    } finally {
      setCreatingCode(false);
    }
  };

  // Handle approving pending reward in queue
  const handleApproveReward = async (item: PendingApprovalItem) => {
    setProcessingRewardId(item.redemptionId);
    try {
      // In our queue, we approval conversions with 'calculated' status
      // We can create a mock approve endpoint: since the reward calculation was logged on purchase,
      // marking it as approved credits the referrer and updates conversion status to 'credited'.
      const res = await fetch("/api/admin/referrals/rewards/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: item.customerId,
          redemptionId: item.redemptionId // triggers ledger approve or conversion approve
        })
      });
      if (res.ok) {
        toast.success("Reward approved and balance updated!");
        fetchPendingQueue();
        fetchAnalytics();
      } else {
        const d = await res.json();
        throw new Error(d.error || "Approval failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve reward.");
    } finally {
      setProcessingRewardId(null);
    }
  };

  // Handle rejecting pending reward
  const handleRejectReward = async (item: PendingApprovalItem) => {
    if (!confirm("Are you sure you want to reject this reward?")) return;
    setProcessingRewardId(item.redemptionId);
    try {
      const res = await fetch("/api/admin/referrals/rewards/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: item.customerId,
          redemptionId: item.redemptionId,
          reason: "Manual admin rejection"
        })
      });
      if (res.ok) {
        toast.success("Reward rejected.");
        fetchPendingQueue();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to reject reward.");
    } finally {
      setProcessingRewardId(null);
    }
  };

  // Handle updating global settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setUpdatingSettings(true);
    try {
      const res = await fetch("/api/admin/referrals/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Referral configuration settings saved!");
        fetchSettings();
      } else {
        throw new Error(data.error || "Update failed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update configuration.");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleSettingsFieldChange = (field: keyof ProgramSettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading && !kpis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <span>Loading Admin referral board...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] bg-brand/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] bg-gold/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Referral Manager Console
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Admin dashboard to configure referral settings, manage invite codes, audit funnels, and process rewards.
          </p>
        </div>
        <button
          onClick={loadAllData}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/45 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-card/70 transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className="h-4 w-4" /> Sync Stats
        </button>
      </div>

      {/* KPI Stats Panel */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Codes</p>
              <h3 className="text-2xl font-bold font-display mt-2">{kpis.activeCodes}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <Clipboard className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clicks Funnel</p>
              <h3 className="text-2xl font-bold font-display mt-2">{kpis.clicks}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-semibold">Conversions (Purchases)</p>
              <h3 className="text-2xl font-bold font-display mt-2">{kpis.purchases} <span className="text-xs text-muted-foreground font-normal">/ {kpis.signups} signups</span></h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-bold font-display text-emerald-400 mt-2">₹{kpis.revenue}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-border/10 relative z-10">
        {(["analytics", "codes", "conversions", "settings"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm capitalize transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? "border-brand text-brand font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {/* Top Referrers Leaderboard */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-6 shadow-elegant md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpRight className="h-5 w-5 text-brand" />
                  <h3 className="font-bold">Top Referrers Leaderboard</h3>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="py-10 text-center text-xs text-muted-foreground">No earnings data loaded yet.</div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((item, idx) => (
                      <div key={item.referrerId} className="flex items-center justify-between p-3 rounded-xl border border-border/5 bg-soft/10">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-muted-foreground">Rank #{idx + 1}</div>
                          <div className="font-semibold text-foreground text-sm">{item.name}</div>
                          <div className="text-[10px] font-mono text-brand font-bold">{item.referralCode}</div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-bold text-foreground text-sm">₹{item.earnings}</div>
                          <div className="text-[10px] text-muted-foreground">{item.conversionsCount} sales ({item.conversionRate}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Conversions Table */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-6 shadow-elegant md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-brand" />
                  <h3 className="font-bold">Recent Purchased Conversions</h3>
                </div>

                {recentConversions.length === 0 ? (
                  <div className="py-14 text-center text-muted-foreground text-sm">No purchases recorded yet. Simulate one inside Customer Portal!</div>
                ) : (
                  <div className="overflow-y-auto max-h-[350px]">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/10 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="py-2">Date</th>
                          <th className="py-2">Prospect</th>
                          <th className="py-2">Referrer</th>
                          <th className="py-2 text-right">Net Value</th>
                          <th className="py-2 text-right">Reward</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/5">
                        {recentConversions.map(c => (
                          <tr key={c._id} className="hover:bg-soft/5">
                            <td className="py-3 text-xs text-muted-foreground">{formatDate(c.purchasedAt)}</td>
                            <td className="py-3 font-semibold text-foreground text-xs">{c.prospectName}</td>
                            <td className="py-3 text-xs text-muted-foreground">
                              {c.referrerName} ({c.referralCode})
                            </td>
                            <td className="py-3 text-right text-xs font-mono">₹{c.amount}</td>
                            <td className="py-3 text-right text-xs font-bold text-brand">
                              {c.referrerRewardType === 'cash' ? `₹${c.referrerReward}` : `${c.referrerReward} Mos`}
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

          {activeTab === "codes" && (
            <motion.div
              key="codes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Code Creation Box */}
              <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-6 shadow-elegant">
                <h3 className="font-bold text-base mb-4 flex items-center gap-1.5"><Plus className="h-4 w-4 text-brand" /> Create Referral Code</h3>
                <form onSubmit={handleCreateCode} className="grid gap-4 sm:grid-cols-5 items-end">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Code Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DISCSMART"
                      value={newCode}
                      onChange={e => setNewCode(e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-brand/40 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Referrer Email</label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={newReferrerEmail}
                      onChange={e => setNewReferrerEmail(e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Reward Type</label>
                    <select
                      value={newRewardType}
                      onChange={e => setNewRewardType(e.target.value as any)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none"
                    >
                      <option value="cash" className="bg-background text-foreground">Cash Payout</option>
                      <option value="subscription" className="bg-background text-foreground">Subscription extension</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingCode}
                    className="w-full h-11 bg-gradient-brand text-primary-foreground font-bold rounded-xl text-sm hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {creatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Code</>}
                  </button>
                </form>
              </div>

              {/* Codes Table List */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden">
                <div className="p-5 border-b border-border/5 bg-soft/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h3 className="font-bold text-base">Referral Codes List</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={codesFilter}
                      onChange={e => { setCodesFilter(e.target.value); setCodesPage(1); }}
                      className="bg-soft/30 border border-border/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="all" className="bg-background text-foreground">All Status</option>
                      <option value="active" className="bg-background text-foreground">Active</option>
                      <option value="inactive" className="bg-background text-foreground">Inactive</option>
                    </select>
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search codes..."
                        value={codesSearch}
                        onChange={e => { setCodesSearch(e.target.value); setCodesPage(1); }}
                        className="w-full bg-soft/30 border border-border/10 rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:border-brand/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {codes.length === 0 ? (
                  <div className="py-14 text-center text-muted-foreground text-sm">No referral codes found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/15 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-6 py-4">Code</th>
                          <th className="px-6 py-4">Referrer Owner</th>
                          <th className="px-6 py-4">Reward Scheme</th>
                          <th className="px-6 py-4">Uses (Clicks/Sales)</th>
                          <th className="px-6 py-4">Revenue</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {codes.map(c => (
                          <tr key={c._id} className="hover:bg-soft/5">
                            <td className="px-6 py-4 font-mono font-bold text-foreground">{c.code}</td>
                            <td className="px-6 py-4">
                              {c.referrer ? (
                                <div>
                                  <div className="font-semibold text-foreground text-xs">{c.referrer.name}</div>
                                  <div className="text-[10px] text-muted-foreground">{c.referrer.email}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">None (Unassigned)</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {c.reward.type === 'cash' 
                                ? `Cash (₹${c.reward.cashAmount})` 
                                : `Sub (${c.reward.subscriptionMonths} mos)`}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold">
                              {c.stats.clicks} clicks / {c.stats.purchases} conversions
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-emerald-400">
                              ₹{c.stats.revenue}
                            </td>
                            <td className="px-6 py-4">
                              {c.is_active ? (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Active</span>
                              ) : (
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-muted text-muted-foreground border border-border/10">Inactive</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleToggleCodeStatus(c._id, c.is_active)}
                                  className="h-8 w-8 rounded-lg border border-border/15 flex items-center justify-center hover:bg-soft transition-all text-foreground cursor-pointer"
                                  title="Toggle Active Status"
                                >
                                  {c.is_active ? <ToggleRight className="h-5 w-5 text-brand" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteCode(c._id)}
                                  className="h-8 w-8 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-all cursor-pointer"
                                  title="Delete Code"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
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

          {activeTab === "conversions" && (
            <motion.div
              key="conversions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Pending Approvals Ledger Queue */}
              <div className="bg-card/25 border border-border/10 rounded-2xl p-6 shadow-elegant">
                <h3 className="font-bold text-base mb-4 flex items-center gap-1.5"><Coins className="h-5 w-5 text-brand animate-pulse" /> Pending Rewards Approvals Queue</h3>
                {pendingQueue.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border/10 rounded-xl">
                    No pending rewards queue. If auto-credit settings are toggled on, rewards approve automatically on simulated purchases!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {pendingQueue.map(item => (
                      <div key={item.redemptionId} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border/10 rounded-xl p-4 bg-soft/10 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-foreground">{item.customerName}</span>
                            <span className="text-xs text-muted-foreground font-mono">({item.customerEmail})</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Claiming: <strong className="text-brand">{item.type === 'subscription_activation' ? `${item.months} Mos Subscription extension` : `₹${item.amount} Cash Payout`}</strong> on referral conversion.
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={processingRewardId === item.redemptionId}
                            onClick={() => handleApproveReward(item)}
                            className="inline-flex h-9 items-center px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            disabled={processingRewardId === item.redemptionId}
                            onClick={() => handleRejectReward(item)}
                            className="inline-flex h-9 items-center px-4 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 text-xs hover:bg-destructive/25 transition-all cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* General Conversions Table */}
              <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden">
                <div className="p-5 border-b border-border/5 bg-soft/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h3 className="font-bold text-base">Funnel Conversion Audit Ledger</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={convStageFilter}
                      onChange={e => { setConvStageFilter(e.target.value); setConvPage(1); }}
                      className="bg-soft/30 border border-border/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="all" className="bg-background text-foreground">All Stages</option>
                      <option value="clicked" className="bg-background text-foreground">Clicked</option>
                      <option value="signed_up" className="bg-background text-foreground">Signed Up</option>
                      <option value="purchased" className="bg-background text-foreground">Purchased</option>
                      <option value="cancelled" className="bg-background text-foreground">Cancelled</option>
                    </select>
                    
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search conversions..."
                        value={convSearch}
                        onChange={e => { setConvSearch(e.target.value); setConvPage(1); }}
                        className="w-full bg-soft/30 border border-border/10 rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:border-brand/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {conversions.length === 0 ? (
                  <div className="py-14 text-center text-muted-foreground text-sm">No conversion records matching criteria.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/15 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="px-6 py-4">Prospect</th>
                          <th className="px-6 py-4">Referrer Code</th>
                          <th className="px-6 py-4">Stage</th>
                          <th className="px-6 py-4">Timeline Event</th>
                          <th className="px-6 py-4 text-right">Referrer Reward</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {conversions.map(c => (
                          <tr key={c._id} className="hover:bg-soft/5">
                            <td className="px-6 py-4">
                              {c.prospect ? (
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-foreground text-xs">{c.prospect.name}</span>
                                    {c.isFlagged && (
                                      <span 
                                        className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-destructive/15 text-destructive border border-destructive/10 cursor-help" 
                                        title={c.flagReason}
                                      >
                                        Flagged
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">{c.prospect.email}</div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Anonymous user</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono">
                              <div>{c.referralCode}</div>
                              {c.referrer && <div className="text-[9px] text-muted-foreground">Owner: {c.referrer.name}</div>}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {c.conversionStage === 'clicked' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400">Clicked</span>}
                              {c.conversionStage === 'signed_up' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400">Signed Up</span>}
                              {c.conversionStage === 'purchased' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400">Purchased</span>}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {c.timeline?.purchased_at ? (
                                <>Purchased on {formatDate(c.timeline.purchased_at)}</>
                              ) : c.timeline?.signed_up_at ? (
                                <>Registered on {formatDate(c.timeline.signed_up_at)}</>
                              ) : c.timeline?.clicked_at ? (
                                <>Clicked link on {formatDate(c.timeline.clicked_at)}</>
                              ) : (
                                <>Updated {formatDate(c.timeline?.clicked_at || c.createdAt as any)}</>
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

          {activeTab === "settings" && settings && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-6 sm:p-8 shadow-elegant"
            >
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <h3 className="font-bold text-lg border-b border-border/5 pb-3 flex items-center gap-1.5">
                  <Settings className="h-5 w-5 text-brand" /> Referral Reward Configuration
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">
                      High Cash Reward Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.cash_reward_high}
                      onChange={e => handleSettingsFieldChange("cash_reward_high", e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">
                      Low Cash Reward Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.cash_reward_low}
                      onChange={e => handleSettingsFieldChange("cash_reward_low", e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">
                      Min Purchase Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.min_purchase_for_reward}
                      onChange={e => handleSettingsFieldChange("min_purchase_for_reward", e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">
                      Referral Signup Bonus Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.referral_bonus_amount}
                      onChange={e => handleSettingsFieldChange("referral_bonus_amount", e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">
                      Free Subscription Months Reward
                    </label>
                    <input
                      type="number"
                      value={settings.subscription_months}
                      onChange={e => handleSettingsFieldChange("subscription_months", e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={e => handleSettingsFieldChange("currency", e.target.value)}
                      className="w-full bg-soft/30 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground focus:border-brand/40 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-border/5 pt-5">
                  <h4 className="font-bold text-sm">Automation Settings</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold uppercase text-foreground">Auto-Credit Referrer Cash Rewards</div>
                        <div className="text-[11px] text-muted-foreground">If enabled, cash rewards are immediately credited to accountBalance without manual review.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSettingsFieldChange("auto_credit_cash", !settings.auto_credit_cash)}
                        className="text-brand hover:brightness-110 cursor-pointer"
                      >
                        {settings.auto_credit_cash ? <ToggleRight className="h-8 w-8 text-brand" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold uppercase text-foreground">Auto-Apply Subscription Free Months</div>
                        <div className="text-[11px] text-muted-foreground">If enabled, subscription extension free months apply automatically to active user subscriptions.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSettingsFieldChange("auto_apply_subscription", !settings.auto_apply_subscription)}
                        className="text-brand hover:brightness-110 cursor-pointer"
                      >
                        {settings.auto_apply_subscription ? <ToggleRight className="h-8 w-8 text-brand" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingSettings}
                  className="w-full h-12 bg-gradient-brand text-primary-foreground font-bold rounded-xl text-sm hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {updatingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save Configurations</>}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}