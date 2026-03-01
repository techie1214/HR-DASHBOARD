import { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon, iconColor }: StatsCardProps) {
  const getChangeColor = () => {
    if (changeType === "positive") return "text-success-600";
    if (changeType === "negative") return "text-error-600";
    return "text-slate-500";
  };

  const getIconBg = () => {
    // Extract the color name from the iconColor prop (e.g., "bg-blue-500" -> "blue")
    if (iconColor.includes("blue")) return "bg-gradient-to-br from-blue-500 to-blue-600";
    if (iconColor.includes("green")) return "bg-gradient-to-br from-green-500 to-green-600";
    if (iconColor.includes("orange")) return "bg-gradient-to-br from-orange-500 to-orange-600";
    if (iconColor.includes("purple")) return "bg-gradient-to-br from-purple-500 to-purple-600";
    if (iconColor.includes("red")) return "bg-gradient-to-br from-red-500 to-red-600";
    if (iconColor.includes("yellow")) return "bg-gradient-to-br from-yellow-500 to-yellow-600";
    return "bg-gradient-to-br from-slate-500 to-slate-600";
  };

  return (
    <div className={cn("card p-6 hover-lift transition-all")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {change && (
            <div className={cn("flex items-center gap-1 mt-2 text-sm font-medium", getChangeColor())}>
              {changeType === "positive" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {changeType === "negative" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", getIconBg())}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}
