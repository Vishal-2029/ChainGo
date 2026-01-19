import { cn } from "@/lib/utils";

type BadgeStatus = "confirmed" | "pending" | "failed" | "mining" | "syncing";

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    className: "bg-success/10 text-success border-success",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive",
  },
  mining: {
    label: "Mining",
    className: "bg-mining/10 text-mining border-mining animate-pulse",
  },
  syncing: {
    label: "Syncing",
    className: "bg-secondary/10 text-secondary border-secondary animate-pulse",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
      config.className,
      className
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "confirmed" && "bg-success",
        status === "pending" && "bg-warning",
        status === "failed" && "bg-destructive",
        status === "mining" && "bg-mining",
        status === "syncing" && "bg-secondary"
      )} />
      {config.label}
    </span>
  );
}
