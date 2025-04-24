import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Settings, X, ChevronRight } from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string | Date;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
  actionLabel?: string;
  onAction?: () => void;
  link?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * NotificationPanel - A modern panel for displaying notifications
 */
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  onSettingsClick,
  title = "Notificări",
  emptyMessage = "Nu aveți notificări noi",
  className,
}) => {
  // Format time
  const formatTime = (time: string | Date) => {
    if (typeof time === "string") {
      time = new Date(time);
    }
    
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Acum";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}z`;
    
    return time.toLocaleDateString();
  };

  // Get notification type styles
  const getNotificationTypeStyles = (type: Notification["type"] = "info") => {
    switch (type) {
      case "success":
        return {
          icon: <Check className="h-5 w-5 text-green-400" />,
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20",
          iconBg: "bg-green-500/20",
        };
      case "warning":
        return {
          icon: <Bell className="h-5 w-5 text-amber-400" />,
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          iconBg: "bg-amber-500/20",
        };
      case "error":
        return {
          icon: <X className="h-5 w-5 text-rose-400" />,
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/20",
          iconBg: "bg-rose-500/20",
        };
      case "info":
      default:
        return {
          icon: <Bell className="h-5 w-5 text-indigo-400" />,
          bgColor: "bg-indigo-500/10",
          borderColor: "border-indigo-500/20",
          iconBg: "bg-indigo-500/20",
        };
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute top-16 right-4 w-80 md:w-96 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{title}</h3>
              {unreadCount > 0 && (
                <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
                  {unreadCount} noi
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                onClick={onSettingsClick}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-12 w-12 text-slate-600 mb-3" />
                <p className="text-slate-400">{emptyMessage}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {notifications.map((notification) => {
                  const typeStyles = getNotificationTypeStyles(notification.type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        "p-4 hover:bg-slate-700/30 transition-colors cursor-pointer relative",
                        !notification.read && "bg-slate-700/20"
                      )}
                      onClick={() => onNotificationClick?.(notification)}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                      )}
                      <div className="flex gap-3">
                        <div className={cn("p-2 rounded-full shrink-0", typeStyles.iconBg)}>
                          {typeStyles.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-white truncate pr-2">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {formatTime(notification.time)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          {notification.actionLabel && (
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.onAction?.();
                                }}
                              >
                                {notification.actionLabel}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between p-3 border-t border-slate-700/50 bg-slate-800/50">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 text-xs h-8"
                onClick={onMarkAllAsRead}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Marchează toate ca citite
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 text-xs h-8"
                onClick={onClearAll}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Șterge toate
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
