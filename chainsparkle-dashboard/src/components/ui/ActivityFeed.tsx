import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Pickaxe, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType = "transaction" | "mining" | "peer_connect" | "peer_disconnect";

interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
  details?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityConfig = {
  transaction: {
    icon: ArrowRightLeft,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  mining: {
    icon: Pickaxe,
    color: "text-mining",
    bg: "bg-mining/10",
  },
  peer_connect: {
    icon: Wifi,
    color: "text-success",
    bg: "bg-success/10",
  },
  peer_disconnect: {
    icon: WifiOff,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      <AnimatePresence mode="popLayout">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass rounded-lg p-4 flex items-start gap-4 glass-hover"
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.message}</p>
                {activity.details && (
                  <p className="text-xs font-mono text-foreground-muted truncate mt-1">
                    {activity.details}
                  </p>
                )}
              </div>
              
              <span className="text-xs text-foreground-muted whitespace-nowrap">
                {activity.time}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
