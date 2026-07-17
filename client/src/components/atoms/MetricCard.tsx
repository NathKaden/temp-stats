import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  description?: string;
  color?: "blue" | "red" | "orange" | "yellow" | "indigo";
}

export const MetricCard = ({ title, value, unit, icon, description, color = "indigo" }: MetricCardProps) => {
  const numericValue = Number(value);
  const isPercent = unit === "%";

  const colorConfig = {
    blue: {
      bar: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
      iconStyle: "text-blue-400 border-blue-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]",
    },
    red: {
      bar: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      iconStyle: "text-red-400 border-red-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(239,68,68,0.12)]",
    },
    orange: {
      bar: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
      iconStyle: "text-orange-400 border-orange-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(249,115,22,0.12)]",
    },
    yellow: {
      bar: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]",
      iconStyle: "text-yellow-400 border-yellow-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(234,179,8,0.12)]",
    },
    indigo: {
      bar: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
      iconStyle: "text-indigo-400 border-indigo-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(99,102,241,0.12)]",
    },
  };

  const currentColors = colorConfig[color] || colorConfig.indigo;

  return (
    <Card className={`relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl transition-all duration-300 ${currentColors.cardStyle} group`}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2 z-10">
        {icon && (
          <div className={`bg-zinc-800/30 p-2 rounded-lg border ${currentColors.iconStyle} transition-all duration-300`}>
            {icon}
          </div>
        )}
        <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground/80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="z-10">
        <div className="text-3xl font-extrabold tracking-tight text-foreground flex items-baseline">
          {value}
          {unit && <span className="text-sm font-semibold text-muted-foreground/70 ml-1">{unit}</span>}
        </div>
        
        {isPercent && !isNaN(numericValue) && (
          <div className="mt-3.5 w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden border border-border/30">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${currentColors.bar}`}
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
