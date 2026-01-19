import { motion } from "framer-motion";
import { Blocks, ArrowRightLeft, Users, Pickaxe, TrendingUp, Clock, Hash } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { BlockChainVisual } from "@/components/ui/BlockChainVisual";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const mockBlocks = [
  { height: 125, hash: "0000ae3b9c7d1e5f4a2b8c9d0e1f2a3b", txCount: 5, time: "2m ago" },
  { height: 124, hash: "0000def456789abc123def456789abcd", txCount: 3, time: "4m ago" },
  { height: 123, hash: "0000123abc456def789012345abcdef0", txCount: 8, time: "7m ago" },
  { height: 122, hash: "0000fedcba9876543210fedcba987654", txCount: 2, time: "10m ago" },
  { height: 121, hash: "0000abcdef123456789abcdef1234567", txCount: 6, time: "12m ago" },
];

const mockActivities = [
  { id: "1", type: "mining" as const, message: "Block #125 mined successfully", details: "Reward: 50 ChainGo", time: "Just now" },
  { id: "2", type: "transaction" as const, message: "New transaction received", details: "0x4a2b...8c9d → 0x1e5f...3b4c", time: "1m ago" },
  { id: "3", type: "peer_connect" as const, message: "New peer connected", details: "192.168.1.105:9001", time: "2m ago" },
  { id: "4", type: "transaction" as const, message: "Transaction confirmed", details: "0xdef4...89ab → 0x5678...cdef", time: "3m ago" },
  { id: "5", type: "mining" as const, message: "Block #124 mined", details: "Reward: 50 ChainGo", time: "4m ago" },
  { id: "6", type: "peer_disconnect" as const, message: "Peer disconnected", details: "192.168.1.102:9001", time: "5m ago" },
];

const mockRecentBlocks = [
  { height: 125, hash: "0000ae3b9c7d1e5f4a2b8c9d0e1f2a3b", txCount: 5, miner: "abc123...def", time: "2 mins ago" },
  { height: 124, hash: "0000def456789abc123def456789abcd", txCount: 3, miner: "xyz789...ghi", time: "4 mins ago" },
  { height: 123, hash: "0000123abc456def789012345abcdef0", txCount: 8, miner: "abc123...def", time: "7 mins ago" },
];

export function Dashboard() {
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
        <BlockChainVisual blocks={mockBlocks} />

        {/* Mining CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-6"
        >
          <Button 
            size="lg" 
            className="gradient-gold-blue text-primary-foreground font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-pulse-glow"
          >
            <Pickaxe className="w-5 h-5 mr-2" />
            Start Mining
          </Button>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Blocks"
          value="125"
          subtitle="Last mined 2m ago"
          icon={Blocks}
          trend={{ value: "+3 today", positive: true }}
          glow="gold"
          delay={0}
        />
        <StatCard
          title="Pending TXs"
          value="8"
          subtitle="In mempool"
          icon={ArrowRightLeft}
          glow="blue"
          delay={0.1}
        />
        <StatCard
          title="Network Peers"
          value="5"
          subtitle="Active connections"
          icon={Users}
          trend={{ value: "+2 this hour", positive: true }}
          glow="success"
          delay={0.2}
        />
        <StatCard
          title="Hash Rate"
          value="1,234 H/s"
          subtitle="Current mining power"
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
              <Button variant="ghost" size="sm" className="text-foreground-secondary hover:text-foreground">
                View All →
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockRecentBlocks.map((block, index) => (
                <motion.div
                  key={block.height}
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
                          Block <span className="gradient-gold-blue-text">#{block.height}</span>
                        </p>
                        <p className="text-sm font-mono text-foreground-muted">
                          {block.hash.slice(0, 16)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-foreground-muted" />
                        <span className="text-foreground-secondary">{block.txCount} txs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-foreground-muted" />
                        <span className="text-foreground-secondary">{block.time}</span>
                      </div>
                      <StatusBadge status="confirmed" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
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
            <ActivityFeed activities={mockActivities} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
