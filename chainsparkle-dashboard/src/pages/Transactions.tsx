import { motion } from "framer-motion";
import { ArrowRightLeft, Send, Clock, History, Search } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const mockTransactions = [
  { 
    hash: "0xabc123def456789012345678901234567890abcdef",
    from: "0x4a2b...8c9d",
    to: "0x1e5f...2e3f",
    amount: 25.5,
    status: "confirmed" as const,
    time: "2 mins ago"
  },
  { 
    hash: "0xdef456abc789012345678901234567890abcdef12",
    from: "0x1e5f...2e3f",
    to: "0x7f8a...5f6a",
    amount: 10.0,
    status: "confirmed" as const,
    time: "5 mins ago"
  },
  { 
    hash: "0x789abc123def456012345678901234567890abcd",
    from: "0x4a2b...8c9d",
    to: "0x9b0c...1d2e",
    amount: 100.0,
    status: "pending" as const,
    time: "Just now"
  },
];

const mockPending = [
  { 
    hash: "0x789abc123def456012345678901234567890abcd",
    from: "0x4a2b...8c9d",
    to: "0x9b0c...1d2e",
    amount: 100.0,
    priority: "high"
  },
  { 
    hash: "0x456def789abc012345678901234567890abcde",
    from: "0x7f8a...5f6a",
    to: "0x1e5f...2e3f",
    amount: 15.0,
    priority: "medium"
  },
];

const wallets = [
  { address: "0x4a2b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b", name: "Main Wallet", balance: 150.5 },
  { address: "0x1e5f3b4c2a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f", name: "Trading Wallet", balance: 42.0 },
];

export function Transactions() {
  const [selectedWallet, setSelectedWallet] = useState(wallets[0].address);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-secondary" />
          Transaction Center
        </h1>
        <p className="text-foreground-secondary mt-1">Create and monitor blockchain transactions</p>
      </motion.div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="glass p-1">
          <TabsTrigger value="create" className="data-[state=active]:gradient-gold-blue data-[state=active]:text-primary-foreground">
            <Send className="w-4 h-4 mr-2" />
            Create Transaction
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:gradient-gold-blue data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:gradient-gold-blue data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({mockPending.length})
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
                        {wallet.name} - {wallet.balance} ChainGo
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
                      placeholder="0.00"
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
                          if (wallet) setAmount(wallet.balance.toString());
                        }}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fee Estimate */}
                <div className="p-4 rounded-lg bg-background-tertiary/50 flex items-center justify-between">
                  <span className="text-foreground-secondary">Estimated Fee</span>
                  <span className="font-mono text-foreground">0.001 ChainGo</span>
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
                    className="bg-background-tertiary border-border font-mono"
                  />
                </div>

                {/* Submit */}
                <Button className="w-full gradient-gold-blue text-primary-foreground font-semibold py-6 text-lg">
                  <Send className="w-5 h-5 mr-2" />
                  Preview Transaction
                </Button>
              </div>
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
                placeholder="Search by transaction hash..."
                className="pl-10 bg-background-tertiary border-border"
              />
            </div>

            {/* Transactions */}
            {mockTransactions.map((tx, index) => (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      tx.status === "confirmed" ? "bg-success/10" : "bg-warning/10"
                    )}>
                      <ArrowRightLeft className={cn(
                        "w-5 h-5",
                        tx.status === "confirmed" ? "text-success" : "text-warning"
                      )} />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-foreground truncate max-w-[200px]">
                        {tx.hash}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        {tx.from} → {tx.to}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">{tx.amount} ChainGo</p>
                      <p className="text-xs text-foreground-muted">{tx.time}</p>
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
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
            {mockPending.map((tx, index) => (
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
                      <p className="font-mono text-sm text-foreground truncate max-w-[200px]">
                        {tx.hash}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        {tx.from} → {tx.to}
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
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
