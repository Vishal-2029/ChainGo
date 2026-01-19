import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "gold" | "blue" | "success" | "mining" | "none";
}

export function GlassCard({ 
  children, 
  className, 
  hover = true,
  glow = "none",
  ...props 
}: GlassCardProps) {
  const glowClasses = {
    gold: "hover:glow-gold",
    blue: "hover:glow-blue",
    success: "hover:glow-success",
    mining: "hover:glow-mining",
    none: "",
  };

  return (
    <motion.div
      className={cn(
        "glass rounded-lg p-6 transition-all duration-300",
        hover && "glass-hover cursor-pointer",
        hover && "hover:-translate-y-1",
        glowClasses[glow],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
