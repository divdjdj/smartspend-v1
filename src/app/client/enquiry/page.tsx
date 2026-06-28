"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  RefreshCw, 
  Calendar, 
  Inbox, 
  CheckCircle2, 
  Hourglass, 
  PhoneCall, 
  XCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
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
}

export default function ClientEnquiryPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [subscription, setSubscription] = useState("ChatGPT Plus");
  const [message, setMessage] = useState("");

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/customer/enquiry");
      const data = await res.json();
      if (res.ok) {
        setEnquiries(data.enquiries);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error fetching enquiries:", err);
    }
  };

  const loadUserProfile = async () => {
    try {
      const res = await fetch("/api/customer/profile");
      const data = await res.json();
      if (res.ok && data.user) {
        setName(data.user.fullName || "");
        setEmail(data.user.email || "");
        setMobile(data.user.phone || "");
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([loadUserProfile(), fetchEnquiries()]);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !mobile.trim() || !subscription || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customer/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          subscription,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Enquiry submitted successfully!");
        setMessage("");
        // Refresh list
        fetchEnquiries();
      } else {
        throw new Error(data.error || "Failed to submit enquiry.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error submitting enquiry.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

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

  const renderStatusIcon = (statusVal: string) => {
    switch (statusVal) {
      case "pending":
        return <Hourglass className="h-4 w-4 text-destructive" />;
      case "contacted":
        return <PhoneCall className="h-4 w-4 text-amber-400" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const subscriptionOptions = [
    "ChatGPT Plus",
    "Cursor Pro",
    "LinkedIn Sales Navigator",
    "Adobe Creative Cloud",
    "Other Services / Customize"
  ];

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-2">
            Subscription Support & Enquiries
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Submit custom subscription requests, request help, and check responses from the admin team.
          </p>
        </div>
        <Button
          onClick={fetchEnquiries}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 max-w-6xl">
        {/* Left Side: Submit Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-5">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-brand" /> Submit New Enquiry</h3>
              <p className="text-xs text-muted-foreground mt-1">Submit your subscription queries or package details below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand/40"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand/40"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="mobile" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone / WhatsApp Number</label>
                <input
                  id="mobile"
                  type="text"
                  required
                  placeholder="e.g. +91 9999999999"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand/40"
                />
              </div>

              {/* Package Select */}
              <div className="space-y-1.5">
                <label htmlFor="subscription" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interested Subscription</label>
                <select
                  id="subscription"
                  value={subscription}
                  onChange={e => setSubscription(e.target.value)}
                  className="w-full bg-soft/40 border border-border/10 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand/40"
                >
                  {subscriptionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Message Details</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="Describe your request or enquiry details here (e.g. custom pricing, billing issues, activation duration details)..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-soft/40 border border-border/10 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand/40 resize-none leading-relaxed"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-brand text-xs font-semibold text-primary-foreground shadow-md hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Submit Support Request
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side: Enquiries Timeline List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-5">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Clock className="h-4 w-4 text-purple-400" /> My Enquiry History</h3>
              <p className="text-xs text-muted-foreground mt-1">Review current statuses and direct responses for your queries.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <span>Loading your enquiry logs...</span>
              </div>
            ) : enquiries.length === 0 ? (
              <div className="bg-soft/10 border border-border/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
                <Inbox className="h-10 w-10 text-muted-foreground/30" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">No Enquiries Found</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">Submit your queries in the portal to track resolutions.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {enquiries.map(item => (
                  <div
                    key={item._id}
                    className="border border-border/10 bg-soft/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 space-y-3.5 hover:border-brand/35 transition-all"
                  >
                    <div className="flex justify-between items-center gap-4 border-b border-border/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        {renderStatusIcon(item.status)}
                        <h4 className="text-xs font-bold text-brand">
                          {item.subscription || 'General'}
                        </h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs text-foreground leading-relaxed italic bg-soft/10 p-3 rounded-xl border border-border/5 whitespace-pre-wrap">
                      &quot;{item.message}&quot;
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status:</span>
                        {renderStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Admin Response/Notes panel */}
                    {item.notes ? (
                      <div className="border border-brand/20 bg-brand/[0.03] rounded-2xl p-4 space-y-1.5">
                        <h5 className="text-[10px] font-bold text-brand uppercase tracking-wider flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" /> Response from Admin
                        </h5>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                          {item.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground italic flex items-center gap-1.5 pl-1.5 pt-0.5">
                        <Clock className="h-3 w-3 opacity-60" /> Awaiting administrative feedback...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
