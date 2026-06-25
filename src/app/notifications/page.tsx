"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Loader2, 
  Clock, 
  ArrowRight,
  Gift,
  CreditCard,
  MessageSquare,
  Sparkles,
  Inbox
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'subscription' | 'referral' | 'reward' | 'enquiry' | 'system';
  status: 'unread' | 'read';
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/notifications?unreadOnly=${filter === 'unread'}&page=${page}&limit=20`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notifications.");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notifications.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark a single notification as read
  const handleMarkRead = async (id: string, actionUrl?: string) => {
    try {
      const res = await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, status: 'read' } : n)
        );
        setUnreadCount(c => Math.max(0, c - 1));

        if (actionUrl) {
          router.push(actionUrl);
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      const res = await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (res.ok) {
        toast.success("All notifications marked as read");
        setNotifications(prev =>
          prev.map(n => ({ ...n, status: 'read' }))
        );
        setUnreadCount(0);
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to update notifications.");
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    const hasRead = notifications.some(n => n.status === 'read');
    if (!hasRead) {
      toast.error("No read notifications to clear.");
      return;
    }

    try {
      const res = await fetch(`/api/notifications?clearAllRead=true`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Read notifications cleared");
        fetchNotifications();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Failed to clear notification history.");
    }
  };

  // Delete individual notification
  const handleDeleteIndividual = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent clicking on row/item redirect
    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success("Notification cleared");
        // Update unread count if deleted notification was unread
        const deletedItem = notifications.find(n => n._id === id);
        if (deletedItem && deletedItem.status === 'unread') {
          setUnreadCount(c => Math.max(0, c - 1));
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to delete notification.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Gift className="h-5 w-5 text-emerald-400" />;
      case 'subscription':
        return <CreditCard className="h-5 w-5 text-blue-400" />;
      case 'enquiry':
        return <MessageSquare className="h-5 w-5 text-purple-400" />;
      case 'system':
        return <Sparkles className="h-5 w-5 text-brand" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 6000);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[40%] h-[40%] bg-teal-mid/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <Badge className="bg-brand text-primary-foreground font-semibold px-2 py-0.5 text-xs animate-pulse">
                {unreadCount} New
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with account activities, subscription alerts, and referral ledger logs.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/15 bg-card/45 px-4 py-2 text-xs font-semibold text-foreground hover:bg-card/75 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-soft"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
          <button
            onClick={handleClearRead}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/15 transition-all cursor-pointer shadow-soft"
          >
            <Trash2 className="h-4 w-4" /> Clear read history
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-xl p-1.5 shadow-elegant flex items-center gap-1 max-w-[240px] relative z-10">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
              filter === f
                ? "bg-brand/10 text-brand shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-soft/50"
            }`}
          >
            {f} Notifications
          </button>
        ))}
      </div>

      {/* Notification list container */}
      <div className="relative z-10 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span>Retrieving notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-elegant">
            <div className="h-16 w-16 rounded-2xl bg-soft/20 flex items-center justify-center text-muted-foreground/40">
              <Inbox className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-foreground">Inbox is Empty</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {filter === 'unread' 
                  ? "You don't have any unread notification logs right now."
                  : "No notifications have been logged to your account registry yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(item => (
              <div
                key={item._id}
                onClick={() => handleMarkRead(item._id, item.actionUrl)}
                className={`group border border-border/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 flex gap-4 transition-all relative overflow-hidden cursor-pointer shadow-soft hover:border-brand/30 hover:bg-soft/5 ${
                  item.status === 'unread' 
                    ? 'bg-brand/[0.02] border-brand/20' 
                    : 'bg-card/25'
                }`}
              >
                {/* Unread marker bar */}
                {item.status === 'unread' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
                )}

                {/* Type specific avatar */}
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-border/5 ${
                  item.status === 'unread' ? 'bg-brand/10' : 'bg-soft/50'
                }`}>
                  {getIcon(item.type)}
                </div>

                {/* Notification body */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`text-sm font-semibold text-foreground truncate ${
                      item.status === 'unread' ? 'font-bold' : ''
                    }`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  
                  {item.actionUrl && (
                    <div className="pt-1.5 flex items-center gap-1 text-[10px] text-brand font-semibold group-hover:translate-x-1 transition-transform">
                      View details <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Individual delete action */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteIndividual(e, item._id)}
                  className="h-8 w-8 rounded-lg border border-border/15 bg-card/45 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 self-center"
                  title="Clear notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl mt-4 text-xs">
                <span className="text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-border/15 text-foreground bg-soft/10 hover:bg-soft/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all font-semibold"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-border/15 text-foreground bg-soft/10 hover:bg-soft/30 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}