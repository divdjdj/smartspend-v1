"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
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

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  Search,
  Plus,
  Loader2,
  User as UserIcon,
  Settings,
  IndianRupee,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  Clipboard,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

import {
  getClientColumns,
  getCodeColumns,
  getConversionColumns,
  getPendingColumns,
} from "./data-table-parts/columns"
import { DraggableRow } from "./data-table-parts/draggable-row"
import type { ClientItem, CodeItem, ConversionItem, PendingApprovalItem, ProgramSettings } from "./data-table-parts/schema"
import { PurchaseHistoryDialog } from "../referral/purchase-history-dialog"
import { GlobalPurchaseDialog } from "../referral/global-purchase-dialog"
import { SettingsTab } from "../referral/settings-tab"
const chartData = [
  { month: "Jan", signups: 5, purchases: 2 },
  { month: "Feb", signups: 12, purchases: 6 },
  { month: "Mar", signups: 8, purchases: 4 },
  { month: "Apr", signups: 15, purchases: 9 },
  { month: "May", signups: 20, purchases: 12 },
  { month: "Jun", signups: 28, purchases: 18 },
]

const chartConfig = {
  signups: {
    label: "Signups",
    color: "var(--primary)",
  },
  purchases: {
    label: "Purchases",
    color: "var(--brand)",
  },
} satisfies ChartConfig

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
  const [activeTab, setActiveTab] = React.useState<"clients" | "codes" | "conversions" | "pending" | "settings">("clients")

  // Client Purchase Dialog States
  const [selectedClient, setSelectedClient] = React.useState<ClientItem | null>(null)
  const [purchases, setPurchases] = React.useState<any[]>([])
  const [loadingPurchases, setLoadingPurchases] = React.useState(false)
  const [globalDialogOpen, setGlobalDialogOpen] = React.useState(false)

  // Local Client Filtering
  const [clientSearch, setClientSearch] = React.useState("")
  const [clientSourceFilter, setClientSourceFilter] = React.useState("all")

  const uniqueSources = React.useMemo(() => {
    const sourcesSet = new Set(clients.map((c) => c.source).filter(Boolean))
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

  const fetchPurchases = async (clientId: string) => {
    setLoadingPurchases(true)
    try {
      const res = await fetch(`/api/admin/referrals/purchases?clientId=${clientId}`)
      const data = await res.json()
      if (data.success) {
        setPurchases(data.purchases)
      } else {
        toast.error(data.error || "Failed to load purchases")
      }
    } catch {
      toast.error("Error loading purchases")
    } finally {
      setLoadingPurchases(false)
    }
  }

  const handleOpenPurchases = (client: ClientItem) => {
    setSelectedClient(client)
    fetchPurchases(client._id)
  }

  const handlePurchaseAdded = () => {
    if (selectedClient) {
      fetchPurchases(selectedClient._id)
    }
    reloadClients()
  }

  // User Profile Panel State
  const [selectedProfileClient, setSelectedProfileClient] = React.useState<ClientItem | null>(null)
  const [profileActiveTab, setProfileActiveTab] = React.useState<"personal" | "earnings" | "settings">("personal")
  const [profileLoading, setProfileLoading] = React.useState(false)
  const [profileStats, setProfileStats] = React.useState({ purchase: 0, sale: 0, commission: 0, cashEarned: 0 })
  const [profileCodes, setProfileCodes] = React.useState<any[]>([])
  const [profileNewLinkName, setProfileNewLinkName] = React.useState("")
  const [profileCreatingCode, setProfileCreatingCode] = React.useState(false)

  const fetchProfile = React.useCallback(async (clientId: string) => {
    setProfileLoading(true)
    try {
      const res = await fetch(`/api/admin/referrals/users/${clientId}`)
      const data = await res.json()
      if (res.ok && data.user) {
        setProfileStats(data.stats)
        setProfileCodes(data.referralCodes || [])
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
      setProfileActiveTab("personal")
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

  const [profileFirstName, setProfileFirstName] = React.useState("")
  const [profileLastName, setProfileLastName] = React.useState("")
  const [profileEmail, setProfileEmail] = React.useState("")
  const [profilePhone, setProfilePhone] = React.useState("")
  const [profileStatus, setProfileStatus] = React.useState("")
  const [profileUpdating, setProfileUpdating] = React.useState(false)

  React.useEffect(() => {
    if (selectedProfileClient) {
      const parts = selectedProfileClient.name.split(" ")
      setProfileFirstName(parts[0] || "")
      setProfileLastName(parts.slice(1).join(" ") || "")
      setProfileEmail(selectedProfileClient.email || "")
      setProfilePhone(selectedProfileClient.phone || "")
      setProfileStatus(selectedProfileClient.status || "active")
    }
  }, [selectedProfileClient])

  const handleUpdateProfileClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfileClient) return
    setProfileUpdating(true)
    try {
      const res = await fetch(`/api/admin/referrals/users/${selectedProfileClient._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileFirstName,
          lastName: profileLastName,
          email: profileEmail,
          phone: profilePhone,
          status: profileStatus,
        })
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
      return getClientColumns(handleOpenPurchases, handleDeleteClient, (client) => setSelectedProfileClient(client)) as any
    }
    if (activeTab === "codes") {
      return getCodeColumns(handleToggleCodeStatus, handleDeleteCode, handleCopyLink, handleWhatsAppShare) as any
    }
    if (activeTab === "conversions") {
      return getConversionColumns(formatDate) as any
    }
    if (activeTab === "pending") {
      return getPendingColumns(handleApproveReward, handleRejectReward, processingRewardId) as any
    }
    return []
  }, [activeTab, processingRewardId])

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
    data: currentData,
    columns: currentColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row: any) => row._id,
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
    () => currentData?.map(({ _id }: any) => _id) || [],
    [currentData]
  )

  function handleDragEnd(event: DragEndEvent) {
    // Reordering isn't critical but we can support moving local state arrays
  }

  return (
    <div className="w-full space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => setActiveTab(val)}
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 lg:px-6 gap-4">
          <TabsList className="bg-card/25 backdrop-blur-xl border border-border/10">
            <TabsTrigger value="clients" className="relative">
              Clients
              {clients.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-brand/20 text-brand hover:bg-brand/20">
                  {clients.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="codes">Codes</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="pending">
              Approvals
              {pendingQueue.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingQueue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeTab === "clients" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGlobalDialogOpen(true)}
                className="bg-brand hover:brightness-110 h-9 gap-1.5"
              >
                <Plus className="size-4" />
                Record Purchase
              </Button>
            )}
            
            {activeTab !== "settings" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Columns3Icon data-icon="inline-start" className="size-4" />
                    Columns
                    <ChevronDownIcon data-icon="inline-end" className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" &&
                        column.getCanHide()
                    )
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <TabsContent value="settings" className="px-4 lg:px-6">
          <SettingsTab
            settings={settings}
            handleSettingsFieldChange={handleSettingsFieldChange}
            handleSaveSettings={handleSaveSettings}
            updatingSettings={updatingSettings}
          />
        </TabsContent>

        <TabsContent value={activeTab} className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          {/* Header Controls for Table Views */}
          {activeTab !== "settings" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl">
              <h3 className="font-bold text-sm tracking-wide text-foreground uppercase">
                {activeTab === "clients" && "Partner Directory"}
                {activeTab === "codes" && "Generated Referral Links"}
                {activeTab === "conversions" && "Conversions Ledger"}
                {activeTab === "pending" && "Pending Approval Queue"}
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {activeTab === "clients" && (
                  <>
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search partners..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="pl-8 bg-background border-border/15 h-9 text-xs"
                      />
                    </div>
                    <Select value={clientSourceFilter} onValueChange={setClientSourceFilter}>
                      <SelectTrigger className="bg-background border-border/15 h-9 text-xs w-full sm:w-40">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {uniqueSources.map((src) => (
                          <SelectItem key={src} value={src}>
                            {src}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {activeTab === "codes" && (
                  <>
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search codes..."
                        value={codesSearch}
                        onChange={(e) => {
                          setCodesSearch(e.target.value)
                          setCodesPage(1)
                        }}
                        className="pl-8 bg-background border-border/15 h-9 text-xs"
                      />
                    </div>
                    <Select
                      value={codesFilter}
                      onValueChange={(val) => {
                        setCodesFilter(val)
                        setCodesPage(1)
                      }}
                    >
                      <SelectTrigger className="bg-background border-border/15 h-9 text-xs w-full sm:w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                {activeTab === "conversions" && (
                  <>
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search conversions..."
                        value={convSearch}
                        onChange={(e) => {
                          setConvSearch(e.target.value)
                          setConvPage(1)
                        }}
                        className="pl-8 bg-background border-border/15 h-9 text-xs"
                      />
                    </div>
                    <Select
                      value={convStageFilter}
                      onValueChange={(val) => {
                        setConvStageFilter(val)
                        setConvPage(1)
                      }}
                    >
                      <SelectTrigger className="bg-background border-border/15 h-9 text-xs w-full sm:w-40">
                        <SelectValue placeholder="All Stages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        <SelectItem value="clicked">Clicked</SelectItem>
                        <SelectItem value="signed_up">Signed Up</SelectItem>
                        <SelectItem value="purchased">Purchased</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "codes" && (
            <div className="bg-card/25 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Generate New Referral Code</h4>
              <form onSubmit={handleCreateCode} className="grid gap-3 sm:grid-cols-5 items-end">
                <div>
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Link Name</Label>
                  <Input
                    placeholder="e.g. Summer Promo"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Client Name</Label>
                  <Input
                    placeholder="Jane Doe"
                    value={newReferrerName}
                    onChange={(e) => setNewReferrerName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Client Phone</Label>
                  <Input
                    placeholder="+91..."
                    value={newReferrerPhone}
                    onChange={(e) => setNewReferrerPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Client Email</Label>
                  <Input
                    placeholder="user@example.com"
                    value={newReferrerEmail}
                    onChange={(e) => setNewReferrerEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={creatingCode}
                  className="h-9 bg-brand text-primary-foreground font-bold text-xs"
                >
                  {creatingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                </Button>
              </form>
            </div>
          )}

          {activeTab !== "settings" && (
            <div className="overflow-hidden rounded-xl border border-border/10 bg-card/25 backdrop-blur-xl shadow-elegant">
              {fetchingClients && activeTab === "clients" ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  <span className="text-xs">Fetching clients list...</span>
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
                            <DraggableRow key={row.id} row={row as any} />
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
          )}

          {activeTab !== "settings" && (
            <div className="flex items-center justify-between px-4 mt-2">
              <div className="hidden flex-1 text-xs text-muted-foreground lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-xs font-semibold text-muted-foreground">
                    Rows per page
                  </Label>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger size="sm" className="w-20 h-8 text-xs bg-background" id="rows-per-page">
                      <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      <SelectGroup>
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-xs font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronsLeftIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex p-0"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronsRightIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PurchaseHistoryDialog
        selectedClient={selectedClient}
        onClose={() => setSelectedClient(null)}
        purchases={purchases}
        loadingPurchases={loadingPurchases}
        allClients={clients}
        onPurchaseAdded={handlePurchaseAdded}
      />

      <GlobalPurchaseDialog
        isOpen={globalDialogOpen}
        onClose={() => setGlobalDialogOpen(false)}
        allClients={clients}
        onPurchaseAdded={handlePurchaseAdded}
      />

      <Sheet open={!!selectedProfileClient} onOpenChange={(open) => !open && setSelectedProfileClient(null)}>
        <SheetContent side="right" className="w-[450px] sm:max-w-[450px] overflow-y-auto bg-card border-border/10">
          {selectedProfileClient && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-display font-bold flex items-center gap-2 text-foreground">
                  <UserIcon className="h-5 w-5 text-brand" />
                  {selectedProfileClient.name}
                </SheetTitle>
                <SheetDescription className="text-xs font-mono">
                  ID: {selectedProfileClient._id} | Status: {selectedProfileClient.status}
                </SheetDescription>
              </SheetHeader>

              {profileLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  <span className="text-xs">Loading profile details...</span>
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {/* Tabs */}
                  <div className="flex border-b border-border/10">
                    {(["personal", "earnings", "settings"] as const).map(tab => (
                      <Button
                        key={tab}
                        variant="ghost"
                        onClick={() => setProfileActiveTab(tab)}
                        className={`px-4 py-2 text-xs capitalize rounded-none border-b-2 h-auto ${
                          profileActiveTab === tab
                            ? "border-brand text-brand font-bold"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab === "personal" && <UserIcon className="h-3.5 w-3.5 mr-1" />}
                        {tab === "earnings" && <IndianRupee className="h-3.5 w-3.5 mr-1" />}
                        {tab === "settings" && <Settings className="h-3.5 w-3.5 mr-1" />}
                        {tab}
                      </Button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {profileActiveTab === "personal" && (
                      <motion.div
                        key="personal"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 text-xs"
                      >
                        {/* Area Chart representation */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">Referral Activity</h4>
                          <p className="text-[10px] text-muted-foreground">Signups and conversions funnel tracked monthly</p>
                          <ChartContainer config={chartConfig} className="h-44 w-full mt-2">
                            <AreaChart
                              accessibilityLayer
                              data={chartData}
                              margin={{
                                left: 0,
                                right: 10,
                              }}
                            >
                              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                              <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                              />
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                              />
                              <Area
                                dataKey="signups"
                                type="natural"
                                fill="var(--color-signups)"
                                fillOpacity={0.2}
                                stroke="var(--color-signups)"
                                stackId="a"
                              />
                              <Area
                                dataKey="purchases"
                                type="natural"
                                fill="var(--color-purchases)"
                                fillOpacity={0.4}
                                stroke="var(--color-purchases)"
                                stackId="b"
                              />
                            </AreaChart>
                          </ChartContainer>
                        </div>

                        <Separator className="bg-border/10" />

                        {/* Interactive Edit Form */}
                        <form onSubmit={handleUpdateProfileClient} className="space-y-4">
                          <h4 className="font-bold text-xs uppercase tracking-wide text-muted-foreground">Edit Partner Information</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground uppercase font-bold">First Name</Label>
                              <Input
                                value={profileFirstName}
                                onChange={e => setProfileFirstName(e.target.value)}
                                className="h-9 text-xs bg-background"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground uppercase font-bold">Last Name</Label>
                              <Input
                                value={profileLastName}
                                onChange={e => setProfileLastName(e.target.value)}
                                className="h-9 text-xs bg-background"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Email Address</Label>
                            <Input
                              type="email"
                              value={profileEmail}
                              onChange={e => setProfileEmail(e.target.value)}
                              className="h-9 text-xs bg-background"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Phone Number</Label>
                            <Input
                              value={profilePhone}
                              onChange={e => setProfilePhone(e.target.value)}
                              className="h-9 text-xs bg-background"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Account Status</Label>
                            <Select value={profileStatus} onValueChange={setProfileStatus}>
                              <SelectTrigger className="h-9 text-xs bg-background">
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            type="submit"
                            disabled={profileUpdating}
                            className="w-full h-9 bg-brand text-primary-foreground font-bold text-xs mt-2"
                          >
                            {profileUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                          </Button>
                        </form>
                      </motion.div>
                    )}

                    {profileActiveTab === "earnings" && (
                      <motion.div
                        key="earnings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-3 gap-3"
                      >
                        <div className="bg-muted/30 border border-border/10 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Sales</p>
                          <h4 className="text-sm font-bold text-emerald-400">₹{profileStats.sale}</h4>
                        </div>
                        <div className="bg-muted/30 border border-border/10 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Commissions</p>
                          <h4 className="text-sm font-bold text-brand">₹{profileStats.commission}</h4>
                        </div>
                        <div className="bg-muted/30 border border-border/10 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Purchases</p>
                          <h4 className="text-sm font-bold text-foreground">₹{profileStats.purchase}</h4>
                        </div>
                      </motion.div>
                    )}

                    {profileActiveTab === "settings" && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 text-xs"
                      >
                        <div className="bg-muted/30 border border-border/10 rounded-xl p-4 space-y-3">
                          <h4 className="font-bold text-xs flex items-center gap-1">
                            <LinkIcon className="h-3.5 w-3.5 text-brand" /> Generate New Referral Link
                          </h4>
                          <form onSubmit={handleGenerateProfileCode} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Link Name</Label>
                              <Input
                                placeholder="e.g. YouTube Promo"
                                value={profileNewLinkName}
                                onChange={e => setProfileNewLinkName(e.target.value)}
                                className="h-8 text-xs bg-background"
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={profileCreatingCode || profileCodes.length >= 5}
                              className="h-8 px-3 bg-brand text-primary-foreground font-bold text-xs"
                            >
                              {profileCreatingCode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Generate"}
                            </Button>
                          </form>
                          {profileCodes.length >= 5 && (
                            <p className="text-[10px] text-destructive font-semibold mt-1">
                              Reached limit of 5 referral links.
                            </p>
                          )}
                        </div>

                        <div className="border border-border/10 rounded-xl overflow-hidden">
                          <div className="p-3 bg-muted/40 border-b border-border/10">
                            <h4 className="font-bold text-xs">Referral Links ({profileCodes.length})</h4>
                          </div>
                          {profileCodes.length === 0 ? (
                            <div className="py-6 text-center text-muted-foreground">No links generated yet.</div>
                          ) : (
                            <div className="divide-y divide-border/10 max-h-[220px] overflow-y-auto">
                              {profileCodes.map(c => (
                                <div key={c._id} className="p-3 space-y-2 hover:bg-muted/10 transition-colors">
                                  <div className="flex justify-between items-center">
                                    <div className="font-semibold text-foreground text-xs">{c.name || "N/A"}</div>
                                    <span className="font-mono text-brand font-bold text-xs">{c.code}</span>
                                  </div>
                                  <div className="flex justify-between items-center gap-2">
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        onClick={() => handleCopyLink(c.code)}
                                        className="h-6 px-1.5 text-[10px] bg-background hover:bg-muted"
                                        variant="outline"
                                      >
                                        Copy
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleWhatsAppShare(c.code)}
                                        className="h-6 px-1.5 text-[10px] border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                        variant="outline"
                                      >
                                        WhatsApp
                                      </Button>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => handleToggleProfileCodeStatus(c._id, c.is_active)}
                                      className="h-6 w-6 p-0 border-border/10 hover:bg-muted"
                                      variant="outline"
                                    >
                                      {c.is_active ? <ToggleRight className="h-4 w-4 text-brand" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

