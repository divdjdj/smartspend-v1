"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, Users, Clipboard, RefreshCw, Sparkles, ReceiptIndianRupee } from "lucide-react"

interface AdminKPIs {
  activeCodes: number;
  clicks: number;
  signups: number;
  purchases: number;
  revenue: number;
  cashPaid: number;
  subscriptionMonths: number;
}

interface SectionCardsProps {
  kpis: AdminKPIs | null
}

export function SectionCards({ kpis }: SectionCardsProps) {
  if (!kpis) return null

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card border-border/10">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider font-bold">Active Promo Codes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1">
            {kpis.activeCodes}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20">
              <Clipboard className="size-3.5 mr-1" />
              Codes
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
            Unique generated codes in use
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card border-border/10">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider font-bold">Clicks Funnel</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1">
            {kpis.clicks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <TrendingUpIcon className="size-3.5 mr-1" />
              Traffic
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
            Total link clicks tracked
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card border-border/10">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider font-bold">Conversions (Sales)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1">
            {kpis.purchases}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              / {kpis.signups} signups
            </span>
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <Users className="size-3.5 mr-1" />
              {((kpis.purchases / (kpis.signups || 1)) * 100).toFixed(0)}% CR
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
            Successful purchase actions completed
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card border-border/10">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider font-bold">Total Sales Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-emerald-400 @[250px]/card:text-3xl mt-1">
            ₹{kpis.revenue}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <ReceiptIndianRupee className="size-3.5 mr-1" />
              Revenue
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-xs">
          <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
            Earnings generated from sales
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

