import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnquiryFiltersProps {
  status: string;
  setStatus: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
  dateRange: string;
  setDateRange: (dateRange: string) => void;
  subscription: string;
  setSubscription: (subscription: string) => void;
  sortOrder: string;
  setSortOrder: (sort: string) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
}

export function EnquiryFilters({
  status,
  setStatus,
  search,
  setSearch,
  dateRange,
  setDateRange,
  subscription,
  setSubscription,
  sortOrder,
  setSortOrder,
  setPage,
}: EnquiryFiltersProps) {
  return (
    <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-2xl p-4 shadow-elegant flex flex-col gap-4 relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-soft/30 border border-border/5 p-1 rounded-xl w-full md:w-auto">
          {["all", "pending", "contacted", "resolved", "ignored"].map(tab => (
            <Button
              key={tab}
              onClick={() => {
                setStatus(tab);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                status === tab
                  ? "bg-brand/10 text-brand shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-soft/50"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, phone, email, subscription..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-soft/50 border border-border/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Extra Filters */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border/5 pt-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date:</span>
          <select
            value={dateRange}
            onChange={e => {
              setDateRange(e.target.value);
              setPage(1);
            }}
            className="bg-soft/50 border border-border/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Subscription */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interested Package:</span>
          <select
            value={subscription}
            onChange={e => {
              setSubscription(e.target.value);
              setPage(1);
            }}
            className="bg-soft/50 border border-border/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 cursor-pointer"
          >
            <option value="all">All Packages</option>
            <option value="Premium">Premium</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort:</span>
          <select
            value={sortOrder}
            onChange={e => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
            className="bg-soft/50 border border-border/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 cursor-pointer"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
