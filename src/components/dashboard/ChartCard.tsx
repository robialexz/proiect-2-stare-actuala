import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw } from "lucide-react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  isLoading?: boolean;
  showControls?: boolean;
  showDownload?: boolean;
  showRefresh?: boolean;
  showFilter?: boolean;
  showDateRange?: boolean;
  onRefresh?: () => void;
  onDownload?: () => void;
  onFilter?: () => void;
  onDateRangeChange?: () => void;
  dateRangeText?: string;
  headerRight?: React.ReactNode;
  footerContent?: React.ReactNode;
}

/**
 * ChartCard - A modern card component for displaying charts and graphs
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  className,
  gradientFrom = "from-indigo-500",
  gradientTo = "to-blue-500",
  isLoading = false,
  showControls = false,
  showDownload = false,
  showRefresh = false,
  showFilter = false,
  showDateRange = false,
  onRefresh,
  onDownload,
  onFilter,
  onDateRangeChange,
  dateRangeText = "Last 30 days",
  headerRight,
  footerContent,
}) => {
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
            "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 rounded-full blur-3xl transform translate-x-20 -translate-y-20",
            gradientFrom,
            gradientTo
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr opacity-10 rounded-full blur-3xl transform -translate-x-20 translate-y-20",
            gradientFrom,
            gradientTo
          )}
        />

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn(
                    "h-4 w-1 rounded-full bg-gradient-to-b",
                    gradientFrom,
                    gradientTo
                  )}
                />
                <CardTitle className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                  {title}
                </CardTitle>
              </div>
              {description && (
                <CardDescription className="text-slate-400 text-sm">
                  {description}
                </CardDescription>
              )}
            </div>

            <div className="flex items-center gap-2">
              {headerRight}
              
              {showControls && (
                <div className="flex items-center gap-1.5">
                  {showDateRange && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                      onClick={onDateRangeChange}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">{dateRangeText}</span>
                    </Button>
                  )}
                  
                  {showFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                      onClick={onFilter}
                    >
                      <Filter className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  {showRefresh && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                      onClick={onRefresh}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  {showDownload && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
                      onClick={onDownload}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="relative z-10">
              {children}
            </div>
          )}
          
          {footerContent && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              {footerContent}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChartCard;
