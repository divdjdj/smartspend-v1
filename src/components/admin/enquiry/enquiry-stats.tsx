import { ListIcon, Hourglass, PhoneCall, CheckCircle2 } from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  contacted: number;
  resolved: number;
}

interface EnquiryStatsProps {
  stats: Stats;
}

export function EnquiryStats({ stats }: EnquiryStatsProps) {
  return (
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
  );
}
