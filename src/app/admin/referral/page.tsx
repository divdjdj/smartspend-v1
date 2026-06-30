"use client";

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/referral-v2/data-table"
import { SectionCards } from "@/components/admin/referral-v2/section-cards"
import type { 
  ClientItem, CodeItem, ConversionItem, PendingApprovalItem, ProgramSettings 
} from "@/components/admin/referral-v2/data-table-parts/schema"

interface AdminKPIs {
  activeCodes: number;
  clicks: number;
  signups: number;
  purchases: number;
  revenue: number;
  cashPaid: number;
  subscriptionMonths: number;
}

export default function AdminReferralPage() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<AdminKPIs | null>(null)

  // States for codes
  const [codes, setCodes] = useState<CodeItem[]>([])
  const [codesSearch, setCodesSearch] = useState("")
  const [codesFilter, setCodesFilter] = useState("all")
  const [codesPage, setCodesPage] = useState(1)

  // States for conversions
  const [conversions, setConversions] = useState<ConversionItem[]>([])
  const [convStageFilter, setConvStageFilter] = useState("all")
  const [convSearch, setConvSearch] = useState("")
  const [convPage, setConvPage] = useState(1)

  // Pending queue
  const [pendingQueue, setPendingQueue] = useState<PendingApprovalItem[]>([])
  const [processingRewardId, setProcessingRewardId] = useState<string | null>(null)

  // Settings
  const [settings, setSettings] = useState<ProgramSettings | null>(null)
  const [updatingSettings, setUpdatingSettings] = useState(false)

  // Create Code form state
  const [newLinkName, setNewLinkName] = useState("")
  const [newReferrerName, setNewReferrerName] = useState("")
  const [newReferrerPhone, setNewReferrerPhone] = useState("")
  const [newReferrerEmail, setNewReferrerEmail] = useState("")
  const [creatingCode, setCreatingCode] = useState(false)

  // Clients
  const [clients, setClients] = useState<ClientItem[]>([])
  const [fetchingClients, setFetchingClients] = useState(false)

  const fetchClients = useCallback(async () => {
    setFetchingClients(true)
    try {
      const res = await fetch("/api/admin/referrals/users")
      const data = await res.json()
      if (Array.isArray(data)) {
        setClients(data)
      }
    } catch (err) {
      console.error("Error loading clients:", err)
    } finally {
      setFetchingClients(false)
    }
  }, [])

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/referrals/codes?status=${codesFilter}&search=${encodeURIComponent(codesSearch)}&page=${codesPage}&limit=10`
      )
      const data = await res.json()
      if (data.success) {
        setCodes(data.codes)
      }
    } catch (err) {
      console.error("Error loading codes:", err)
    }
  }, [codesFilter, codesSearch, codesPage])

  const fetchConversions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/referrals/conversions?stage=${convStageFilter}&search=${encodeURIComponent(convSearch)}&page=${convPage}&limit=15`
      )
      const data = await res.json()
      if (data.success) {
        setConversions(data.conversions)
      }
    } catch (err) {
      console.error("Error loading conversions:", err)
    }
  }, [convStageFilter, convSearch, convPage])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/settings")
      const data = await res.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error("Error loading settings:", err)
    }
  }, [])

  const fetchPendingQueue = useCallback(async () => {
    try {
      const resConvs = await fetch("/api/admin/referrals/conversions?stage=purchased&limit=200")
      const dataConvs = await resConvs.json()
      const pending: PendingApprovalItem[] = []

      if (dataConvs.success) {
        dataConvs.conversions
          .filter((c: any) => c.referrerReward?.status === "calculated")
          .forEach((c: any) => {
            pending.push({
              customerId: c.referrer?._id || "unknown",
              customerName: c.referrer?.name || "Referrer",
              customerEmail: c.referrer?.email || "",
              redemptionId: c._id,
              type: c.referrerReward?.type === "subscription" ? "subscription_activation" : "cash_claim",
              amount: c.referrerReward?.type === "cash" ? c.referrerReward?.amount : 0,
              months: c.referrerReward?.type === "subscription" ? c.referrerReward?.amount : 0,
              date: c.timeline?.purchased_at || c.createdAt || "",
            })
          })
      }
      setPendingQueue(pending)
    } catch (err) {
      console.error("Error fetching pending approvals queue:", err)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/analytics")
      const data = await res.json()
      if (data.success && data.kpis) {
        setKpis(data.kpis)
      }
    } catch (err) {
      console.error("Error loading analytics:", err)
    }
  }, [])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchCodes(),
      fetchConversions(),
      fetchSettings(),
      fetchPendingQueue(),
      fetchClients(),
      fetchAnalytics(),
    ])
    setLoading(false)
  }, [fetchCodes, fetchConversions, fetchSettings, fetchPendingQueue, fetchClients, fetchAnalytics])

  useEffect(() => {
    loadAllData()
  }, [])

  const handleToggleCodeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/referrals/codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })
      if (res.ok) {
        toast.success(`Referral code status updated.`)
        fetchCodes()
      } else {
        throw new Error()
      }
    } catch {
      toast.error("Failed to toggle code status.")
    }
  }

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this code?")) return
    try {
      const res = await fetch(`/api/admin/referrals/codes/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Referral code deleted.")
        fetchCodes()
      } else {
        throw new Error()
      }
    } catch {
      toast.error("Failed to delete code.")
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to soft-delete this user?")) return
    try {
      const res = await fetch(`/api/admin/referrals/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("User soft deleted successfully.")
        fetchClients()
      } else {
        throw new Error()
      }
    } catch {
      toast.error("Failed to delete user.")
    }
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLinkName) {
      toast.error("Please provide a name for this referral link.")
      return
    }
    setCreatingCode(true)
    try {
      const res = await fetch("/api/admin/referrals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkName: newLinkName,
          name: newReferrerName,
          phone: newReferrerPhone,
          email: newReferrerEmail,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Referral link generated successfully!")
        setNewLinkName("")
        setNewReferrerName("")
        setNewReferrerPhone("")
        setNewReferrerEmail("")
        fetchCodes()
      } else {
        throw new Error(data.error || "Creation failed.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create code.")
    } finally {
      setCreatingCode(false)
    }
  }

  const handleApproveReward = async (item: PendingApprovalItem) => {
    setProcessingRewardId(item.redemptionId)
    try {
      const res = await fetch("/api/admin/referrals/rewards/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: item.customerId,
          redemptionId: item.redemptionId,
        }),
      })
      if (res.ok) {
        toast.success("Reward approved and balance updated!")
        fetchPendingQueue()
        fetchAnalytics()
      } else {
        const d = await res.json()
        throw new Error(d.error || "Approval failed.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve reward.")
    } finally {
      setProcessingRewardId(null)
    }
  }

  const handleRejectReward = async (item: PendingApprovalItem) => {
    if (!confirm("Are you sure you want to reject this reward?")) return
    setProcessingRewardId(item.redemptionId)
    try {
      const res = await fetch("/api/admin/referrals/rewards/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: item.customerId,
          redemptionId: item.redemptionId,
          reason: "Manual admin rejection",
        }),
      })
      if (res.ok) {
        toast.success("Reward rejected.")
        fetchPendingQueue()
      } else {
        throw new Error()
      }
    } catch {
      toast.error("Failed to reject reward.")
    } finally {
      setProcessingRewardId(null)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setUpdatingSettings(true)
    try {
      const res = await fetch("/api/admin/referrals/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Referral configuration settings saved!")
        fetchSettings()
      } else {
        throw new Error(data.error || "Update failed.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update configuration.")
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/ref/${code}`
    navigator.clipboard.writeText(link)
    toast.success("Link copied to clipboard")
  }

  const handleWhatsAppShare = (code: string) => {
    const link = `${window.location.origin}/ref/${code}`
    const message = encodeURIComponent(`Here is my referral link: ${link}`)
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleSettingsFieldChange = (
    field: keyof ProgramSettings,
    value: string | number | boolean
  ) => {
    if (!settings) return
    setSettings((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (loading && !kpis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <span>Loading Admin referral board...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 lg:px-6 gap-4">
            <div>
              <h2 className="text-xl font-display font-bold tracking-tight text-foreground">
                Referral Console
              </h2>
            </div>
            <Button
              onClick={loadAllData}
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2 rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />Refresh
            </Button>
          </div>

          <SectionCards kpis={kpis} />

          <DataTable
            clients={clients}
            fetchingClients={fetchingClients}
            handleDeleteClient={handleDeleteClient}
            reloadClients={fetchClients}
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
            settings={settings}
            handleSettingsFieldChange={handleSettingsFieldChange}
            handleSaveSettings={handleSaveSettings}
            updatingSettings={updatingSettings}
          />
        </div>
      </div>
    </div>
  )
}

