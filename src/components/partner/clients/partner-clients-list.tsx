'use client';

import * as React from "react"
import { Loader2, Mail, Phone, Calendar, Receipt } from "lucide-react"
import { Client } from "@/types"
import { Button } from "@/components/ui/button"
import ClientPurchasesDialog from "@/components/admin/clients/client-purchases-dialog"

interface PartnerClientsListProps {
  clients: Client[]
  loading: boolean
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "contacted", label: "Contacted", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "resolved", label: "Resolved", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { value: "ignored", label: "Ignored", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
  { value: "active", label: "Active", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "inactive", label: "Inactive", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
]

export function PartnerClientsList({ clients, loading }: PartnerClientsListProps) {
  const [clientList, setClientList] = React.useState<Client[]>([])
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null)
  const [isPurchasesOpen, setIsPurchasesOpen] = React.useState(false)

  React.useEffect(() => {
    // Auto-correct client status in frontend state if they have purchases
    const correctedClients = clients.map(client => {
      const hasInvoices = client.purchase !== undefined && client.purchase > 0;
      if (hasInvoices && client.status !== "active" && client.status !== "inactive") {
        return { ...client, status: "active" as any };
      }
      return client;
    });
    setClientList(correctedClients);
  }, [clients])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || { label: status, color: "text-muted-foreground bg-muted border-border" }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Client Details</h4>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : clientList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border border-dashed border-border/10 rounded-xl">
          No referred clients yet. Share your link to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {clientList.map(client => {
            const statusInfo = getStatusInfo(client.status || "active")
            
            return (
              <div
                key={client._id}
                className="p-4 border border-border/10 rounded-xl bg-card/40 hover:bg-card/75 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <p className="font-bold text-foreground text-base">{client.name}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {client.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {client.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {client.mobile}
                      </span>
                      {client.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Joined {formatDate(client.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center mt-2 sm:mt-0">
                    {/* Lifetime purchases badge */}
                    {client.purchase !== undefined && client.purchase > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Purchases</span>
                        <span className="text-sm font-semibold text-brand px-2.5 py-1 bg-brand/5 border border-brand/10 rounded-lg mt-0.5">
                          {formatCurrency(client.purchase)}
                        </span>
                      </div>
                    )}

                    {/* Status inline badge (Read-Only) */}
                    <div className="flex flex-col items-end ml-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                      <div className={`h-8 px-3 mt-0.5 flex items-center justify-center text-xs font-medium rounded-lg border capitalize ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* View Invoices button */}
                    <div className="flex flex-col items-end ml-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold text-right w-full">Invoices</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client)
                          setIsPurchasesOpen(true)
                        }}
                        className="h-8 px-3 mt-0.5 inline-flex items-center gap-1.5 text-xs border border-border/15 hover:bg-soft/10 text-foreground cursor-pointer rounded-lg font-semibold"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {selectedClient && (
        <ClientPurchasesDialog
          client={selectedClient}
          isOpen={isPurchasesOpen}
          onOpenChange={setIsPurchasesOpen}
          readOnly={true}
          apiUrl="/api/partner/invoices"
        />
      )}
    </div>
  )
}
