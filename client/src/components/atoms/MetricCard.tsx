import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  description?: string;
}

export const MetricCard = ({ title, value, unit, icon, description }: MetricCardProps) => {
  const numericValue = Number(value);
  const isPercent = unit === "%";

  return (
    <Card className="relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5 group">
      {/* Subtle bottom-right glow */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-500 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
        <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase">{title}</CardTitle>
        {icon && (
          <div className="text-muted-foreground bg-zinc-800/30 p-2 rounded-lg border border-border/30 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-300">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="z-10">
        <div className="text-3xl font-extrabold tracking-tight text-foreground flex items-baseline">
          {value}
          {unit && <span className="text-sm font-semibold text-muted-foreground/70 ml-1">{unit}</span>}
        </div>
        
        {isPercent && !isNaN(numericValue) && (
          <div className="mt-3.5 w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden border border-border/30">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                numericValue > 85 
                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                  : numericValue > 65 
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                  : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              }`}
              style={{ width: `${Math.min(Math.max(numericValue, 0), 100)}%` }}
            />
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground/60 mt-2 font-medium tracking-wide">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
