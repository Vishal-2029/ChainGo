import { motion } from "framer-motion";
import { ArrowRightLeft, Send, Clock, History, Search, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { api, Transaction, Block } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface WalletData {
  id: string;
  address: string;
  privateKey: string;
  name: string;
  balance: number;
}

interface ConfirmedTx extends Transaction {
  hash: string;
  blockIndex: number;
  time: string;
  status: "confirmed";
}

interface PendingTx extends Transaction {
  hash: string;
  status: "pending";
  priority: string;
}

export function Transactions() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmedTxs, setConfirmedTxs] = useState<ConfirmedTx[]>([]);
  const [pendingTxs, setPendingTxs] = useState<PendingTx[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
  }, []);

  // Auto-fill private key when wallet is selected
  useEffect(() => {
    const wallet = wallets.find(w => w.address === selectedWallet);
    if (wallet) {
      setPrivateKey(wallet.privateKey);
    }
  }, [selectedWallet, wallets]);

  const fetchTransactions = useCallback(async () => {
    try {
      const [chainData, pendingData] = await Promise.all([
        api.getChain(),
        api.getPendingTransactions(),
      ]);

      // Extract confirmed transactions from blocks
      const confirmed: ConfirmedTx[] = [];
      chainData.chain.forEach((block: Block) => {
        if (block.transactions) {
          block.transactions.forEach((tx, txIndex) => {
            confirmed.push({
              ...tx,
              hash: `${block.hash.slice(0, 16)}-${txIndex}`,
              blockIndex: block.index,
              time: formatTimeAgo(block.timestamp),
              status: "confirmed",
            });
          });
        }
      });

      // Get pending transactions
      const pending: PendingTx[] = (pendingData.transactions || []).map((tx: any, index: number) => ({
        ...tx,
        hash: `pending-${index}`,
        status: "pending" as const,
        priority: tx.amount > 50 ? "high" : tx.amount > 10 ? "medium" : "low",
      }));

      setConfirmedTxs(confirmed.reverse());
      setPendingTxs(pending);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const handleSendTransaction = async () => {
    if (!selectedWallet || !toAddress || !amount || !privateKey) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await api.createTransaction(
        selectedWallet,
        toAddress,
        parseInt(amount),
        privateKey
      );

      toast({
        title: "Transaction Sent",
        description: "Your transaction has been submitted to the mempool.",
      });

      setToAddress("");
      setAmount("");
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction.",
        variant: "destructive",
      });
    }
    setSending(false);
  };

  const filteredConfirmedTxs = confirmedTxs.filter((tx) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.from.toLowerCase().includes(query) ||
      tx.to.toLowerCase().includes(query) ||
      tx.hash.toLowerCase().includes(query)
    );
  });

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
            <ArrowRightLeft className="w-8 h-8 text-secondary" />
            Transaction Center
          </h1>
          <p className="text-foreground-secondary mt-1">Create and monitor blockchain transactions</p>
        </div>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
          onClick={fetchTransactions}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="glass p-1">
          <TabsTrigger value="create" className="data-[state=active]:gradient-gold-blue data-[state=active]:text-primary-foreground">
            <Send className="w-4 h-4 mr-2" />
            Create Transaction
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:gradient-gold-blue data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" />
            History ({confirmedTxs.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:gradient-gold-blue data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingTxs.length})
          </TabsTrigger>
        </TabsList>

        {/* Create Transaction */}
        <TabsContent value="create">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-foreground mb-6">Send Transaction</h2>

              {wallets.length === 0 ? (
                <div className="text-center py-8 text-foreground-muted">
                  <p className="mb-4">No wallets found. Create a wallet first.</p>
                  <Button onClick={() => window.location.href = "/wallet"} className="gradient-gold-blue text-primary-foreground">
                    Create Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* From Wallet */}
                  <div className="space-y-2">
                    <Label className="text-foreground-secondary">From Wallet</Label>
                    <select
                      value={selectedWallet}
                      onChange={(e) => setSelectedWallet(e.target.value)}
                      className="w-full p-3 rounded-lg bg-background-tertiary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {wallets.map((wallet) => (
                        <option key={wallet.address} value={wallet.address}>
                          {wallet.name} - {wallet.balance?.toFixed(2) || 0} ChainGo
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Address */}
                  <div className="space-y-2">
                    <Label className="text-foreground-secondary">To Address</Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter recipient address..."
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        className="bg-background-tertiary border-border font-mono pr-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
                        onClick={() => navigator.clipboard.readText().then(setToAddress)}
                      >
                        Paste
                      </Button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label className="text-foreground-secondary">Amount</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-background-tertiary border-border text-2xl font-bold pr-24"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-foreground-muted">ChainGo</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary text-xs"
                          onClick={() => {
                            const wallet = wallets.find(w => w.address === selectedWallet);
                            if (wallet) setAmount(Math.floor(wallet.balance || 0).toString());
                          }}
                        >
                          MAX
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Fee Estimate */}
                  <div className="p-4 rounded-lg bg-background-tertiary/50 flex items-center justify-between">
                    <span className="text-foreground-secondary">Network Fee</span>
                    <span className="font-mono text-foreground">Free (Reward: 50 ChainGo for miner)</span>
                  </div>

                  {/* Private Key */}
                  <div className="space-y-2">
                    <Label className="text-foreground-secondary flex items-center gap-2">
                      Private Key
                      <span className="text-xs text-destructive">(Required to sign)</span>
                    </Label>
                    <Input
                      type="password"
                      placeholder="Enter your private key..."
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="bg-background-tertiary border-border font-mono"
                    />
                    <p className="text-xs text-foreground-muted">
                      Auto-filled from selected wallet. Your key is never sent to any server.
                    </p>
                  </div>

                  {/* Submit */}
                  <Button
                    className="w-full gradient-gold-blue text-primary-foreground font-semibold py-6 text-lg"
                    onClick={handleSendTransaction}
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Transaction
                      </>
                    )}
                  </Button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <Input
                placeholder="Search by address or hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background-tertiary border-border"
              />
            </div>

            {/* Transactions */}
            {loading ? (
              <GlassCard className="text-center py-8 text-foreground-muted">
                Loading transactions...
              </GlassCard>
            ) : filteredConfirmedTxs.length > 0 ? (
              filteredConfirmedTxs.slice(0, 20).map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-success/10">
                        <ArrowRightLeft className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-foreground">
                          Block #{tx.blockIndex}
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {tx.from.slice(0, 12)}... → {tx.to.slice(0, 12)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">{tx.amount} ChainGo</p>
                        <p className="text-xs text-foreground-muted">{tx.time}</p>
                      </div>
                      <StatusBadge status="confirmed" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <GlassCard className="text-center py-8 text-foreground-muted">
                {searchQuery ? "No transactions match your search." : "No transactions yet."}
              </GlassCard>
            )}
          </motion.div>
        </TabsContent>

        {/* Pending Transactions */}
        <TabsContent value="pending">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {pendingTxs.length > 0 ? (
              pendingTxs.map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-warning/30">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-warning/10 animate-pulse">
                        <Clock className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-foreground">
                          Pending Transaction
                        </p>
                        <p className="text-sm text-foreground-muted">
                          {tx.from.slice(0, 12)}... → {tx.to.slice(0, 12)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">{tx.amount} ChainGo</p>
                        <p className="text-xs text-warning">Priority: {tx.priority}</p>
                      </div>
                      <StatusBadge status="pending" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <GlassCard className="text-center py-8 text-foreground-muted">
                No pending transactions. All transactions have been confirmed!
              </GlassCard>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
