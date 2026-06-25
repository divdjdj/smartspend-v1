"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  RefreshCw, 
  MessageCircle, 
  Trash2, 
  Eye, 
  Hourglass, 
  PhoneCall, 
  CheckCircle2, 
  ListIcon, 
  Loader2,
  Calendar,
  User,
  Mail,
  Phone,
  Bookmark,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface EnquiryItem {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  subscription?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'resolved' | 'ignored';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  contacted: number;
  resolved: number;
}

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, contacted: 0, resolved: 0 });
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch enquiries list from the API
  const fetchEnquiries = useCallback(async () => {
    await Promise.resolve(); // Defers state updates to avoid synchronous setState inside useEffect
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/enquiry?status=${status}&search=${encodeURIComponent(search)}&page=${page}&limit=10`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch enquiries.");
      }

      setEnquiries(data.enquiries);
      setTotalPages(data.pagination.pages);
      
      // Calculate simple stats based on loaded enquiries or global count if needed
      // To make stats real-time, we fetch all to aggregate for stats cards
      const allRes = await fetch(`/api/admin/enquiry?status=all&limit=500`);
      const allData = await allRes.json();
      if (allRes.ok && allData.enquiries) {
        const items = allData.enquiries as EnquiryItem[];
        setStats({
          total: items.length,
          pending: items.filter(i => i.status === 'pending').length,
          contacted: items.filter(i => i.status === 'contacted').length,
          resolved: items.filter(i => i.status === 'resolved').length,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to retrieve enquiries list.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    setTimeout(() => {
      fetchEnquiries();
    }, 0);
  }, [fetchEnquiries]);

  // Handle status update of an enquiry
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/enquiry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      toast.success("Enquiry status updated.");
      setEnquiries(prev => 
        prev.map(e => e._id === id ? { ...e, status: newStatus as EnquiryItem['status'] } : e)
      );
      
      // Update selected enquiry details if open
      if (selectedEnquiry?._id === id) {
        setSelectedEnquiry(prev => prev ? { ...prev, status: newStatus as EnquiryItem['status'] } : null);
      }

      // Re-trigger stats update
      fetchEnquiries();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status.";
      toast.error(message);
    }
  };

  // Handle notes saving
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/enquiry/${selectedEnquiry._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: adminNotes }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save admin notes.");
      }

      toast.success("Admin notes saved.");
      setEnquiries(prev => 
        prev.map(e => e._id === selectedEnquiry._id ? { ...e, notes: adminNotes } : e)
      );
      setSelectedEnquiry(prev => prev ? { ...prev, notes: adminNotes } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save notes.";
      toast.error(message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle deleting an enquiry
  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this enquiry?")) return;

    try {
      const res = await fetch(`/api/admin/enquiry/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete enquiry.");
      }

      toast.success("Enquiry deleted successfully.");
      setEnquiries(prev => prev.filter(e => e._id !== id));
      
      if (selectedEnquiry?._id === id) {
        setIsDetailsOpen(false);
      }

      fetchEnquiries();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete enquiry.";
      toast.error(message);
    }
  };

  // Open details modal
  const openDetails = (enquiry: EnquiryItem) => {
    setSelectedEnquiry(enquiry);
    setAdminNotes(enquiry.notes || "");
    setIsDetailsOpen(true);
  };

  // Render Status Badge
  const renderStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case "pending":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">Pending</Badge>;
      case "contacted":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">Contacted</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">Resolved</Badge>;
      case "ignored":
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border/10 font-medium">Ignored</Badge>;
      default:
        return <Badge variant="outline">{statusVal}</Badge>;
    }
  };

  // Format Date Helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pre-formatted WhatsApp link for support follow-up
  const getWhatsAppLink = (mobileNum: string, clientName: string, subOfInterest?: string) => {
    const rawNumber = mobileNum.replace(/[^\d]/g, "");
    
    // Construct message
    const msg = `Hello ${clientName},\n\nThis is SpentSmart Support. We received your request regarding the *${subOfInterest || "Premium"}* subscription package. We'd love to help you get set up!`;
    const encoded = encodeURIComponent(msg);
    
    return `https://wa.me/${rawNumber}?text=${encoded}`;
  };

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[40%] h-[40%] bg-teal-mid/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Enquiries Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, organize, and follow up on customer subscription requests.
          </p>
        </div>
        <button
          onClick={fetchEnquiries}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Total Card */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Enquiries</p>
            <h3 className="text-2xl font-bold font-display text-foreground mt-2">{stats.total}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <ListIcon className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-bold font-display text-destructive mt-2">{stats.pending}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive animate-pulse">
            <Hourglass className="h-5 w-5" />
          </div>
        </div>

        {/* Contacted Card */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacted</p>
            <h3 className="text-2xl font-bold font-display text-amber-400 mt-2">{stats.contacted}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <PhoneCall className="h-5 w-5" />
          </div>
        </div>

        {/* Resolved Card */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resolved</p>
            <h3 className="text-2xl font-bold font-display text-emerald-400 mt-2">{stats.resolved}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters and Actions Block */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-4 shadow-elegant flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-soft/30 border border-border/5 p-1 rounded-xl w-full md:w-auto">
          {["all", "pending", "contacted", "resolved", "ignored"].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setStatus(tab);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                status === tab
                  ? "bg-brand/10 text-brand shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-soft/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, phone, email, subscription..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-soft/50 border border-border/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span>Loading enquiries...</span>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground text-center px-4">
            <ListIcon className="h-12 w-12 opacity-30 text-brand" />
            <h4 className="font-semibold text-lg text-foreground">No Enquiries Found</h4>
            <p className="text-sm max-w-sm">
              We couldn&apos;t find any enquiries matching the selected criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/10 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4">Prospect</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Interested Package</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10 text-sm text-foreground">
                {enquiries.map(item => (
                  <tr key={item._id} className="hover:bg-soft/10 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                      {formatDate(item.createdAt)}
                    </td>
                    {/* User Details */}
                    <td className="px-6 py-4">
                      <div className="font-semibold">{item.name}</div>
                      {item.email ? (
                        <div className="text-xs text-muted-foreground mt-0.5">{item.email}</div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 italic">No email</span>
                      )}
                    </td>
                    {/* Mobile */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">
                      {item.mobile}
                    </td>
                    {/* Interested Package */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-brand">{item.subscription || "Generic Enquiry"}</span>
                    </td>
                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item._id, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="resolved">Resolved</option>
                          <option value="ignored">Ignored</option>
                        </select>
                        {renderStatusBadge(item.status)}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetails(item)}
                          title="View Details"
                          className="h-8 w-8 rounded-lg border border-border/15 bg-soft/20 text-foreground flex items-center justify-center hover:bg-brand/10 hover:text-brand transition-all cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <a
                          href={getWhatsAppLink(item.mobile, item.name, item.subscription)}
                          target="_blank"
                          rel="noreferrer"
                          title="Chat on WhatsApp"
                          className="h-8 w-8 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteEnquiry(item._id)}
                          title="Delete Enquiry"
                          className="h-8 w-8 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-all cursor-pointer"
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

        {/* Pagination controls */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-border/10 p-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border/15 text-xs text-foreground bg-soft/10 hover:bg-soft/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border/15 text-xs text-foreground bg-soft/10 hover:bg-soft/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl bg-card/90 border border-border/10 backdrop-blur-xl shadow-elegant text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              Enquiry Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              View customer submission data and write administrative follow-up notes.
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="grid gap-6 mt-4">
              {/* Customer Info Card */}
              <div className="grid gap-3.5 bg-soft/20 border border-border/5 rounded-xl p-4 text-sm">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold">{selectedEnquiry.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{selectedEnquiry.email || "No email address provided"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{selectedEnquiry.mobile}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                  <Bookmark className="h-4 w-4 text-brand shrink-0" />
                  <span>
                    Interested: <span className="text-brand font-semibold">{selectedEnquiry.subscription || "Generic enquiry"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground border-t border-border/5 pt-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Submitted on {formatDate(selectedEnquiry.createdAt)}</span>
                </div>
              </div>

              {/* Customer Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Customer Message
                </label>
                <div className="bg-soft/10 border border-border/5 p-4 rounded-xl text-sm italic min-h-[70px] whitespace-pre-wrap">
                  {selectedEnquiry.message ? `"${selectedEnquiry.message}"` : "(No message included)"}
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between gap-4 border-y border-border/5 py-4">
                <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-xs">
                  Enquiry Status
                </div>
                <div className="flex gap-2">
                  {['pending', 'contacted', 'resolved', 'ignored'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedEnquiry._id, s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize cursor-pointer transition-all ${
                        selectedEnquiry.status === s
                          ? s === 'pending' ? 'bg-destructive/15 text-destructive font-bold'
                            : s === 'contacted' ? 'bg-amber-500/15 text-amber-400 font-bold'
                            : s === 'resolved' ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                            : 'bg-soft/50 text-foreground font-bold'
                          : 'text-muted-foreground hover:bg-soft/20 hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Administrative Notes (Private)
                </label>
                <textarea
                  rows={4}
                  placeholder="Record call discussion details, package pricing quote, payment details, next follow-up dates..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="w-full bg-soft/50 border border-border/10 rounded-xl px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <a
                  href={getWhatsAppLink(selectedEnquiry.mobile, selectedEnquiry.name, selectedEnquiry.subscription)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 shadow-sm hover:bg-emerald-500/25 transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" /> Follow Up on WhatsApp
                </a>
                <button
                  type="button"
                  disabled={savingNotes}
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {savingNotes ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
                      Saving...
                    </>
                  ) : (
                    "Save Notes"
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
