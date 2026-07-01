'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Receipt, Eye, RefreshCw, ShoppingCart, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CreateInvoiceDialog from './create-invoice-dialog';
import InvoiceDetailsDialog from './invoice-details-dialog';
import { Client, Invoice } from '@/types';

interface ClientPurchasesDialogProps {
  client: Client;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  apiUrl?: string;
}

export default function ClientPurchasesDialog({
  client,
  isOpen,
  onOpenChange,
  readOnly = false,
  apiUrl = '/api/admin/invoices',
}: ClientPurchasesDialogProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!client?._id) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}?clientId=${client._id}&limit=50`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch purchases.');
      }
      setInvoices(data.invoices || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve invoices.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (isOpen && client?._id) {
      fetchInvoices();
    }
  }, [isOpen, client, fetchInvoices]);

  const handleViewReceipt = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium capitalize">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium capitalize">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium capitalize">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl bg-card/95 border border-border/10 backdrop-blur-xl shadow-elegant text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row justify-between items-start border-b border-border/10 pb-4">
            <div>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-brand" />
                Purchases & Invoices
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-1">
                Purchased services history and invoice records for <strong className="text-foreground">{client?.name}</strong>.
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchInvoices}
                className="px-3 py-1.5 h-8 text-[11px] rounded-lg border border-border/15 bg-transparent hover:bg-soft/10 text-foreground flex items-center gap-1 cursor-pointer transition-all"
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Reload
              </Button>
              {!readOnly && (
                <Button
                  onClick={() => setIsCreateInvoiceOpen(true)}
                  className="px-3 py-1.5 h-8 text-[11px] rounded-lg bg-brand hover:bg-brand/90 text-white flex items-center gap-1 cursor-pointer shadow-soft transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Invoice
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="py-4">
            {loading && invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-brand" />
                <span>Retrieving client purchases ledger...</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground text-center">
                <ShoppingCart className="h-10 w-10 opacity-30 text-brand" />
                <h4 className="font-semibold text-sm text-foreground">No Purchases Recorded</h4>
                <p className="text-xs max-w-xs">
                  {readOnly 
                    ? "This client has not purchased any services or apps yet."
                    : "This client has not purchased any services or apps yet. Click \"New Invoice\" to issue their first bill."}
                </p>
              </div>
            ) : (
              <div className="border border-border/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/10 bg-soft/20 text-muted-foreground font-semibold">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Invoice Number</th>
                        <th className="px-4 py-3">Items / Services</th>
                        <th className="px-4 py-3">Grand Total</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5 text-foreground">
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-soft/5">
                          <td className="px-4 py-3 font-mono text-[10px] whitespace-nowrap text-muted-foreground">
                            {formatDate(inv.purchase_date || inv.createdAt || "")}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-foreground">
                            {inv.invoice_number}
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                            {inv.items?.map((i) => i.service_name).join(', ') || 'Service Purchase'}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-brand">
                            ₹{inv.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getStatusBadge(inv.status)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button
                              onClick={() => handleViewReceipt(inv)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border/15 bg-card/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-card/70 transition-all cursor-pointer"
                            >
                              <Eye className="h-3 w-3" /> View Receipt
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-border/10 pt-4 mt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-card/70 transition-all"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render Sub-Dialogs */}
      {client && !readOnly && (
        <CreateInvoiceDialog
          client={client}
          isOpen={isCreateInvoiceOpen}
          onOpenChange={setIsCreateInvoiceOpen}
          onSuccess={fetchInvoices}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailsDialog
          invoice={selectedInvoice}
          isOpen={isInvoiceDetailsOpen}
          onOpenChange={setIsInvoiceDetailsOpen}
        />
      )}
    </>
  );
}
