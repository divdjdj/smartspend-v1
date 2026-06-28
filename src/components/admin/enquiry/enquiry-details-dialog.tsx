import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Bookmark, 
  Calendar, 
  MessageCircle, 
  Loader2 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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

interface EnquiryDetailsDialogProps {
  selectedEnquiry: EnquiryItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  savingNotes: boolean;
  handleSaveNotes: () => Promise<void>;
  handleStatusChange: (id: string, newStatus: string) => Promise<void>;
}

export function EnquiryDetailsDialog({
  selectedEnquiry,
  isOpen,
  onOpenChange,
  adminNotes,
  setAdminNotes,
  savingNotes,
  handleSaveNotes,
  handleStatusChange,
}: EnquiryDetailsDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                  <Button
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
                  </Button>
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
              <Button
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
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
