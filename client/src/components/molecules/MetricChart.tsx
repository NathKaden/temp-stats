"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface MetricChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  unit?: string;
}

export const MetricChart = ({ title, data, dataKey, color = "#2563eb", unit = "" }: MetricChartProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="timestamp" 
                tick={{fontSize: 10}} 
                tickFormatter={(str) => format(new Date(str), 'HH:mm')}
                stroke="#64748b"
              />
              <YAxis 
                tick={{fontSize: 10}} 
                stroke="#64748b"
                unit={unit}
              />
              <Tooltip 
                labelFormatter={(label) => format(new Date(label), 'PPP HH:mm:ss')}
                formatter={(value: number) => [`${value}${unit}`, title]}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
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
