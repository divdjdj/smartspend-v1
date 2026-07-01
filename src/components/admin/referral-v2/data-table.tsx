"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  getClientColumns,
  getCodeColumns,
  getConversionColumns,
  getPendingColumns,
} from "./data-table-parts/columns"
import { DraggableRow } from "./data-table-parts/draggable-row"
import type { ClientItem, CodeItem, ConversionItem, PendingApprovalItem, ProgramSettings } from "@/types/referral"
import { Client } from "@/types"
import { SettingsTab } from "../referral/settings-tab"
import { Loader2 } from "lucide-react"

// Import the newly extracted modular components
import { GlobalInvoiceDialog } from "./data-table-parts/global-invoice-dialog"
import { ReferredClientsDialog } from "./data-table-parts/referred-clients-dialog"
import { UserProfilePanel } from "./data-table-parts/user-profile-panel"
import { DataTableToolbar, type TabValue } from "./data-table-parts/data-table-toolbar"
import { DataTablePagination } from "./data-table-parts/data-table-pagination"
import ClientPurchasesDialog from "@/components/admin/clients/client-purchases-dialog"
import type { ColumnDef } from "@tanstack/react-table"

type TableItem = ClientItem | CodeItem | ConversionItem | PendingApprovalItem

interface DataTableProps {
  clients: ClientItem[]
  fetchingClients: boolean
  handleDeleteClient: (id: string) => void
  reloadClients: () => void

  codes: CodeItem[]
  codesFilter: string
  setCodesFilter: (val: string) => void
  codesSearch: string
  setCodesSearch: (val: string) => void
  setCodesPage: (val: number) => void
  handleCreateCode: (e: React.FormEvent) => void
  newLinkName: string
  setNewLinkName: (val: string) => void
  newReferrerName: string
  setNewReferrerName: (val: string) => void
  newReferrerPhone: string
  setNewReferrerPhone: (val: string) => void
  newReferrerEmail: string
  setNewReferrerEmail: (val: string) => void
  creatingCode: boolean
  handleCopyLink: (code: string) => void
  handleWhatsAppShare: (code: string) => void
  handleToggleCodeStatus: (id: string, status: boolean) => void
  handleDeleteCode: (id: string) => void

  pendingQueue: PendingApprovalItem[]
  processingRewardId: string | null
  handleApproveReward: (item: PendingApprovalItem) => void
  handleRejectReward: (item: PendingApprovalItem) => void

  conversions: ConversionItem[]
  convStageFilter: string
  setConvStageFilter: (val: string) => void
  convSearch: string
  setConvSearch: (val: string) => void
  setConvPage: (val: number) => void
  formatDate: (dateStr: string) => string

  settings: ProgramSettings | null
  handleSettingsFieldChange: (field: keyof ProgramSettings, value: string | number | boolean) => void
  handleSaveSettings: (e: React.FormEvent) => void
  updatingSettings: boolean
}

export function DataTable({
  clients,
  fetchingClients,
  handleDeleteClient,
  reloadClients,

  codes,
  codesFilter,
  setCodesFilter,
  codesSearch,
  setCodesSearch,
  setCodesPage,
  handleCreateCode,
  newLinkName,
  setNewLinkName,
  newReferrerName,
  setNewReferrerName,
  newReferrerPhone,
  setNewReferrerPhone,
  newReferrerEmail,
  setNewReferrerEmail,
  creatingCode,
  handleCopyLink,
  handleWhatsAppShare,
  handleToggleCodeStatus,
  handleDeleteCode,

  pendingQueue,
  processingRewardId,
  handleApproveReward,
  handleRejectReward,

  conversions,
  convStageFilter,
  setConvStageFilter,
  convSearch,
  setConvSearch,
  setConvPage,
  formatDate,

  settings,
  handleSettingsFieldChange,
  handleSaveSettings,
  updatingSettings,
}: DataTableProps) {
  "use no memo"
  const [activeTab, setActiveTab] = React.useState<TabValue>("clients")

  // Client Purchase Dialog States
  const [selectedPartner, setSelectedPartner] = React.useState<ClientItem | null>(null)
  const [referredClientsDialogOpen, setReferredClientsDialogOpen] = React.useState(false)
  const [referredClients, setReferredClients] = React.useState<Client[]>([])
  const [loadingReferredClients, setLoadingReferredClients] = React.useState(false)
  const [selectedReferredClient, setSelectedReferredClient] = React.useState<Client | null>(null)
  const [isClientPurchasesOpen, setIsClientPurchasesOpen] = React.useState(false)

  // Global Invoice Creator States
  const [globalDialogOpen, setGlobalDialogOpen] = React.useState(false)
  const [globalClientSearch, setGlobalClientSearch] = React.useState("")
  const [globalClients, setGlobalClients] = React.useState<Client[]>([])
  const [loadingGlobalClients, setLoadingGlobalClients] = React.useState(false)

  // Local Client Filtering
  const [clientSearch, setClientSearch] = React.useState("")
  const [clientSourceFilter, setClientSourceFilter] = React.useState("all")

  const uniqueSources = React.useMemo(() => {
    const sourcesSet = new Set(clients.map((c) => c.source).filter(Boolean) as string[])
    return Array.from(sourcesSet)
  }, [clients])

  const filteredClients = React.useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.phone && c.phone !== "N/A" && c.phone.includes(clientSearch))
      const matchesSource = clientSourceFilter === "all" || c.source === clientSourceFilter
      return matchesSearch && matchesSource
    })
  }, [clients, clientSearch, clientSourceFilter])

  const fetchReferredClients = React.useCallback(async (partnerId: string) => {
    setLoadingReferredClients(true)
    try {
      const res = await fetch(`/api/admin/clients?referrerId=${partnerId}&limit=100`)
      const data = await res.json()
      if (data.success) {
        setReferredClients(data.users || [])
      } else {
        toast.error(data.error || "Failed to load referred clients")
      }
    } catch {
      toast.error("Error loading referred clients")
    } finally {
      setLoadingReferredClients(false)
    }
  }, [])

  const handleOpenPurchases = React.useCallback((partner: ClientItem) => {
    setSelectedPartner(partner)
    setReferredClientsDialogOpen(true)
    fetchReferredClients(partner._id)
  }, [fetchReferredClients])

  const fetchGlobalClients = React.useCallback(async (searchQuery: string) => {
    setLoadingGlobalClients(true)
    try {
      const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await res.json()
      if (data.success) {
        setGlobalClients(data.users || [])
      }
    } catch {
      toast.error("Error searching clients")
    } finally {
      setLoadingGlobalClients(false)
    }
  }, [])

  React.useEffect(() => {
    if (globalDialogOpen) {
      fetchGlobalClients(globalClientSearch)
    }
  }, [globalDialogOpen, globalClientSearch, fetchGlobalClients])

  const handlePurchaseAdded = () => {
    reloadClients()
  }

  // User Profile Panel State
  const [selectedProfileClient, setSelectedProfileClient] = React.useState<ClientItem | null>(null)
  const [profileLoading, setProfileLoading] = React.useState(false)
  const [profileStats, setProfileStats] = React.useState({ purchase: 0, sale: 0, commission: 0, cashEarned: 0 })
  const [profileCodes, setProfileCodes] = React.useState<CodeItem[]>([])
  const [profileNewLinkName, setProfileNewLinkName] = React.useState("")
  const [profileCreatingCode, setProfileCreatingCode] = React.useState(false)
  const [profileFirstName, setProfileFirstName] = React.useState("")
  const [profileLastName, setProfileLastName] = React.useState("")
  const [profileEmail, setProfileEmail] = React.useState("")
  const [profilePhone, setProfilePhone] = React.useState("")
  const [profileStatus, setProfileStatus] = React.useState("")
  const [profilePassword, setProfilePassword] = React.useState("")
  const [profileEmailVerified, setProfileEmailVerified] = React.useState(false)
  const [profileUpdating, setProfileUpdating] = React.useState(false)

  const fetchProfile = React.useCallback(async (clientId: string) => {
    setProfileLoading(true)
    try {
      const res = await fetch(`/api/admin/referrals/users/${clientId}`)
      const data = await res.json()
      if (res.ok && data.user) {
        setProfileStats(data.stats)
        setProfileCodes(data.referralCodes || [])
        setProfileEmailVerified(!!data.user.emailVerified)
      } else {
        toast.error(data.error || "Failed to load user profile")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred")
    } finally {
      setProfileLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (selectedProfileClient) {
      fetchProfile(selectedProfileClient._id)
      const parts = selectedProfileClient.name.split(" ")
      setProfileFirstName(parts[0] || "")
      setProfileLastName(parts.slice(1).join(" ") || "")
      setProfileEmail(selectedProfileClient.email || "")
      setProfilePhone(selectedProfileClient.phone || "")
      setProfileStatus(selectedProfileClient.status || "active")
      setProfilePassword("")
      setProfileEmailVerified(false)
    }
  }, [selectedProfileClient, fetchProfile])

  const handleToggleProfileCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/referrals/codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      if (res.ok && selectedProfileClient) {
        toast.success(`Referral code status updated.`)
        fetchProfile(selectedProfileClient._id)
        reloadClients()
      } else {
        throw new Error()
      }
    } catch {
      toast.error("Failed to toggle code status.")
    }
  }

  const handleGenerateProfileCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfileClient) return
    if (!profileNewLinkName) {
      toast.error("Please provide a name for this referral link.")
      return
    }
    setProfileCreatingCode(true)
    try {
      const res = await fetch("/api/admin/referrals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkName: profileNewLinkName,
          userId: selectedProfileClient._id
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Referral link generated successfully!")
        setProfileNewLinkName("")
        fetchProfile(selectedProfileClient._id)
      } else {
        throw new Error(data.error || "Creation failed.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create code.")
    } finally {
      setProfileCreatingCode(false)
    }
  }

  const handleUpdateProfileClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfileClient) return
    setProfileUpdating(true)
    try {
      const payload: Record<string, any> = {
        firstName: profileFirstName,
        lastName: profileLastName,
        email: profileEmail,
        phone: profilePhone,
        status: profileStatus,
        emailVerified: profileEmailVerified,
      }
      if (profilePassword) {
        payload.password = profilePassword
      }
      const res = await fetch(`/api/admin/referrals/users/${selectedProfileClient._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("User profile updated successfully!")
        setSelectedProfileClient(null)
        reloadClients()
      } else {
        throw new Error(data.error || "Update failed.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.")
    } finally {
      setProfileUpdating(false)
    }
  }

  // Tanstack Table setup dynamically configured per active view
  const currentColumns = React.useMemo(() => {
    if (activeTab === "clients") {
      return getClientColumns(handleOpenPurchases, handleDeleteClient, (client) => setSelectedProfileClient(client))
    }
    if (activeTab === "codes") {
      return getCodeColumns(handleToggleCodeStatus, handleDeleteCode, handleCopyLink, handleWhatsAppShare)
    }
    if (activeTab === "conversions") {
      return getConversionColumns(formatDate)
    }
    if (activeTab === "pending") {
      return getPendingColumns(handleApproveReward, handleRejectReward, processingRewardId)
    }
    return []
  }, [activeTab, processingRewardId, handleDeleteClient, handleToggleCodeStatus, handleDeleteCode, handleCopyLink, handleWhatsAppShare, formatDate, handleApproveReward, handleRejectReward, handleOpenPurchases])

  const currentData = React.useMemo(() => {
    if (activeTab === "clients") return filteredClients
    if (activeTab === "codes") return codes
    if (activeTab === "conversions") return conversions
    if (activeTab === "pending") return pendingQueue
    return []
  }, [activeTab, filteredClients, codes, conversions, pendingQueue])

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data: currentData as TableItem[],
    columns: currentColumns as ColumnDef<TableItem>[],
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row: TableItem) => ('_id' in row ? row._id : 'redemptionId' in row ? row.redemptionId : String(Math.random())),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // dnd kit configuration
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => currentData?.map((item: TableItem) => '_id' in item ? item._id : 'redemptionId' in item ? item.redemptionId : String(Math.random())) || [],
    [currentData]
  )

  function handleDragEnd() {
    // Reordering isn't critical but we can support moving local state arrays
  }

  return (
    <div className="w-full space-y-6 pt-4">
      <div className="px-4 lg:px-6">
        <DataTableToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          table={table}
          clients={clients}
          pendingQueue={pendingQueue}
          setGlobalDialogOpen={setGlobalDialogOpen}
          clientSearch={clientSearch}
          setClientSearch={setClientSearch}
          clientSourceFilter={clientSourceFilter}
          setClientSourceFilter={setClientSourceFilter}
          uniqueSources={uniqueSources}
          codesSearch={codesSearch}
          setCodesSearch={setCodesSearch}
          setCodesPage={setCodesPage}
          codesFilter={codesFilter}
          setCodesFilter={setCodesFilter}
          convSearch={convSearch}
          setConvSearch={setConvSearch}
          setConvPage={setConvPage}
          convStageFilter={convStageFilter}
          setConvStageFilter={setConvStageFilter}
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
        />
      </div>

      {activeTab === "settings" ? (
        <div className="px-4 lg:px-6 mt-4">
          <SettingsTab
            settings={settings}
            handleSettingsFieldChange={handleSettingsFieldChange}
            handleSaveSettings={handleSaveSettings}
            updatingSettings={updatingSettings}
          />
        </div>
      ) : (
        <div className="px-4 lg:px-6 mt-4">
          <div className="overflow-hidden rounded-xl border border-border/10 bg-card/25 backdrop-blur-xl shadow-elegant">
            {fetchingClients && activeTab === "clients" ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <span className="text-xs">Fetching list...</span>
              </div>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
                id={sortableId}
              >
                <Table>
                  <TableHeader className="bg-muted/40 sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-border/10 hover:bg-transparent">
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} colSpan={header.colSpan} className="text-xs font-bold text-muted-foreground uppercase py-3">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      <SortableContext
                        items={dataIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {table.getRowModel().rows.map((row) => (
                          <DraggableRow key={row.id} row={row} />
                        ))}
                      </SortableContext>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={currentColumns.length}
                          className="h-24 text-center text-muted-foreground text-xs"
                        >
                          No results found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DndContext>
            )}
          </div>
          <DataTablePagination table={table} activeTab={activeTab} />
        </div>
      )}

      {/* Extracted Modals */}
      <ReferredClientsDialog
        isOpen={referredClientsDialogOpen}
        onOpenChange={setReferredClientsDialogOpen}
        selectedPartner={selectedPartner}
        referredClients={referredClients}
        loadingReferredClients={loadingReferredClients}
        onClientSelect={(client) => {
          setSelectedReferredClient(client)
          setIsClientPurchasesOpen(true)
        }}
      />

      {selectedReferredClient && (
        <ClientPurchasesDialog
          client={selectedReferredClient}
          isOpen={isClientPurchasesOpen}
          onOpenChange={(open) => {
            setIsClientPurchasesOpen(open)
            if (!open) {
              setSelectedReferredClient(null)
              reloadClients()
            }
          }}
        />
      )}

      <GlobalInvoiceDialog
        isOpen={globalDialogOpen}
        onOpenChange={setGlobalDialogOpen}
        globalClientSearch={globalClientSearch}
        setGlobalClientSearch={setGlobalClientSearch}
        loadingGlobalClients={loadingGlobalClients}
        globalClients={globalClients}
        onSuccess={handlePurchaseAdded}
      />

      <UserProfilePanel
        selectedProfileClient={selectedProfileClient}
        setSelectedProfileClient={setSelectedProfileClient}
        profileLoading={profileLoading}
        profileStats={profileStats}
        profileCodes={profileCodes}
        handleCopyLink={handleCopyLink}
        handleWhatsAppShare={handleWhatsAppShare}
        handleToggleProfileCodeStatus={handleToggleProfileCodeStatus}
        handleGenerateProfileCode={handleGenerateProfileCode}
        profileNewLinkName={profileNewLinkName}
        setProfileNewLinkName={setProfileNewLinkName}
        profileCreatingCode={profileCreatingCode}
        profileFirstName={profileFirstName}
        setProfileFirstName={setProfileFirstName}
        profileLastName={profileLastName}
        setProfileLastName={setProfileLastName}
        profileEmail={profileEmail}
        setProfileEmail={setProfileEmail}
        profilePhone={profilePhone}
        setProfilePhone={setProfilePhone}
        profileStatus={profileStatus}
        setProfileStatus={setProfileStatus}
        profilePassword={profilePassword}
        setProfilePassword={setProfilePassword}
        profileEmailVerified={profileEmailVerified}
        setProfileEmailVerified={setProfileEmailVerified}
        handleUpdateProfileClient={handleUpdateProfileClient}
        profileUpdating={profileUpdating}
      />
    </div>
  )
}
