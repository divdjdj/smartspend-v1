"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  FileText, 
  RefreshCw, 
  Loader2, 
  Calendar,  
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InvoiceItem {
  service_name: string;
  amount: number;
  quantity?: number;
}

interface Invoice {
  _id: string;
  invoice_number: string;
  items: InvoiceItem[];
  amount: number;
  discount_applied?: number;
  tax_amount?: number;
  purchase_date: string;
  status: 'pending' | 'paid' | 'cancelled';
}

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/clients/invoices");
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices || []);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error fetching client invoices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchInvoices();
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchInvoices();
    };
    loadData();
  }, [fetchInvoices]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const renderStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case "paid":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">Pending</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{statusVal}</Badge>;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoice(prev => (prev === id ? null : id));
  };

  const handlePrint = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.service_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.amount)}</td>
      </tr>
    `).join('');

    const discountHtml = invoice.discount_applied 
      ? `<tr>
          <td colspan="2" style="padding: 8px 12px; text-align: right; font-weight: bold; color: #ef4444;">Discount Applied:</td>
          <td style="padding: 8px 12px; text-align: right; color: #ef4444;">-${formatCurrency(invoice.discount_applied)}</td>
         </tr>`
      : '';

    const printContent = `
      <html>
        <head>
          <title>Invoice - ${invoice.invoice_number}</title>
          <style>
            body { font-family: sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #020617; }
            .details { margin: 20px 0; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th { background: #f8fafc; padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
            .total { font-size: 18px; font-weight: bold; text-align: right; padding-top: 20px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
            .paid { background: #d1fae5; color: #065f46; }
            .pending { background: #fef3c7; color: #92400e; }
            .cancelled { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div>
              <div class="logo">SpendSmart</div>
              <p>Premium Subscription Hub</p>
            </div>
            <div style="text-align: right;">
              <h2>INVOICE</h2>
              <p>Invoice #: <strong>${invoice.invoice_number}</strong></p>
              <p>Date: ${formatDate(invoice.purchase_date)}</p>
              <div style="margin-top: 8px;">
                <span class="badge ${invoice.status}">${invoice.status}</span>
              </div>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              ${discountHtml}
              <tr>
                <td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 16px;">Total Paid:</td>
                <td style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 16px; border-top: 2px solid #333;">${formatCurrency(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 50px; font-size: 12px; color: #666; text-align: center; border-top: 1px dashed #ddd; padding-top: 20px;">
            Thank you for choosing SpendSmart. If you have any questions, please contact support.
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Metrics calculations
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const totalCount = invoices.length;

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-2">
            Invoices & Billing
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review your purchase history, billing logs, and download/print receipts.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl">
          {/* Card 1: Total Paid */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Paid</span>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalPaid)}</h3>
            </div>
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Total Pending */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Pending</span>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(totalPending)}</h3>
            </div>
            <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Invoices Count */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Invoices</span>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{totalCount}</h3>
            </div>
            <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="max-w-6xl">
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-5">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-brand" /> Invoice History
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Detailed log of all subscription payments and renewals.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <span>Fetching billing records...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="bg-soft/10 border border-border/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">No Invoices Found</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">Invoices appear here once subscription purchases are approved.</p>
              </div>
            </div>
          ) : (
            <div className="border border-border/10 bg-soft/5 rounded-2xl overflow-hidden divide-y divide-border/10">
              {invoices.map(inv => (
                <div key={inv._id} className="transition-all hover:bg-soft/10">
                  {/* Row Header Accordion */}
                  <div 
                    onClick={() => toggleExpand(inv._id)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-brand/10 border border-brand/20 text-brand rounded-lg flex items-center justify-center hidden sm:flex">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {inv.invoice_number}
                          {renderStatusBadge(inv.status)}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(inv.purchase_date)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Total Amount</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(inv.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 hover:bg-soft/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(inv);
                          }}
                        >
                          <Printer className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        {expandedInvoice === inv._id ? (
                          <ChevronUp className="h-4.5 w-4.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4.5 w-4.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Accordion */}
                  {expandedInvoice === inv._id && (
                    <div className="bg-soft/10 p-5 space-y-4 border-t border-border/5">
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-brand uppercase tracking-wider flex items-center gap-1">
                          <Info className="h-3 w-3" /> Purchased Services
                        </h5>
                        <div className="border border-border/10 rounded-xl overflow-hidden divide-y divide-border/10 bg-card/10">
                          {inv.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 text-xs">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-foreground">{item.service_name}</span>
                                <span className="text-[10px] text-muted-foreground block">Qty: {item.quantity || 1}</span>
                              </div>
                              <span className="font-bold text-foreground">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Calculation */}
                      <div className="flex flex-col items-end gap-1.5 text-xs text-muted-foreground pr-3">
                        {inv.discount_applied ? (
                          <div className="flex gap-4">
                            <span>Discount Applied:</span>
                            <span className="text-destructive font-semibold">-{formatCurrency(inv.discount_applied)}</span>
                          </div>
                        ) : null}
                        {inv.tax_amount ? (
                          <div className="flex gap-4">
                            <span>Taxes:</span>
                            <span className="font-semibold text-foreground">{formatCurrency(inv.tax_amount)}</span>
                          </div>
                        ) : null}
                        <div className="flex gap-4 border-t border-border/15 pt-1.5 text-sm font-bold text-foreground">
                          <span>Total Paid:</span>
                          <span>{formatCurrency(inv.amount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
