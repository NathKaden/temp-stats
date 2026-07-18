import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  subTitle?: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  description?: string;
  color?: "blue" | "red" | "orange" | "yellow" | "indigo";
  variant?: "progress" | "circle";
}

export const MetricCard = ({
  title,
  subTitle,
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
      iconColor: "text-blue-400",
      cardStyle: "hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]",
    },
    red: {
      bar: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      stroke: "stroke-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]",
      iconColor: "text-red-400",
      cardStyle: "hover:shadow-[0_0_20px_rgba(239,68,68,0.12)]",
    },
    orange: {
      bar: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
      stroke: "stroke-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]",
      iconColor: "text-orange-400",
      cardStyle: "hover:shadow-[0_0_20px_rgba(249,115,22,0.12)]",
    },
    yellow: {
      bar: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]",
      stroke: "stroke-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]",
      iconColor: "text-yellow-400",
      cardStyle: "hover:shadow-[0_0_20px_rgba(234,179,8,0.12)]",
    },
    indigo: {
      bar: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]",
      stroke: "stroke-indigo-500 drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]",
      iconColor: "text-indigo-400",
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

  const isLongValue = typeof value === "string" && value.length > 8;
  const isPower = unit === " W";
  const valueClass = isLongValue 
    ? "text-lg font-bold text-foreground/90 tracking-tight" 
    : isPower 
      ? "text-2xl font-bold tracking-tight text-foreground" 
      : "text-3xl font-extrabold tracking-tight text-foreground";
  const unitClass = isPower 
    ? "text-xs font-semibold text-muted-foreground/45 ml-0.5" 
    : "text-sm font-semibold text-muted-foreground/70 ml-1";

  if (variant === "circle") {
    return (
      <Card className={`relative overflow-hidden glass-card-blended ring-0 bg-card/40 shadow-xl backdrop-blur-xl transition-all duration-300 ${currentColors.cardStyle} group p-5`}>
        <div className="flex flex-row items-center justify-between gap-4 z-10 relative">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`${currentColors.iconColor} transition-all duration-300 shrink-0`}>
                  {icon}
                </div>
              )}
              <div className="flex flex-col">
                <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground/80">{title}</CardTitle>
                {subTitle && <span className="text-[11px] text-muted-foreground/50 font-medium -mt-0.5">{subTitle}</span>}
              </div>
            </div>

            {description && (
              <p className="text-xs text-muted-foreground/60 font-medium tracking-wide">
                {description}
              </p>
            )}
          </div>

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
          <div className={`${currentColors.iconColor} transition-all duration-300 shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground/80">{title}</CardTitle>
          {subTitle && <span className="text-[11px] text-muted-foreground/50 font-medium -mt-0.5">{subTitle}</span>}
        </div>
      </CardHeader>
      <CardContent className="z-10">
        <div className="text-3xl font-extrabold tracking-tight text-foreground flex items-baseline">
          <span className={valueClass}>{value}</span>
          {unit && <span className={unitClass}>{unit}</span>}
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
