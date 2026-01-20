import { motion } from "framer-motion";
import { Wallet as WalletIcon, Plus, Copy, Eye, EyeOff, QrCode, Send, Download, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api, Wallet as WalletType } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface WalletWithBalance extends WalletType {
  id: string;
  name: string;
  balance: number;
}

export function Wallet() {
  const [wallets, setWallets] = useState<WalletWithBalance[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletWithBalance | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load wallets from localStorage on mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("chaingo_wallets");
    if (savedWallets) {
      const parsed = JSON.parse(savedWallets);
      setWallets(parsed);
      if (parsed.length > 0) {
        setSelectedWallet(parsed[0]);
      }
    }
  }, []);

  // Fetch balances for all wallets
  const fetchBalances = useCallback(async () => {
    if (wallets.length === 0) return;

    setLoading(true);
    try {
      const updatedWallets = await Promise.all(
        wallets.map(async (wallet) => {
          try {
            const balanceData = await api.getWalletBalance(wallet.address);
            return { ...wallet, balance: balanceData.balance };
          } catch {
            return wallet;
          }
        })
      );
      setWallets(updatedWallets);
      localStorage.setItem("chaingo_wallets", JSON.stringify(updatedWallets));

      // Update selected wallet if it exists
      if (selectedWallet) {
        const updated = updatedWallets.find(w => w.address === selectedWallet.address);
        if (updated) setSelectedWallet(updated);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
    setLoading(false);
  }, [wallets, selectedWallet]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [wallets.length]);

  const createWallet = async () => {
    setCreating(true);
    try {
      const newWallet = await api.createWallet();
      const walletWithMeta: WalletWithBalance = {
        ...newWallet,
        id: Date.now().toString(),
        name: `Wallet ${wallets.length + 1}`,
        balance: 0,
      };

      const updatedWallets = [...wallets, walletWithMeta];
      setWallets(updatedWallets);
      setSelectedWallet(walletWithMeta);
      localStorage.setItem("chaingo_wallets", JSON.stringify(updatedWallets));

      toast({
        title: "Wallet Created",
        description: "Your new wallet has been created. Save your private key!",
      });
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create wallet. Is the backend running?",
        variant: "destructive",
      });
    }
    setCreating(false);
  };

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

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onClick={fetchBalances}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <Button
            className="gradient-gold-blue text-primary-foreground font-semibold"
            onClick={createWallet}
            disabled={creating}
          >
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Create New Wallet
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Wallets ({wallets.length})</h2>
          {wallets.length > 0 ? (
            wallets.map((wallet, index) => (
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
                    selectedWallet?.id === wallet.id && "border-primary/50 glow-gold"
                  )}
                  onClick={() => {
                    setSelectedWallet(wallet);
                    setShowPrivateKey(false);
                  }}
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
            ))
          ) : (
            <GlassCard className="text-center py-8 text-foreground-muted">
              No wallets yet. Create your first wallet!
            </GlassCard>
          )}
        </div>

        {/* Selected Wallet Details */}
        <div className="lg:col-span-2">
          {selectedWallet ? (
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
                  <Button
                    className="gradient-gold-blue text-primary-foreground flex-1"
                    onClick={() => navigate("/transactions")}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-secondary text-secondary hover:bg-secondary/10"
                    onClick={() => copyToClipboard(selectedWallet.address, "Address")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                  <Button
                    variant="outline"
                    className="border-foreground-muted text-foreground-secondary hover:bg-background-tertiary"
                    onClick={() => {
                      const walletData = JSON.stringify(selectedWallet, null, 2);
                      const blob = new Blob([walletData], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `wallet-${selectedWallet.address.slice(0, 8)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: "Exported", description: "Wallet exported to JSON file" });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="text-center py-16 text-foreground-muted">
              <WalletIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a wallet or create a new one</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
