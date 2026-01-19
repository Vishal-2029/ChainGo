import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Block {
  height: number;
  hash: string;
  txCount: number;
  time: string;
}

interface BlockChainVisualProps {
  blocks: Block[];
}

export function BlockChainVisual({ blocks }: BlockChainVisualProps) {
  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradient overlay for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      
      <div className="flex items-center gap-2 animate-chain-flow">
        {[...blocks, ...blocks].map((block, index) => (
          <div key={`${block.height}-${index}`} className="flex items-center">
            <motion.div
              className={cn(
                "glass rounded-lg p-4 min-w-[140px] cursor-pointer transition-all duration-300",
                "hover:border-primary/50 hover:glow-gold hover:-translate-y-1"
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: (index % blocks.length) * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-center">
                <p className="text-xs text-foreground-muted mb-1">Block</p>
                <p className="text-lg font-bold gradient-gold-blue-text">#{block.height}</p>
                <p className="text-xs font-mono text-foreground-secondary mt-2 truncate max-w-[120px]">
                  {block.hash.slice(0, 8)}...
                </p>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-foreground-muted">
                  <span>{block.txCount} txs</span>
                  <span>•</span>
                  <span>{block.time}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Connection line */}
            <div className="flex items-center mx-1">
              <div className="w-6 h-0.5 gradient-gold-blue rounded-full" />
              <div className="w-2 h-2 rounded-full gradient-gold-blue" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
