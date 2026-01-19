import { motion } from "framer-motion";
import { Pickaxe, Play, Square, TrendingUp, Clock, Award, Zap } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export function Mining() {
  const [isMining, setIsMining] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("0x4a2b...8c9d");

  const wallets = [
    { address: "0x4a2b...8c9d", name: "Main Wallet" },
    { address: "0x1e5f...2e3f", name: "Trading Wallet" },
    { address: "0x7f8a...5f6a", name: "Mining Rewards" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Pickaxe className="w-8 h-8 text-mining" />
          Mining Control
        </h1>
        <p className="text-foreground-secondary mt-1">Start mining and earn ChainGo rewards</p>
      </motion.div>

      {/* Mining Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className={cn(
          "text-center py-12 relative overflow-hidden transition-all duration-500",
          isMining && "border-mining/50"
        )}>
          {/* Animated background for mining state */}
          {isMining && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-mining/0 via-mining/30 to-mining/0 animate-shimmer" 
                   style={{ backgroundSize: "200% 100%" }} />
            </div>
          )}

          {/* Glow effect when mining */}
          {isMining && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-mining rounded-full opacity-20 blur-3xl animate-pulse" />
          )}

          <div className="relative z-10">
            {/* Status */}
            <div className="mb-6">
              <StatusBadge status={isMining ? "mining" : "pending"} />
            </div>

            {/* Mining Icon */}
            <motion.div
              animate={isMining ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: isMining ? Infinity : 0 }}
              className="inline-block mb-6"
            >
              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto transition-all duration-300",
                isMining ? "bg-mining/20 glow-mining" : "bg-background-tertiary"
              )}>
                <Pickaxe className={cn(
                  "w-12 h-12 transition-colors",
                  isMining ? "text-mining" : "text-foreground-muted"
                )} />
              </div>
            </motion.div>

            {/* Hash Rate Display */}
            {isMining && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <p className="text-sm text-foreground-secondary">Current Hash Rate</p>
                <p className="text-4xl font-bold gradient-gold-blue-text">1,234 H/s</p>
              </motion.div>
            )}

            {/* Wallet Selector */}
            <div className="mb-8 max-w-xs mx-auto">
              <label className="text-sm text-foreground-secondary block mb-2">Mining Reward Address</label>
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="w-full p-3 rounded-lg bg-background-tertiary border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-mining/50"
              >
                {wallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.name} ({wallet.address})
                  </option>
                ))}
              </select>
            </div>

            {/* Control Button */}
            <Button
              size="lg"
              onClick={() => setIsMining(!isMining)}
              className={cn(
                "px-12 py-6 text-lg font-bold rounded-full transition-all duration-300",
                isMining 
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                  : "gradient-gold-blue text-primary-foreground animate-pulse-glow"
              )}
            >
              {isMining ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Stop Mining
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Mining
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Mining Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Blocks Mined"
          value="42"
          subtitle="Lifetime"
          icon={Award}
          glow="gold"
          delay={0.2}
        />
        <StatCard
          title="Total Rewards"
          value="2,100"
          subtitle="ChainGo earned"
          icon={TrendingUp}
          trend={{ value: "+50 today", positive: true }}
          glow="mining"
          delay={0.3}
        />
        <StatCard
          title="Mining Duration"
          value="3h 24m"
          subtitle="Current session"
          icon={Clock}
          glow="blue"
          delay={0.4}
        />
        <StatCard
          title="Success Rate"
          value="87%"
          subtitle="Block found rate"
          icon={Zap}
          glow="success"
          delay={0.5}
        />
      </section>

      {/* Mining History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-mining" />
          Recent Mining Activity
        </h2>
        
        <div className="space-y-3">
          {[
            { block: 125, reward: 50, time: "2 mins ago", difficulty: "0000" },
            { block: 120, reward: 50, time: "15 mins ago", difficulty: "0000" },
            { block: 118, reward: 50, time: "22 mins ago", difficulty: "0000" },
          ].map((item, index) => (
            <GlassCard key={item.block} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-mining/10">
                  <Award className="w-5 h-5 text-mining" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Block <span className="gradient-gold-blue-text">#{item.block}</span> mined
                  </p>
                  <p className="text-sm text-foreground-muted">Difficulty: {item.difficulty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">+{item.reward} ChainGo</p>
                <p className="text-xs text-foreground-muted">{item.time}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
