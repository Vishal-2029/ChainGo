import { motion } from "framer-motion";
import { Blocks, ArrowRightLeft, Users, Pickaxe, TrendingUp, Clock, Hash, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { BlockChainVisual } from "@/components/ui/BlockChainVisual";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { api, Block } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  type: "mining" | "transaction" | "peer_connect" | "peer_disconnect";
  message: string;
  details: string;
  time: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    blocks: 0,
    pendingTransactions: 0,
    totalTransactions: 0,
    latestBlockHash: "",
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [peers, setPeers] = useState<string[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [chainData, statsData, peersData, pendingData] = await Promise.all([
        api.getChain(),
        api.getChainStats(),
        api.listPeers(),
        api.getPendingTransactions(),
      ]);

      setStats(statsData);
      setBlocks(chainData.chain);
      setRecentBlocks(chainData.chain.slice(-3).reverse());
      setPeers(peersData.peers || []);

      // Generate activities from recent data
      const newActivities: Activity[] = [];
      if (chainData.chain.length > 0) {
        const latestBlock = chainData.chain[chainData.chain.length - 1];
        newActivities.push({
          id: "1",
          type: "mining",
          message: `Block #${latestBlock.index} mined`,
          details: `${latestBlock.transactions?.length || 0} transactions`,
          time: "Just now",
        });
      }

      if (pendingData.count > 0) {
        newActivities.push({
          id: "2",
          type: "transaction",
          message: `${pendingData.count} pending transactions`,
          details: "In mempool",
          time: "Now",
        });
      }

      if (peersData.peers?.length > 0) {
        newActivities.push({
          id: "3",
          type: "peer_connect",
          message: `${peersData.peers.length} peers connected`,
          details: peersData.peers[0] || "Network active",
          time: "Active",
        });
      }

      setActivities(newActivities);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to blockchain. Make sure the backend is running.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const visualBlocks = blocks.slice(-5).map((block) => ({
    height: block.index,
    hash: block.hash,
    txCount: block.transactions?.length || 0,
    time: formatTimeAgo(block.timestamp),
  }));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-gold-blue-text">ChainGo</span> Blockchain
          </h1>
          <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
            Real-time blockchain monitoring, transaction processing, and mining control.
            Your gateway to the decentralized future.
          </p>
        </motion.div>

        {/* Animated Chain Visualization */}
        {visualBlocks.length > 0 ? (
          <BlockChainVisual blocks={visualBlocks} />
        ) : (
          <div className="text-center py-8 text-foreground-muted">
            {loading ? "Loading blockchain..." : "No blocks yet. Start mining!"}
          </div>
        )}

        {/* Mining CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-4 mt-6"
        >
          <Button
            size="lg"
            className="gradient-gold-blue text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-pulse-glow"
            onClick={() => navigate("/mining")}
          >
            <Pickaxe className="w-5 h-5 mr-2" />
            Start Mining
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary font-semibold text-lg px-8 py-6 rounded-full"
            onClick={fetchData}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </Button>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Blocks"
          value={stats.blocks.toString()}
          subtitle={recentBlocks[0] ? `Last mined ${formatTimeAgo(recentBlocks[0].timestamp)}` : "No blocks yet"}
          icon={Blocks}
          trend={{ value: `${stats.blocks} total`, positive: true }}
          glow="gold"
          delay={0}
        />
        <StatCard
          title="Pending TXs"
          value={stats.pendingTransactions.toString()}
          subtitle="In mempool"
          icon={ArrowRightLeft}
          glow="blue"
          delay={0.1}
        />
        <StatCard
          title="Network Peers"
          value={peers.length.toString()}
          subtitle="Active connections"
          icon={Users}
          trend={{ value: peers.length > 0 ? "Connected" : "No peers", positive: peers.length > 0 }}
          glow="success"
          delay={0.2}
        />
        <StatCard
          title="Total TXs"
          value={stats.totalTransactions.toString()}
          subtitle="All transactions"
          icon={TrendingUp}
          glow="mining"
          delay={0.3}
        />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Blocks */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Blocks className="w-5 h-5 text-primary" />
                Latest Blocks
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground-secondary hover:text-foreground"
                onClick={() => navigate("/blocks")}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {recentBlocks.length > 0 ? (
                recentBlocks.map((block, index) => (
                  <motion.div
                    key={block.index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Hash className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            Block <span className="gradient-gold-blue-text">#{block.index}</span>
                          </p>
                          <p className="text-sm font-mono text-foreground-muted">
                            {block.hash.slice(0, 16)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="w-4 h-4 text-foreground-muted" />
                          <span className="text-foreground-secondary">{block.transactions?.length || 0} txs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-foreground-muted" />
                          <span className="text-foreground-secondary">{formatTimeAgo(block.timestamp)}</span>
                        </div>
                        <StatusBadge status="confirmed" />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              ) : (
                <GlassCard className="text-center py-8 text-foreground-muted">
                  {loading ? "Loading blocks..." : "No blocks yet. Start mining to create the first block!"}
                </GlassCard>
              )}
            </div>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Live Activity
            </h2>
            <ActivityFeed activities={activities.length > 0 ? activities : [
              { id: "1", type: "mining", message: "Waiting for activity...", details: "Start mining to see updates", time: "Now" }
            ]} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
