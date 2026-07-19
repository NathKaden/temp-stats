"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MetricChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  unit?: string;
}

export const MetricChart = ({ title, data, dataKey, color = "#2563eb", unit = "" }: MetricChartProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom tool-tip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let formattedLabel = label;
      try {
        formattedLabel = format(new Date(label), 'PPP HH:mm:ss', { locale: fr });
      } catch (e) {}

      return (
        <div className="group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) px-3.5 text-xs text-card-foreground [--card-spacing:--spacing(2.5)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(2.5)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl col-span-1 glass-card-blended ring-0 bg-card/40 backdrop-blur-xl shadow-xl">
          <p className="font-medium text-muted-foreground/80">{formattedLabel}</p>
          <p className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full inline-block animate-pulse" style={{ backgroundColor: color }} />
            {payload[0].value}
            <span className="text-xs font-semibold text-muted-foreground/80">{unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!isMounted) {
    return (
      <Card className="col-span-1 rounded-xl border border-white/10 bg-card/40 transition-all duration-300 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground/30 text-xs font-medium">
            Loading trend...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 rounded-xl border border-white/10 bg-card/40 transition-all duration-300 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 9, fill: "#71717a" }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(str) => {
                  try {
                    return format(new Date(str), 'HH:mm');
                  } catch (e) {
                    return str;
                  }
                }}
                stroke="transparent"
              />
              <YAxis 
                tick={{ fontSize: 9, fill: "#71717a" }} 
                tickLine={false}
                axisLine={false}
                stroke="transparent"
                unit={unit}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} 
                wrapperStyle={{ background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color${dataKey})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
