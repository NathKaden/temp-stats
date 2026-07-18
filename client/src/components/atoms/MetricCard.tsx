import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  description?: string;
  color?: "blue" | "red" | "orange" | "yellow" | "indigo";
  variant?: "progress" | "circle";
}

export const MetricCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  description, 
  color = "indigo",
  variant = "progress"
}: MetricCardProps) => {
  const numericValue = Number(value);
  const isPercent = unit === "%";

  const colorConfig = {
    blue: {
      bar: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
      stroke: "stroke-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]",
      iconStyle: "text-blue-400 border-blue-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]",
    },
    red: {
      bar: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      stroke: "stroke-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]",
      iconStyle: "text-red-400 border-red-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(239,68,68,0.12)]",
    },
    orange: {
      bar: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
      stroke: "stroke-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]",
      iconStyle: "text-orange-400 border-orange-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(249,115,22,0.12)]",
    },
    yellow: {
      bar: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]",
      stroke: "stroke-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]",
      iconStyle: "text-yellow-400 border-yellow-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(234,179,8,0.12)]",
    },
    indigo: {
      bar: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
      stroke: "stroke-indigo-500 drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]",
      iconStyle: "text-indigo-400 border-indigo-500/30",
      cardStyle: "hover:shadow-[0_0_20px_rgba(99,102,241,0.12)]",
    },
  };

  const currentColors = colorConfig[color] || colorConfig.indigo;

  // Circle dimensions
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isNaN(numericValue)
    ? circumference
    : circumference - (Math.min(Math.max(numericValue, 0), 100) / 100) * circumference;

  if (variant === "circle") {
    return (
      <Card className={`relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl transition-all duration-300 ${currentColors.cardStyle} group p-5`}>
        <div className="flex flex-row items-center justify-between gap-4 z-10 relative">
          {/* Left info block */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`bg-zinc-800/30 p-2 rounded-lg border ${currentColors.iconStyle} transition-all duration-300`}>
                  {icon}
                </div>
              )}
              <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground/80">{title}</CardTitle>
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground/60 font-medium tracking-wide">
                {description}
              </p>
            )}
          </div>

          {/* Right SVG Circle block */}
          <div className="relative flex items-center justify-center h-20 w-20 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-white/10"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className={`${currentColors.stroke} transition-all duration-500 ease-out`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-sm font-bold tracking-tight text-foreground">{value}</span>
              {unit && <span className="text-[10px] font-semibold text-muted-foreground/50">{unit}</span>}
            </div>
          </div>
        </div>
      </Card>
    );
  }

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
