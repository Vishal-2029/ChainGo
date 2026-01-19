import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  glow?: "gold" | "blue" | "success" | "mining";
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  glow = "gold",
  delay = 0 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <GlassCard glow={glow} className="relative overflow-hidden">
        {/* Background glow effect */}
        <div 
          className={cn(
            "absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl",
            glow === "gold" && "bg-primary",
            glow === "blue" && "bg-secondary",
            glow === "success" && "bg-success",
            glow === "mining" && "bg-mining"
          )}
        />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-foreground-secondary font-medium">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-foreground tracking-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-foreground-muted">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-sm font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          
          <div className={cn(
            "p-3 rounded-xl",
            glow === "gold" && "bg-primary/10",
            glow === "blue" && "bg-secondary/10",
            glow === "success" && "bg-success/10",
            glow === "mining" && "bg-mining/10"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              glow === "gold" && "text-primary",
              glow === "blue" && "text-secondary",
              glow === "success" && "text-success",
              glow === "mining" && "text-mining"
            )} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
