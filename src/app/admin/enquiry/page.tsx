"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Import modular components
import { EnquiryStats } from "@/components/admin/enquiry/enquiry-stats";
import { EnquiryFilters } from "@/components/admin/enquiry/enquiry-filters";
import { EnquiryTable } from "@/components/admin/enquiry/enquiry-table";
import { EnquiryDetailsDialog } from "@/components/admin/enquiry/enquiry-details-dialog";

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
  const [dateRange, setDateRange] = useState("all");
  const [subscription, setSubscription] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
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
        `/api/admin/enquiry?status=${status}&search=${encodeURIComponent(search)}&dateRange=${dateRange}&subscription=${encodeURIComponent(subscription)}&sort=${sortOrder}&page=${page}&limit=10`
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
  }, [status, search, dateRange, subscription, sortOrder, page]);

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

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight text-foreground">
            Enquiries Manager
          </h2>
        </div>
        <Button
          onClick={fetchEnquiries}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <EnquiryStats stats={stats} />

      {/* Filters and Actions Block */}
      <EnquiryFilters
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        dateRange={dateRange}
        setDateRange={setDateRange}
        subscription={subscription}
        setSubscription={setSubscription}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        setPage={setPage}
      />

      {/* Main Table */}
      <EnquiryTable
        enquiries={enquiries}
        loading={loading}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        handleStatusChange={handleStatusChange}
        openDetails={openDetails}
        handleDeleteEnquiry={handleDeleteEnquiry}
      />

      {/* Detailed View Modal */}
      <EnquiryDetailsDialog
        selectedEnquiry={selectedEnquiry}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        savingNotes={savingNotes}
        handleSaveNotes={handleSaveNotes}
        handleStatusChange={handleStatusChange}
      />
    </div>
  );
}
