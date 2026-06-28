"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface PerformanceChartProps {
  data: {
    date: string;
    clicks: number;
    signups: number;
    purchases: number;
  }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="bg-card/30 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-elegant w-full h-full min-h-[350px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-brand" /> Referral Performance
        </h3>
        <span className="text-xs text-muted-foreground bg-soft/20 px-2 py-1 rounded-md">Last 30 Days</span>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        {data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground italic">
            No data available yet. Start sharing to see your progress!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="currentColor" 
                className="text-[10px] opacity-50" 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="currentColor" 
                className="text-[10px] opacity-50" 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border) / 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                labelStyle={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                name="Clicks" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="signups" 
                name="Signups" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="purchases" 
                name="Purchases" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
