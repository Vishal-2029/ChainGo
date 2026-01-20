import { motion } from "framer-motion";
import { Pickaxe, Play, Square, TrendingUp, Clock, Award, Zap, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { api, Block } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MiningActivity {
  block: number;
  reward: number;
  time: string;
  difficulty: string;
}

interface WalletData {
  id: string;
  address: string;
  name: string;
}

export function Mining() {
  const [isMining, setIsMining] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [blocksMined, setBlocksMined] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [miningActivities, setMiningActivities] = useState<MiningActivity[]>([]);
  const [hashRate, setHashRate] = useState(0);
  const [miningDuration, setMiningDuration] = useState(0);
  const miningInterval = useRef<NodeJS.Timeout | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load wallets from localStorage
  useEffect(() => {
    const savedWallets = localStorage.getItem("chaingo_wallets");
    if (savedWallets) {
      const parsed = JSON.parse(savedWallets);
      setWallets(parsed);
      if (parsed.length > 0) {
        setSelectedWallet(parsed[0].address);
      }
    }

    // Load mining stats
    const savedStats = localStorage.getItem("chaingo_mining_stats");
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setBlocksMined(stats.blocksMined || 0);
      setTotalRewards(stats.totalRewards || 0);
      setMiningActivities(stats.activities || []);
    }
  }, []);

  // Save mining stats
  const saveStats = useCallback(() => {
    localStorage.setItem("chaingo_mining_stats", JSON.stringify({
      blocksMined,
      totalRewards,
      activities: miningActivities.slice(0, 10),
    }));
  }, [blocksMined, totalRewards, miningActivities]);

  useEffect(() => {
    saveStats();
  }, [blocksMined, totalRewards, miningActivities, saveStats]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const mineBlock = async () => {
    if (!selectedWallet || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await api.mine(selectedWallet);

      const newActivity: MiningActivity = {
        block: result.block.index,
        reward: result.block.reward,
        time: "Just now",
        difficulty: "0000",
      };

      setMiningActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setBlocksMined(prev => prev + 1);
      setTotalRewards(prev => prev + result.block.reward);

      toast({
        title: "Block Mined!",
        description: `Block #${result.block.index} mined successfully! Reward: ${result.block.reward} ChainGo`,
      });

      // Update hash rate simulation
      setHashRate(Math.floor(Math.random() * 500) + 1000);
    } catch (error: any) {
      toast({
        title: "Mining Failed",
        description: error.message || "Failed to mine block. Is the backend running?",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const startMining = () => {
    if (!selectedWallet) {
      toast({
        title: "No Wallet Selected",
        description: "Please create a wallet first to receive mining rewards.",
        variant: "destructive",
      });
      return;
    }

    setIsMining(true);
    setHashRate(Math.floor(Math.random() * 500) + 1000);

    // Start duration counter
    durationInterval.current = setInterval(() => {
      setMiningDuration(prev => prev + 1);
    }, 1000);

    // Mine a block immediately, then every 10 seconds
    mineBlock();
    miningInterval.current = setInterval(mineBlock, 10000);
  };

  const stopMining = () => {
    setIsMining(false);
    setHashRate(0);

    if (miningInterval.current) {
      clearInterval(miningInterval.current);
      miningInterval.current = null;
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (miningInterval.current) clearInterval(miningInterval.current);
      if (durationInterval.current) clearInterval(durationInterval.current);
    };
  }, []);

  const successRate = blocksMined > 0 ? Math.min(100, Math.floor(87 + Math.random() * 10)) : 0;

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
              {isProcessing && (
                <span className="ml-2 text-sm text-mining animate-pulse">Processing block...</span>
              )}
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
                {isProcessing ? (
                  <Loader2 className="w-12 h-12 text-mining animate-spin" />
                ) : (
                  <Pickaxe className={cn(
                    "w-12 h-12 transition-colors",
                    isMining ? "text-mining" : "text-foreground-muted"
                  )} />
                )}
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
                <p className="text-4xl font-bold gradient-gold-blue-text">{hashRate.toLocaleString()} H/s</p>
              </motion.div>
            )}

            {/* Wallet Selector */}
            <div className="mb-8 max-w-xs mx-auto">
              <label className="text-sm text-foreground-secondary block mb-2">Mining Reward Address</label>
              {wallets.length > 0 ? (
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  disabled={isMining}
                  className="w-full p-3 rounded-lg bg-background-tertiary border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-mining/50 disabled:opacity-50"
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.name} ({wallet.address.slice(0, 10)}...)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-4 text-foreground-muted">
                  <p className="mb-2">No wallets found.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = "/wallet"}
                    className="border-primary text-primary"
                  >
                    Create Wallet First
                  </Button>
                </div>
              )}
            </div>

            {/* Control Button */}
            <Button
              size="lg"
              onClick={() => isMining ? stopMining() : startMining()}
              disabled={isProcessing || wallets.length === 0}
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
          value={blocksMined.toString()}
          subtitle="Lifetime"
          icon={Award}
          glow="gold"
          delay={0.2}
        />
        <StatCard
          title="Total Rewards"
          value={totalRewards.toLocaleString()}
          subtitle="ChainGo earned"
          icon={TrendingUp}
          trend={{ value: `+${blocksMined * 50} total`, positive: true }}
          glow="mining"
          delay={0.3}
        />
        <StatCard
          title="Mining Duration"
          value={formatDuration(miningDuration)}
          subtitle="Current session"
          icon={Clock}
          glow="blue"
          delay={0.4}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
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
          {miningActivities.length > 0 ? (
            miningActivities.map((item, index) => (
              <motion.div
                key={`${item.block}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard className="flex items-center justify-between">
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
              </motion.div>
            ))
          ) : (
            <GlassCard className="text-center py-8 text-foreground-muted">
              No mining activity yet. Start mining to earn rewards!
            </GlassCard>
          )}
        </div>
      </motion.div>
    </div>
  );
}
