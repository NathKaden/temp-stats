"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ZoomIn, X } from "lucide-react";

interface MetricChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  unit?: string;
}

export const MetricChart = ({ title, data, dataKey, color = "#2563eb", unit = "" }: MetricChartProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom tool-tip component for the main inline chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && isMouseOver && payload && payload.length) {
      let formattedLabel = label;
      try {
        formattedLabel = format(new Date(label), 'PPP HH:mm:ss', { locale: fr });
      } catch (e) {}

      return (
        <div className="flex flex-col gap-2 rounded-xl py-2.5 px-3.5 text-xs text-card-foreground glass-card-blended shadow-xl border border-white/10 bg-card/40 backdrop-blur-xl">
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

  // Custom tool-tip component for the large modal chart
  const CustomTooltipModal = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let formattedLabel = label;
      try {
        formattedLabel = format(new Date(label), 'PPP HH:mm:ss', { locale: fr });
      } catch (e) {}

      return (
        <div className="flex flex-col gap-2 rounded-xl py-2.5 px-3.5 text-xs text-card-foreground bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl">
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
      <Card className="col-span-1 rounded-xl border border-white/10 bg-card/40 transition-all duration-300 shadow-xl animate-pulse">
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
    <>
      <Card className="col-span-1 rounded-xl border border-white/10 bg-card/40 transition-all duration-300 shadow-xl group relative overflow-hidden">
        <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase select-none">{title}</CardTitle>
          <button
            onClick={() => setIsModalOpen(true)}
            className="opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center shrink-0"
            title="Agrandir le graphique"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </CardHeader>
        <CardContent>
          <div 
            className="h-[200px] w-full cursor-pointer"
            onClick={() => setIsModalOpen(true)}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
          >
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
                  tick={{ fontSize: 9, fill: "#a1a1aa" }} 
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
                  tick={{ fontSize: 9, fill: "#a1a1aa" }} 
                  tickLine={false}
                  axisLine={false}
                  stroke="transparent"
                  unit={unit}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={isMouseOver ? { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 } : false} 
                  wrapperStyle={{ background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#color${dataKey})`} 
                  activeDot={isMouseOver}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-zinc-950/90 border border-white/10 rounded-2xl w-full max-w-5xl p-6 md:p-8 shadow-2xl relative flex flex-col gap-6 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer transition-all flex items-center justify-center"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title */}
            <div>
              <h3 className="font-poppins text-lg font-bold text-zinc-300 uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Visualisation détaillée de l'historique
              </p>
            </div>

            {/* Large Chart Container */}
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`modalColor${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 10, fill: "#a1a1aa" }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => {
                      try {
                        return format(new Date(str), 'dd/MM HH:mm', { locale: fr });
                      } catch (e) {
                        return str;
                      }
                    }}
                    stroke="transparent"
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: "#a1a1aa" }} 
                    tickLine={false}
                    axisLine={false}
                    stroke="transparent"
                    unit={unit}
                  />
                  <Tooltip 
                    content={<CustomTooltipModal />} 
                    cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} 
                    wrapperStyle={{ background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={dataKey} 
                    stroke={color} 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill={`url(#modalColor${dataKey})`} 
                    activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
