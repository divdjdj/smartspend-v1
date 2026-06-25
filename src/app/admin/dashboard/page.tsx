"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Share2, 
  Loader2, 
  RefreshCw, 
  Activity, 
  ArrowUpRight, 
  Calendar,
  MessageSquare,
  UserPlus,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";
import Link from "next/link";

interface RecentSignup {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  createdAt: string;
}

interface RecentPurchase {
  userName: string;
  email: string;
  packageName: string;
  price: number;
  startDate: string;
  status: string;
}

interface RecentEnquiry {
  _id: string;
  name: string;
  subscription?: string;
  status: string;
  createdAt: string;
}

interface DashboardData {
  stats: {
    totalRevenue: number;
    activeSubsCount: number;
    totalClients: number;
    activeClients: number;
    conversionRate: number;
    totalClicks: number;
  };
  charts: {
    revenueChartData: Array<{ name: string; Revenue: number }>;
    funnelChartData: Array<{ name: string; value: number }>;
  };
  feeds: {
    recentSignups: RecentSignup[];
    recentPurchases: RecentPurchase[];
    recentEnquiries: RecentEnquiry[];
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        throw new Error(json.error || "Failed to load dashboard data.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard statistics.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      fetchDashboardData();
    }, 0);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const renderStatusBadge = (statusVal: string) => {
    switch (statusVal) {
      case "active":
      case "resolved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Active</Badge>;
      case "pending":
      case "contacted":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Pending</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border/10 text-[10px]">{statusVal}</Badge>;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 gap-3 text-muted-foreground bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <span>Loading administration metrics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-40 text-center text-muted-foreground bg-background">
        <Activity className="h-12 w-12 opacity-30 text-destructive mb-3 animate-pulse" />
        <h4 className="font-semibold text-lg text-foreground">Failed to Load Dashboard</h4>
        <p className="text-sm max-w-sm mt-1">Please check your network and authorization permissions before trying again.</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border/15 text-foreground hover:bg-soft"
        >
          Try Again
        </button>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#e9d5ff'];

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-background relative overflow-y-auto">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[40%] h-[40%] bg-teal-mid/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            System overview, client metrics, sales charts, and acquisition funnels.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card/70 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Total Revenue */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-bold font-display text-emerald-400 mt-2">₹{data.stats.totalRevenue}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Plans</p>
            <h3 className="text-2xl font-bold font-display text-brand mt-2">{data.stats.activeSubsCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Clients</p>
            <h3 className="text-2xl font-bold font-display text-foreground mt-2">{data.stats.totalClients}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Conversion rate */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-5 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
            <h3 className="text-2xl font-bold font-display text-purple-400 mt-2">{data.stats.conversionRate}%</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Share2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Sales Chart */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-foreground">Revenue Trend</h4>
              <p className="text-xs text-muted-foreground">Earnings overview for the past 6 months.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-brand" />
          </div>
          <div className="h-[260px] w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(20,20,20,0.85)', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--brand)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="var(--brand)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-foreground">Acquisition Funnel</h4>
              <p className="text-xs text-muted-foreground">Total counts grouped by conversion stage progress.</p>
            </div>
            <Share2 className="h-5 w-5 text-purple-400" />
          </div>
          <div className="h-[260px] w-full pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.funnelChartData} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(20,20,20,0.85)', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--brand)', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {data.charts.funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        {/* Recent Purchases */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-5 shadow-elegant space-y-4">
          <div className="flex justify-between items-center border-b border-border/10 pb-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-brand" /> Purchases</h4>
            <Link href="/admin/clients" className="text-[10px] text-brand hover:underline flex items-center gap-0.5">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
            {data.feeds.recentPurchases.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-10 italic">No recent purchases recorded.</div>
            ) : (
              data.feeds.recentPurchases.map((sub, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-border/5 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">{sub.userName || sub.email}</span>
                    <span className="text-[10px] text-muted-foreground block">Bought {sub.packageName}</span>
                  </div>
                  <div className="text-right space-y-0.5 shrink-0">
                    <span className="font-bold text-foreground block">₹{sub.price}</span>
                    <span className="block">{renderStatusBadge(sub.status)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-5 shadow-elegant space-y-4">
          <div className="flex justify-between items-center border-b border-border/10 pb-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5"><UserPlus className="h-4 w-4 text-purple-400" /> New Signups</h4>
            <Link href="/admin/clients" className="text-[10px] text-brand hover:underline flex items-center gap-0.5">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
            {data.feeds.recentSignups.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-10 italic">No recent signups.</div>
            ) : (
              data.feeds.recentSignups.map((client) => (
                <div key={client._id} className="flex justify-between items-center text-xs border-b border-border/5 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">{client.firstName ? `${client.firstName} ${client.lastName || ''}` : client.email}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">{client.email}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(client.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-5 shadow-elegant space-y-4">
          <div className="flex justify-between items-center border-b border-border/10 pb-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-purple-400" /> Enquiries</h4>
            <Link href="/admin/enquiry" className="text-[10px] text-brand hover:underline flex items-center gap-0.5">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto">
            {data.feeds.recentEnquiries.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-10 italic">No recent enquiries.</div>
            ) : (
              data.feeds.recentEnquiries.map((enq) => (
                <div key={enq._id} className="flex justify-between items-start text-xs border-b border-border/5 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">{enq.name}</span>
                    <span className="text-[10px] text-muted-foreground block">Interest: {enq.subscription || 'General'}</span>
                  </div>
                  <div className="text-right space-y-0.5 shrink-0">
                    <span className="block">{renderStatusBadge(enq.status)}</span>
                    <span className="text-[9px] text-muted-foreground font-mono block">{formatDate(enq.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}