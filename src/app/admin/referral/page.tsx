"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2,   
  Loader2, 
  Coins,
  Clipboard} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  AdminKPIs, CodeItem, ConversionItem, PendingApprovalItem, ProgramSettings, ClientItem,
  ClientsTab, CodesTab, ConversionsTab, SettingsTab 
} from "@/components/admin/referral";

export default function AdminReferralsPage() {
  const [activeTab, setActiveTab] = useState<"codes" | "conversions" | "settings" | "clients">("clients");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);

  // States for codes
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [codesSearch, setCodesSearch] = useState("");
  const [codesFilter, setCodesFilter] = useState("all");
  const [codesPage, setCodesPage] = useState(1);
  const [, setCodesTotalPages] = useState(1);

  // States for conversions
  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [convStageFilter, setConvStageFilter] = useState("all");
  const [convSearch, setConvSearch] = useState("");
  const [convPage, setConvPage] = useState(1);
  const [, setConvTotalPages] = useState(1);

  // Pending queue derived or loaded
  const [pendingQueue, setPendingQueue] = useState<PendingApprovalItem[]>([]);
  const [processingRewardId, setProcessingRewardId] = useState<string | null>(null);

  // States for settings
  const [settings, setSettings] = useState<ProgramSettings | null>(null);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Creation forms states
  const [newLinkName, setNewLinkName] = useState("");
  const [newReferrerName, setNewReferrerName] = useState("");
  const [newReferrerPhone, setNewReferrerPhone] = useState("");
  const [newReferrerEmail, setNewReferrerEmail] = useState("");
  const [creatingCode, setCreatingCode] = useState(false);

  // Client list states
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [fetchingClients, setFetchingClients] = useState(false);

  const fetchClients = useCallback(async () => {
    setFetchingClients(true);
    try {
      const res = await fetch("/api/admin/referrals/users");
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      }
    } catch (err) {
      console.error("Error loading clients:", err);
    } finally {
      setFetchingClients(false);
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
          .filter((c: ConversionItem) => c.referrerReward?.status === 'calculated')
          .forEach((c: ConversionItem) => {
            pending.push({
              customerId: c.referrer?._id || 'unknown',
              customerName: c.referrer?.name || 'Referrer',
              customerEmail: c.referrer?.email || '',
              redemptionId: c._id, // use conversion id as trigger for approve conversion
              type: c.referrerReward?.type === 'subscription' ? 'subscription_activation' : 'cash_claim',
              amount: c.referrerReward?.type === 'cash' ? c.referrerReward?.amount : 0,
              months: c.referrerReward?.type === 'subscription' ? c.referrerReward?.amount : 0,
              date: c.timeline?.purchased_at || c.createdAt || ''
            });
          });
      }

      setPendingQueue(pending);
    } catch (err) {
      console.error("Error fetching pending approvals queue:", err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/analytics");
      const data = await res.json();
      if (data.success && data.kpis) {
        setKpis(data.kpis);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchCodes(),
      fetchConversions(),
      fetchSettings(),
      fetchPendingQueue(),
      fetchClients(),
      fetchAnalytics()
    ]);
    setLoading(false);
  }, [fetchCodes, fetchConversions, fetchSettings, fetchPendingQueue, fetchClients, fetchAnalytics]);

  useEffect(() => {
    setTimeout(() => {
      loadAllData();
    }, 0);
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
    } catch {
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
    } catch {
      toast.error("Failed to delete code.");
    }
  };

  // Handle deleting client
  const handleDeleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/referrals/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User soft deleted successfully.");
        fetchClients();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  // Handle creating code
  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName) {
      toast.error("Please provide a name for this referral link.");
      return;
    }
    setCreatingCode(true);
    try {
      const res = await fetch("/api/admin/referrals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkName: newLinkName,
          name: newReferrerName,
          phone: newReferrerPhone,
          email: newReferrerEmail,
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Referral link generated successfully!");
        setNewLinkName("");
        setNewReferrerName("");
        setNewReferrerPhone("");
        setNewReferrerEmail("");
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
    } catch {
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

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/ref/${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const handleWhatsAppShare = (code: string) => {
    const link = `${window.location.origin}/ref/${code}`;
    const message = encodeURIComponent(`Here is my referral link: ${link}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleSettingsFieldChange = (field: keyof ProgramSettings, value: string | number | boolean) => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight text-foreground">
            Referral Console
          </h2>
        </div>
        <Button
          onClick={loadAllData}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/45 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-card/70 transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
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
      <div className="flex border-b border-border/10 relative z-10 overflow-x-auto">
        {(["clients", "codes", "conversions", "settings"] as const).map(tab => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm capitalize transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? "border-brand text-brand font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "clients" && (
            <ClientsTab 
              clients={clients} 
              fetchingClients={fetchingClients} 
              handleDeleteClient={handleDeleteClient} 
              reloadClients={fetchClients}
            />
          )}

          {activeTab === "codes" && (
            <CodesTab 
              codes={codes}
              codesFilter={codesFilter}
              setCodesFilter={setCodesFilter}
              codesSearch={codesSearch}
              setCodesSearch={setCodesSearch}
              setCodesPage={setCodesPage}
              handleCreateCode={handleCreateCode}
              newLinkName={newLinkName}
              setNewLinkName={setNewLinkName}
              newReferrerName={newReferrerName}
              setNewReferrerName={setNewReferrerName}
              newReferrerPhone={newReferrerPhone}
              setNewReferrerPhone={setNewReferrerPhone}
              newReferrerEmail={newReferrerEmail}
              setNewReferrerEmail={setNewReferrerEmail}
              creatingCode={creatingCode}
              handleCopyLink={handleCopyLink}
              handleWhatsAppShare={handleWhatsAppShare}
              handleToggleCodeStatus={handleToggleCodeStatus}
              handleDeleteCode={handleDeleteCode}
            />
          )}

          {activeTab === "conversions" && (
            <ConversionsTab
              pendingQueue={pendingQueue}
              processingRewardId={processingRewardId}
              handleApproveReward={handleApproveReward}
              handleRejectReward={handleRejectReward}
              conversions={conversions}
              convStageFilter={convStageFilter}
              setConvStageFilter={setConvStageFilter}
              convSearch={convSearch}
              setConvSearch={setConvSearch}
              setConvPage={setConvPage}
              formatDate={formatDate}
            />
          )}

          {activeTab === "settings" && settings && (
            <SettingsTab
              settings={settings}
              handleSettingsFieldChange={handleSettingsFieldChange}
              handleSaveSettings={handleSaveSettings}
              updatingSettings={updatingSettings}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}