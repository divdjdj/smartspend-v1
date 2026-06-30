import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { useSortable } from "@dnd-kit/sortable"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GripVerticalIcon,
  CircleCheckIcon,
  LoaderIcon,
  EllipsisVerticalIcon,
  ShoppingBag,
  Trash2,
  Copy,
  Share2,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"

import type { ClientItem, CodeItem, ConversionItem, PendingApprovalItem } from "./schema"

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Clients Columns
export const getClientColumns = (
  onOpenPurchases: (client: ClientItem) => void,
  onDeleteClient: (id: string) => void,
  onClientClick: (client: ClientItem) => void
): ColumnDef<ClientItem>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original._id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Client",
    cell: ({ row }) => (
      <div 
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onClientClick(row.original)
        }}
      >
        <div className="font-semibold text-foreground text-sm hover:underline">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.phone !== "N/A" ? row.original.phone : row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.source || "Direct"}
      </Badge>
    ),
  },
  {
    accessorKey: "purchase",
    header: "Purchases (Own)",
    cell: ({ row }) => (
      <div className="font-semibold text-sm">
        ₹{row.original.purchase || 0}
      </div>
    ),
  },
  {
    accessorKey: "sale",
    header: "Sales Driven",
    cell: ({ row }) => (
      <div className="font-semibold text-sm text-emerald-400">
        ₹{row.original.sale || 0}
      </div>
    ),
  },
  {
    accessorKey: "commission",
    header: "Commission",
    cell: ({ row }) => (
      <div className="font-bold text-sm text-brand">
        ₹{row.original.commission || 0}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 justify-end">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onOpenPurchases(row.original)
          }}
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Purchases</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground"
              size="icon"
            >
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              onClientClick(row.original)
            }}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteClient(row.original._id)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// Referral Codes Columns
export const getCodeColumns = (
  onToggleCodeStatus: (id: string, current: boolean) => void,
  onDeleteCode: (id: string) => void,
  onCopyLink: (code: string) => void,
  onWhatsAppShare: (code: string) => void
): ColumnDef<CodeItem>[] => [
  {
    accessorKey: "code",
    header: "Referral Link / Code",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm font-mono tracking-wider">{row.original.code}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{row.original.referrer?.name || "No Referrer"}</div>
      </div>
    ),
  },
  {
    accessorKey: "reward",
    header: "Referral Reward",
    cell: ({ row }) => {
      const { type, cashAmount, subscriptionMonths, referralBonus } = row.original.reward
      return (
        <div className="text-xs">
          <div>
            {type === 'cash' ? `₹${cashAmount} Cash` : `${subscriptionMonths} Mo. Subs`}
          </div>
          <div className="text-muted-foreground text-[10px]">
            Bonus: ₹{referralBonus}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "stats",
    header: "Performance Stats",
    cell: ({ row }) => (
      <div className="text-xs grid grid-cols-2 gap-x-2 gap-y-0.5 max-w-[180px]">
        <div>Clicks: <span className="font-semibold">{row.original.stats.clicks}</span></div>
        <div>Sales: <span className="font-semibold text-emerald-400">₹{row.original.stats.revenue}</span></div>
        <div>Signups: <span className="font-semibold">{row.original.stats.signups}</span></div>
        <div>Purchases: <span className="font-semibold">{row.original.stats.purchases}</span></div>
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Switch
          checked={row.original.is_active}
          onCheckedChange={() => onToggleCodeStatus(row.original._id, row.original.is_active)}
        />
        <span className="text-xs text-muted-foreground">
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 justify-end">
        <Button
          onClick={() => onCopyLink(row.original.code)}
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>Copy</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground"
              size="icon"
            >
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onWhatsAppShare(row.original.code)}>
              <Share2 className="mr-2 h-4 w-4 text-emerald-400" />
              WhatsApp Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteCode(row.original._id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// Conversions Columns
export const getConversionColumns = (
  formatDate: (dateStr: string) => string
): ColumnDef<ConversionItem>[] => [
  {
    accessorKey: "prospect",
    header: "Prospect (Customer)",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.prospect?.name || "Anonymous"}</div>
        <div className="text-xs text-muted-foreground">{row.original.prospect?.email || ""}</div>
      </div>
    ),
  },
  {
    accessorKey: "referrer",
    header: "Referrer / Partner",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.referrer?.name || "N/A"}</div>
        <div className="text-xs text-muted-foreground">{row.original.referrer?.email || ""}</div>
      </div>
    ),
  },
  {
    accessorKey: "referralCode",
    header: "Used Code",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono tracking-wider">
        {row.original.referralCode}
      </Badge>
    ),
  },
  {
    accessorKey: "conversionStage",
    header: "Stage / Status",
    cell: ({ row }) => (
      <Badge 
        className="capitalize text-xs" 
        variant={row.original.conversionStage === "purchased" ? "default" : "secondary"}
      >
        {row.original.conversionStage}
      </Badge>
    ),
  },
  {
    accessorKey: "purchaseDetails",
    header: "Amount Paid",
    cell: ({ row }) => {
      const details = row.original.purchaseDetails
      if (!details) return "-"
      return (
        <div className="text-xs">
          <div className="font-semibold text-emerald-400">₹{details.netAmount}</div>
          {details.grossAmount !== details.netAmount && (
            <div className="text-[10px] text-muted-foreground line-through">₹{details.grossAmount}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.createdAt || row.original.timeline?.clicked_at || ""),
  },
]

// Pending approvals queue columns
export const getPendingColumns = (
  handleApproveReward: (item: PendingApprovalItem) => void,
  handleRejectReward: (item: PendingApprovalItem) => void,
  processingRewardId: string | null
): ColumnDef<PendingApprovalItem>[] => [
  {
    accessorKey: "customerName",
    header: "Referrer Name",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm">{row.original.customerName}</div>
        <div className="text-xs text-muted-foreground">{row.original.customerEmail}</div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Reward Details",
    cell: ({ row }) => {
      const typeStr = row.original.type === "subscription_activation" ? "Subscription Activation" : "Cash Reward"
      const details = row.original.type === "subscription_activation" 
        ? `${row.original.months} Months` 
        : `₹${row.original.amount}`
      return (
        <div>
          <div className="font-semibold text-xs">{typeStr}</div>
          <div className="text-[11px] text-brand font-bold">{details}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Conversion Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString("en-IN"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isProcessing = processingRewardId === row.original.redemptionId
      return (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            onClick={() => handleApproveReward(row.original)}
            disabled={isProcessing}
            className="h-8 gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Approve</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleRejectReward(row.original)}
            disabled={isProcessing}
            variant="destructive"
            className="h-8 gap-1.5 text-xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Reject</span>
          </Button>
        </div>
      )
    },
  },
]

