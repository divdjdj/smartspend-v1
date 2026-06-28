"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  RefreshCw, 
  Users, 
  UserCheck, 
  Calendar, 
  Share2, 
  Mail, 
  Phone, 
  Trash2, 
  Eye, 
  Loader2,
  Shield,
  DollarSign,
  KeyRound,
  ShieldAlert,
  Activity,
  CreditCard
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
import { Button } from "@/components/ui/button";

interface SubscriptionItem {
  _id?: string;
  packageId: string;
  packageName: string;
  billingCycle: string;
  price: number;
  discount: number;
  totalPrice: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
}

interface LoginHistoryItem {
  ip: string;
  userAgent: string;
  success: boolean;
  timestamp: string;
}

interface UserItem {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  phone?: string;
  accountType: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  referralCode?: string;
  referredBy?: {
    referrerId?: string;
    referrerEmail?: string;
  };
  accountBalance: number;
  subscriptions?: SubscriptionItem[];
  loginHistory?: LoginHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

interface EnquiryItem {
  _id?: string;
  subscription?: string;
  createdAt: string;
  message?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  referrerUsers: number;
  newUsersToday: number;
}

export default function AllClientsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all"); // 'all' | 'referrer' | 'non-referrer'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeUsers: 0, referrerUsers: 0, newUsersToday: 0 });
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string | null; email?: string | null; role?: string | null } | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Get current logged in user session on load to prevent self-action (e.g. self-delete or self-role-change)
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error("Session fetch error:", err));
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/clients?status=${status}&type=${type}&search=${encodeURIComponent(search)}&page=${page}&limit=10`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch clients.");
      }

      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setStats(data.stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to retrieve clients list.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [status, type, search, page]);

  useEffect(() => {
    setTimeout(() => {
      fetchUsers();
    }, 0);
  }, [fetchUsers]);

  // Handle updates to user status or role
  const handleUpdateUser = async (userId: string, updates: { role?: 'customer' | 'admin'; status?: 'active' | 'inactive' | 'suspended' }) => {
    if (currentUser && currentUser.id === userId) {
      toast.error("You cannot modify your own administrative role or status.");
      return;
    }

    setUpdatingUser(true);
    try {
      const res = await fetch(`/api/admin/clients/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update client profile.");
      }

      toast.success(data.message || "Client updated successfully.");
      
      // Update local states
      setUsers(prev => 
        prev.map(u => u._id === userId ? { ...u, ...updates } : u)
      );

      if (selectedUser?._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
      }

      // Re-trigger analytics fetch
      const statsRes = await fetch(`/api/admin/clients?page=1&limit=1`);
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update client.";
      toast.error(message);
    } finally {
      setUpdatingUser(false);
    }
  };

  // Handle client deletion
  const handleDeleteUser = async (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      toast.error("You cannot delete your own account.");
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this client profile? This action will also delete all associated referral code links and cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/clients/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete client.");
      }

      toast.success(data.message || "Client deleted successfully.");
      setUsers(prev => prev.filter(u => u._id !== userId));
      
      if (selectedUser?._id === userId) {
        setIsDetailsOpen(false);
      }

      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete client.";
      toast.error(message);
    }
  };

  const openDetails = async (user: UserItem) => {
    setSelectedUser(user);
    setEnquiries([]);
    setIsDetailsOpen(true);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/clients/${user._id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to fetch detailed profile information", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case "active":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border/10 font-medium">Inactive</Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">Suspended</Badge>;
      default:
        return <Badge variant="outline">{statusVal}</Badge>;
    }
  };

  const renderRoleBadge = (roleVal: string) => {
    switch (roleVal) {
      case "admin":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-semibold flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
      case "customer":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">Customer</Badge>;
      default:
        return <Badge variant="outline">{roleVal}</Badge>;
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight text-foreground">
            Client Management
          </h2>
        </div>
        <Button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Total Users */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold font-display text-foreground mt-2">{stats.totalUsers}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-bold font-display text-emerald-400 mt-2">{stats.activeUsers}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Referrers */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referrers</p>
            <h3 className="text-2xl font-bold font-display text-purple-400 mt-2">{stats.referrerUsers}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Share2 className="h-5 w-5" />
          </div>
        </div>

        {/* Joined Today */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined Today</p>
            <h3 className="text-2xl font-bold font-display text-brand mt-2">{stats.newUsersToday}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters and Search Control Block */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-4 shadow-elegant flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="bg-soft/40 border border-border/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-brand/40"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Referral status filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Referral Program</label>
            <select
              value={type}
              onChange={e => { setType(e.target.value); setPage(1); }}
              className="bg-soft/40 border border-border/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-brand/40"
            >
              <option value="all">All Users</option>
              <option value="referrer">Registered Referrers</option>
              <option value="non-referrer">Non-Referrers</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, phone, referral code..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-soft/50 border border-border/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Clients Table */}
      <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl shadow-elegant overflow-hidden relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span>Retrieving clients registry...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground text-center px-4">
            <Users className="h-12 w-12 opacity-30 text-brand" />
            <h4 className="font-semibold text-lg text-foreground">No Clients Found</h4>
            <p className="text-sm max-w-sm">
              We couldn&apos;t find any client profiles matching the selected query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/10 bg-soft/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Client Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4">Joined At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10 text-sm text-foreground">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-soft/10 transition-colors">
                    {/* User profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xs uppercase">
                          {user.firstName ? user.firstName[0] : ""}{user.lastName ? user.lastName[0] : ""}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {user.fullName}
                            {currentUser && currentUser.id === user._id && (
                              <span className="text-[10px] bg-foreground/10 text-foreground px-1.5 py-0.5 rounded font-normal italic">You</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3 inline text-muted-foreground/60" /> {user.email}</span>
                            {user.phone && <span className="flex items-center gap-1 border-l border-border/10 pl-2"><Phone className="h-3 w-3 inline text-muted-foreground/60" /> {user.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(user.status)}
                    </td>

                    {/* Referral Code */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.referralCode ? (
                        <Button
                          onClick={() => copyToClipboard(user.referralCode || "", "Referral Code")}
                          className="px-2 py-1 text-xs rounded border border-border/10 bg-soft/20 text-foreground hover:bg-soft/50 font-mono transition-all inline-flex items-center gap-1 text-[11px]"
                        >
                          {user.referralCode}
                          <span className="text-[9px] text-muted-foreground opacity-60">
                            {copiedCode === user.referralCode ? "Copied!" : "Copy"}
                          </span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 italic">Not set</span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs font-mono">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => openDetails(user)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border/15 bg-card/40 backdrop-blur-md px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-card/70 transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                        <Button
                          disabled={currentUser?.id === user._id}
                          onClick={() => handleDeleteUser(user._id)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/15 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                          title={currentUser?.id === user._id ? "You cannot delete yourself" : "Delete user profile"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* Dialog Detail View Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-card/90 border border-border/10 backdrop-blur-xl shadow-elegant text-foreground max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              Client Profile Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Detailed view of customer profile, active subscriptions, and referral system links.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-6 mt-4">
              {/* Profile Card Summary */}
              <div className="bg-soft/20 border border-border/5 rounded-2xl p-5 text-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg uppercase shrink-0">
                      {selectedUser.firstName ? selectedUser.firstName[0] : ""}{selectedUser.lastName ? selectedUser.lastName[0] : ""}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground flex items-center gap-1.5">
                        {selectedUser.fullName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderRoleBadge(selectedUser.role)}
                    {renderStatusBadge(selectedUser.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 opacity-75 shrink-0" />
                      <span>Phone: <strong className="text-foreground">{selectedUser.phone || "Not provided"}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 opacity-75 shrink-0" />
                      <span>Member Since: <strong className="text-foreground">{formatDate(selectedUser.createdAt)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 opacity-75 shrink-0 text-emerald-400" />
                      <span>Wallet Balance: <strong className="text-emerald-400">₹{selectedUser.accountBalance || 0}</strong></span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <KeyRound className="h-4 w-4 opacity-75 shrink-0 text-brand" />
                      <span>Referral Link Code: {selectedUser.referralCode ? (
                        <>
                          <Button
                            onClick={() => copyToClipboard(selectedUser.referralCode || "", "Referral Code")}
                            className="font-mono text-foreground underline hover:text-brand cursor-pointer pl-1"
                          >
                            {selectedUser.referralCode}
                          </Button>
                          {copiedCode === selectedUser.referralCode && (
                            <span className="text-[10px] text-emerald-400 font-medium ml-2">Copied!</span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground/50 pl-1">None generated</span>
                      )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Share2 className="h-4 w-4 opacity-75 shrink-0 text-purple-400" />
                      <span>Referred By: {selectedUser.referredBy?.referrerEmail ? (
                        <span className="text-foreground pl-1 font-medium">{selectedUser.referredBy.referrerEmail}</span>
                      ) : (
                        <span className="text-muted-foreground/50 pl-1">Direct Signup</span>
                      )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4 opacity-75 shrink-0" />
                      <span>Verification Status: <strong className="text-foreground">{selectedUser.emailVerified ? "Verified" : "Unverified"}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Quick Actions */}
              {(!currentUser || currentUser.id !== selectedUser._id) && (
                <div className="border border-border/10 rounded-2xl p-4 space-y-3.5 bg-soft/10">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-brand" />
                    Administrative Actions
                  </h5>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-foreground">Update Account Role</span>
                      <span className="text-[10px] text-muted-foreground">Change customer status or administrative permissions.</span>
                    </div>
                    <div className="flex gap-1.5">
                      {['customer', 'admin'].map(r => (
                        <Button
                          key={r}
                          disabled={updatingUser}
                          onClick={() => handleUpdateUser(selectedUser._id, { role: r as 'customer' | 'admin' })}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize cursor-pointer transition-all border ${
                            selectedUser.role === r 
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-sm'
                              : 'text-muted-foreground border-border/10 hover:bg-soft/20 hover:text-foreground'
                          }`}
                        >
                          {r}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-border/10 pt-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-foreground">Update Account Status</span>
                      <span className="text-[10px] text-muted-foreground">Activate, suspend or freeze this user profile.</span>
                    </div>
                    <div className="flex gap-1.5">
                      {['active', 'inactive', 'suspended'].map(s => (
                        <Button
                          key={s}
                          disabled={updatingUser}
                          onClick={() => handleUpdateUser(selectedUser._id, { status: s as 'active' | 'inactive' | 'suspended' })}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize cursor-pointer transition-all border ${
                            selectedUser.status === s 
                              ? s === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold'
                                : s === 'suspended' ? 'bg-destructive/10 text-destructive border-destructive/20 font-bold'
                                : 'bg-soft text-foreground border-border/10 font-bold'
                              : 'text-muted-foreground border-border/10 hover:bg-soft/20 hover:text-foreground'
                          }`}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist Submissions / Enquiries */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-brand" />
                  Wishlist Subscriptions Interested In ({enquiries.length})
                </h5>
                <div className="bg-soft/10 border border-border/5 rounded-2xl p-4 space-y-3">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-4 gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-brand animate-pulse" />
                      <span>Loading wishlist entries...</span>
                    </div>
                  ) : enquiries.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground italic py-2">
                      No subscription wishlist entries submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                      {enquiries.map((enq, idx) => (
                        <div key={enq._id || idx} className="border-b border-border/5 pb-2.5 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-xs text-foreground bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                              {enq.subscription || "Custom Subscription"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatDate(enq.createdAt)}
                            </span>
                          </div>
                          {enq.message && (
                            <p className="text-xs text-muted-foreground mt-1.5 bg-background/40 p-2 rounded-lg italic">
                              &ldquo;{enq.message}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active / Past Subscriptions */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Subscription History ({selectedUser.subscriptions?.length || 0})
                </h5>
                <div className="bg-soft/10 border border-border/5 rounded-2xl overflow-hidden">
                  {!selectedUser.subscriptions || selectedUser.subscriptions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground italic">
                      No active or historical subscriptions.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/10 bg-soft/20 font-medium text-muted-foreground">
                            <th className="px-4 py-2.5">Package</th>
                            <th className="px-4 py-2.5">Billing</th>
                            <th className="px-4 py-2.5">Price</th>
                            <th className="px-4 py-2.5">Status</th>
                            <th className="px-4 py-2.5 text-right">Validity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5 text-foreground">
                          {selectedUser.subscriptions.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-soft/5">
                              <td className="px-4 py-2.5 font-semibold text-brand">{sub.packageName}</td>
                              <td className="px-4 py-2.5 capitalize">{sub.billingCycle}</td>
                              <td className="px-4 py-2.5">₹{sub.totalPrice}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold border ${
                                  sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : sub.status === 'cancelled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-muted text-muted-foreground border-border/10'
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-[10px] text-muted-foreground">
                                {new Date(sub.startDate).toLocaleDateString('en-IN')} - {new Date(sub.endDate).toLocaleDateString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Login History */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Recent Account Login History ({selectedUser.loginHistory?.length || 0})
                </h5>
                <div className="bg-soft/10 border border-border/5 rounded-2xl overflow-hidden">
                  {!selectedUser.loginHistory || selectedUser.loginHistory.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground italic">
                      No recorded login activity log.
                    </div>
                  ) : (
                    <div className="max-h-[160px] overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/10 bg-soft/20 font-medium text-muted-foreground sticky top-0 bg-card z-10">
                            <th className="px-4 py-2.5">Timestamp</th>
                            <th className="px-4 py-2.5">IP Address</th>
                            <th className="px-4 py-2.5">Status</th>
                            <th className="px-4 py-2.5 text-right">Device / User Agent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5 text-foreground">
                          {selectedUser.loginHistory.slice().reverse().map((history, idx) => (
                            <tr key={idx} className="hover:bg-soft/5">
                              <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                                {formatDate(history.timestamp)}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-[10px]">{history.ip}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-1.5 py-0.5 text-[9px] rounded font-semibold ${
                                  history.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-destructive/10 text-destructive border border-destructive/10'
                                }`}>
                                  {history.success ? 'Success' : 'Failed'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right max-w-[180px] truncate text-[10px] text-muted-foreground" title={history.userAgent}>
                                {history.userAgent}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Close & Delete */}
              <div className="flex gap-2 justify-between border-t border-border/10 pt-4 mt-2">
                <div>
                  {(!currentUser || currentUser.id !== selectedUser._id) && (
                    <Button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser._id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive shadow-sm hover:bg-destructive/25 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Account Profile
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-card/70 transition-all cursor-pointer"
                >
                  Close Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
