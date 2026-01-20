import { motion } from "framer-motion";
import { Blocks as BlocksIcon, Hash, ArrowRightLeft, Clock, Search, ChevronRight, Trash2, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { api, Block } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Blocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);
  const { toast } = useToast();

  const fetchBlocks = useCallback(async () => {
    try {
      const chainData = await api.getChain();
      setBlocks(chainData.chain.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      toast({
        title: "Connection Error",
        description: "Failed to fetch blocks. Make sure the backend is running.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 10000);
    return () => clearInterval(interval);
  }, [fetchBlocks]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds} secs ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  const handleDeleteBlock = async (index: number) => {
    try {
      await api.deleteBlock(index);
      toast({
        title: "Block Deleted",
        description: `Block #${index} has been deleted from the chain.`,
      });
      fetchBlocks();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete block.",
        variant: "destructive",
      });
    }
  };

  const filteredBlocks = blocks.filter((block) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      block.index.toString().includes(query) ||
      block.hash.toLowerCase().includes(query)
    );
  });

  const displayedBlocks = filteredBlocks.slice(0, displayCount);

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
          <p className="text-foreground-secondary mt-1">
            Browse the ChainGo blockchain ({blocks.length} blocks)
          </p>
        </div>

        <div className="flex gap-3">
          {/* Refresh Button */}
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onClick={fetchBlocks}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

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
        </div>
      </motion.div>

      {/* Blocks List */}
      <div className="space-y-4">
        {loading ? (
          <GlassCard className="text-center py-8 text-foreground-muted">
            Loading blocks...
          </GlassCard>
        ) : displayedBlocks.length > 0 ? (
          displayedBlocks.map((block, index) => (
            <motion.div
              key={block.index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
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
                          #{block.index}
                        </span>
                        <StatusBadge status="confirmed" />
                      </div>
                      <p className="text-sm font-mono text-foreground-muted break-all">
                        {block.hash}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        Prev: {block.previousHash.slice(0, 32)}...
                      </p>
                    </div>
                  </div>

                  {/* Block Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-secondary" />
                      <span className="text-foreground-secondary">
                        <span className="font-semibold text-foreground">{block.transactions?.length || 0}</span> transactions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-foreground-muted" />
                      <span className="text-foreground-secondary">{formatTimeAgo(block.timestamp)}</span>
                    </div>
                    <div className="text-foreground-muted">
                      Nonce: <span className="font-mono text-foreground-secondary">{block.nonce}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>

                    {/* Delete Button */}
                    {block.index > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Delete Block #{block.index}?</AlertDialogTitle>
                            <AlertDialogDescription className="text-foreground-muted">
                              This will remove block #{block.index} and all subsequent blocks from the chain.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border text-foreground-secondary">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBlock(block.index)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Block
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                {/* Transactions Info */}
                {block.transactions && block.transactions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-foreground-muted mb-2">Transactions:</p>
                    <div className="space-y-2">
                      {block.transactions.slice(0, 3).map((tx, txIndex) => (
                        <div key={txIndex} className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-secondary">{tx.from.slice(0, 12)}...</span>
                          <ArrowRightLeft className="w-3 h-3 text-foreground-muted" />
                          <span className="font-mono text-primary">{tx.to.slice(0, 12)}...</span>
                          <span className="font-bold text-foreground">{tx.amount} ChainGo</span>
                        </div>
                      ))}
                      {block.transactions.length > 3 && (
                        <p className="text-xs text-foreground-muted">
                          +{block.transactions.length - 3} more transactions
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <GlassCard className="text-center py-8 text-foreground-muted">
            {searchQuery ? "No blocks match your search." : "No blocks yet. Start mining!"}
          </GlassCard>
        )}
      </div>

      {/* Load More */}
      {displayedBlocks.length < filteredBlocks.length && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onClick={() => setDisplayCount((prev) => prev + 10)}
          >
            Load More Blocks ({filteredBlocks.length - displayedBlocks.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
