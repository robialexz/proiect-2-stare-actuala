import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  isLoading?: boolean;
}

/**
 * StatisticsCard - A modern card component for displaying statistics
 */
const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  gradientFrom = "from-indigo-500",
  gradientTo = "to-blue-500",
  valuePrefix = "",
  valueSuffix = "",
  isLoading = false,
}) => {
  // Determine trend color and icon
  const getTrendDetails = () => {
    if (!trend) return null;

    if (trend.isNeutral) {
      return {
        icon: <Minus className="h-4 w-4" />,
        color: "text-slate-400",
        bgColor: "bg-slate-400/10",
        borderColor: "border-slate-400/20",
      };
    }

    const isPositive = trend.isPositive ?? trend.value > 0;

    return {
      icon: isPositive ? (
        <TrendingUp className="h-4 w-4" />
      ) : (
        <TrendingDown className="h-4 w-4" />
      ),
      color: isPositive ? "text-green-400" : "text-rose-400",
      bgColor: isPositive ? "bg-green-400/10" : "bg-rose-400/10",
      borderColor: isPositive ? "border-green-400/20" : "border-rose-400/20",
    };
  };

  const trendDetails = getTrendDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("", className)}
    >
      <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 overflow-hidden relative group">
        {/* Background gradient */}
        <div
          className={cn(
            "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-20 rounded-full blur-2xl transform translate-x-10 -translate-y-10",
            gradientFrom,
            gradientTo
          )}
        />

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-medium text-slate-400">
              {title}
            </CardTitle>
            {icon && (
              <div
                className={cn(
                  "p-2 rounded-lg bg-gradient-to-br opacity-80",
                  `${gradientFrom}/10`,
                  `${gradientTo}/10`
                )}
              >
                {icon}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 bg-slate-700/50 rounded-md animate-pulse" />
              <div className="h-4 w-32 bg-slate-700/30 rounded-md animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                {valuePrefix && (
                  <span className="text-sm text-slate-400">{valuePrefix}</span>
                )}
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                  {value}
                </h3>
                {valueSuffix && (
                  <span className="text-sm text-slate-400">{valueSuffix}</span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                {description && (
                  <p className="text-xs text-slate-400">{description}</p>
                )}

                {trend && trendDetails && (
                  <Badge
                    className={cn(
                      "text-xs",
                      trendDetails.color,
                      trendDetails.bgColor,
                      trendDetails.borderColor,
                      "border"
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {trendDetails.icon}
                      {Math.abs(trend.value)}%
                      {trend.label && <span className="ml-1">{trend.label}</span>}
                    </span>
                  </Badge>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatisticsCard;
