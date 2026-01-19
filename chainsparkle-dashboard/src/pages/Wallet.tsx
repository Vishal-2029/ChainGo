import { motion } from "framer-motion";
import { Wallet as WalletIcon, Plus, Copy, Eye, EyeOff, QrCode, Send, Download } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Mock wallet data
const mockWallets = [
  { 
    id: "1", 
    address: "0x4a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    publicKey: "04a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    privateKey: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    balance: 150.5,
    name: "Main Wallet"
  },
  { 
    id: "2", 
    address: "0x1e5f3b4c2a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    publicKey: "04b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
    privateKey: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    balance: 42.0,
    name: "Trading Wallet"
  },
  { 
    id: "3", 
    address: "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
    publicKey: "04c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
    privateKey: "567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    balance: 0,
    name: "Mining Rewards"
  },
];

export function Wallet() {
  const [selectedWallet, setSelectedWallet] = useState(mockWallets[0]);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

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
            <WalletIcon className="w-8 h-8 text-primary" />
            Wallet Manager
          </h1>
          <p className="text-foreground-secondary mt-1">Create and manage your ChainGo wallets</p>
        </div>
        
        <Button className="gradient-gold-blue text-primary-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Create New Wallet
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Wallets</h2>
          {mockWallets.map((wallet, index) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <GlassCard
                hover
                className={cn(
                  "cursor-pointer transition-all",
                  selectedWallet.id === wallet.id && "border-primary/50 glow-gold"
                )}
                onClick={() => setSelectedWallet(wallet)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{wallet.name}</p>
                    <p className="text-xs font-mono text-foreground-muted">
                      {truncateAddress(wallet.address)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg gradient-gold-blue-text">
                      {wallet.balance.toFixed(2)}
                    </p>
                    <p className="text-xs text-foreground-muted">ChainGo</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Selected Wallet Details */}
        <div className="lg:col-span-2">
          <motion.div
            key={selectedWallet.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="space-y-6">
              {/* Wallet Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedWallet.name}</h3>
                  <p className="text-sm text-foreground-secondary">Wallet Details</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/10">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Balance */}
              <div className="text-center py-8 border-y border-border/50">
                <p className="text-sm text-foreground-secondary mb-2">Available Balance</p>
                <p className="text-5xl font-bold gradient-gold-blue-text">
                  {selectedWallet.balance.toFixed(2)}
                </p>
                <p className="text-foreground-muted mt-1">ChainGo</p>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-foreground-secondary mb-2 block">Wallet Address</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background-tertiary">
                    <code className="flex-1 text-sm font-mono text-foreground break-all">
                      {selectedWallet.address}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(selectedWallet.address, "Address")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Public Key */}
                <div>
                  <label className="text-sm text-foreground-secondary mb-2 block">Public Key</label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background-tertiary">
                    <code className="flex-1 text-xs font-mono text-foreground-muted break-all">
                      {selectedWallet.publicKey}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(selectedWallet.publicKey, "Public Key")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Private Key */}
                <div>
                  <label className="text-sm text-foreground-secondary mb-2 block flex items-center gap-2">
                    Private Key
                    <span className="text-xs text-destructive">(Keep secret!)</span>
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background-tertiary border border-destructive/20">
                    <code className={cn(
                      "flex-1 text-xs font-mono break-all transition-all",
                      showPrivateKey ? "text-foreground" : "text-transparent select-none blur-sm"
                    )}>
                      {selectedWallet.privateKey}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    {showPrivateKey && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(selectedWallet.privateKey, "Private Key")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button className="gradient-gold-blue text-primary-foreground flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
                <Button variant="outline" className="flex-1 border-secondary text-secondary hover:bg-secondary/10">
                  <Download className="w-4 h-4 mr-2" />
                  Receive
                </Button>
                <Button variant="outline" className="border-foreground-muted text-foreground-secondary hover:bg-background-tertiary">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
