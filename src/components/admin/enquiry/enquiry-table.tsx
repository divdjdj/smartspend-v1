import { Loader2, ListIcon, Eye, MessageCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface EnquiryTableProps {
  enquiries: EnquiryItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  handleStatusChange: (id: string, newStatus: string) => Promise<void>;
  openDetails: (item: EnquiryItem) => void;
  handleDeleteEnquiry: (id: string) => Promise<void>;
}

export function EnquiryTable({
  enquiries,
  loading,
  page,
  totalPages,
  setPage,
  handleStatusChange,
  openDetails,
  handleDeleteEnquiry,
}: EnquiryTableProps) {
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
    const msg = `Hello ${clientName},\n\nThis is SpentSmart Support. We received your request regarding the *${subOfInterest || "Premium"}* subscription package. We'd love to help you get set up!`;
    const encoded = encodeURIComponent(msg);
    return `https://wa.me/${rawNumber}?text=${encoded}`;
  };

  // Render Status Badge
  const renderStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
            Pending
          </Badge>
        );
      case "contacted":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">
            Contacted
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
            Resolved
          </Badge>
        );
      case "ignored":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/10 font-medium">
            Ignored
          </Badge>
        );
      default:
        return <Badge variant="outline">{statusVal}</Badge>;
    }
  };

  return (
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
                      <Button
                        onClick={() => openDetails(item)}
                        title="View Details"
                        className="h-8 w-8 rounded-lg border border-border/15 bg-soft/20 text-foreground flex items-center justify-center hover:bg-brand/10 hover:text-brand transition-all cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <a
                        href={getWhatsAppLink(item.mobile, item.name, item.subscription)}
                        target="_blank"
                        rel="noreferrer"
                        title="Chat on WhatsApp"
                        className="h-8 w-8 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-all cursor-pointer"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <Button
                        onClick={() => handleDeleteEnquiry(item._id)}
                        title="Delete Enquiry"
                        className="h-8 w-8 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <Button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-border/15 text-xs text-foreground bg-soft/10 hover:bg-soft/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
            >
              Previous
            </Button>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-border/15 text-xs text-foreground bg-soft/10 hover:bg-soft/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
