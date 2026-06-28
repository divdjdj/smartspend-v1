"use client";

import { Activity, UserPlus, MousePointerClick, CheckCircle, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: 'click' | 'signup' | 'purchase' | 'reward';
  message: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'click': return <MousePointerClick className="h-3.5 w-3.5 text-blue-400" />;
      case 'signup': return <UserPlus className="h-3.5 w-3.5 text-amber-400" />;
      case 'purchase': return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
      case 'reward': return <Gift className="h-3.5 w-3.5 text-purple-400" />;
      default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'click': return 'bg-blue-500/10';
      case 'signup': return 'bg-amber-500/10';
      case 'purchase': return 'bg-emerald-500/10';
      case 'reward': return 'bg-purple-500/10';
      default: return 'bg-soft/10';
    }
  };

  return (
    <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant space-y-4">
      <div className="flex justify-between items-center border-b border-border/10 pb-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-brand" /> Live Activity Feed
        </h4>
        <Badge variant="outline" className="text-[10px] bg-brand/10 text-brand border-brand/20 font-medium px-2 py-0">Live</Badge>
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
        {activities.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-6 italic">No recent activity detected.</div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${getBg(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs text-foreground leading-snug">{item.message}</p>
                <span className="text-[10px] text-muted-foreground block font-mono">{item.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
