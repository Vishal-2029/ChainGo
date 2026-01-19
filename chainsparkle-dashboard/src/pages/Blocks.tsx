import { motion } from "framer-motion";
import { Blocks as BlocksIcon, Hash, ArrowRightLeft, Clock, Search, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const mockBlocks = [
  { 
    height: 125, 
    hash: "0000ae3b9c7d1e5f4a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
    prevHash: "0000def456789abc123def456789abcd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    txCount: 5, 
    miner: "0x4a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    nonce: 45892,
    time: "2 mins ago",
    timestamp: "2025-01-19T10:30:00Z"
  },
  { 
    height: 124, 
    hash: "0000def456789abc123def456789abcd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    prevHash: "0000123abc456def789012345abcdef00e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    txCount: 3, 
    miner: "0x1e5f3b4c2a8d9e0f1a2b3c4d5e6f7a8b",
    nonce: 23456,
    time: "5 mins ago",
    timestamp: "2025-01-19T10:27:00Z"
  },
  { 
    height: 123, 
    hash: "0000123abc456def789012345abcdef00e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    prevHash: "0000fedcba9876543210fedcba9876540e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    txCount: 8, 
    miner: "0x4a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    nonce: 78901,
    time: "8 mins ago",
    timestamp: "2025-01-19T10:24:00Z"
  },
  { 
    height: 122, 
    hash: "0000fedcba9876543210fedcba9876540e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    prevHash: "0000abcdef123456789abcdef12345670e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    txCount: 2, 
    miner: "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    nonce: 34567,
    time: "12 mins ago",
    timestamp: "2025-01-19T10:20:00Z"
  },
  { 
    height: 121, 
    hash: "0000abcdef123456789abcdef12345670e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    prevHash: "0000987654321fedcba987654321fedc0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    txCount: 6, 
    miner: "0x4a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d",
    nonce: 56789,
    time: "15 mins ago",
    timestamp: "2025-01-19T10:17:00Z"
  },
];

export function Blocks() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BlocksIcon className="w-8 h-8 text-primary" />
            Block Explorer
          </h1>
          <p className="text-foreground-secondary mt-1">Browse the ChainGo blockchain</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <Input
            placeholder="Search by block height or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background-tertiary border-border focus:border-primary"
          />
        </div>
      </motion.div>

      {/* Blocks List */}
      <div className="space-y-4">
        {mockBlocks.map((block, index) => (
          <motion.div
            key={block.height}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <GlassCard className="group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Block Info */}
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Hash className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold gradient-gold-blue-text">
                        #{block.height}
                      </span>
                      <StatusBadge status="confirmed" />
                    </div>
                    <p className="text-sm font-mono text-foreground-muted break-all">
                      {block.hash}
                    </p>
                  </div>
                </div>

                {/* Block Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-secondary" />
                    <span className="text-foreground-secondary">
                      <span className="font-semibold text-foreground">{block.txCount}</span> transactions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-foreground-muted" />
                    <span className="text-foreground-secondary">{block.time}</span>
                  </div>
                  <div className="text-foreground-muted">
                    Nonce: <span className="font-mono text-foreground-secondary">{block.nonce}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Miner Info */}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-sm">
                <span className="text-foreground-muted">Mined by:</span>
                <code className="font-mono text-secondary">{block.miner}</code>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          Load More Blocks
        </Button>
      </div>
    </div>
  );
}
