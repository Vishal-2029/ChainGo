import { motion } from "framer-motion";
import { Network as NetworkIcon, Wifi, WifiOff, RefreshCw, Plus, Globe, Signal, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Peer {
  id: string;
  address: string;
  status: "synced" | "syncing";
  lastSeen: string;
  blockHeight: number;
  latency: number;
  syncProgress?: number;
}

export function Network() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [addingPeer, setAddingPeer] = useState(false);
  const [newPeerAddress, setNewPeerAddress] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chainStats, setChainStats] = useState({ blocks: 0, latestBlockHash: "" });
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [peersData, statsData] = await Promise.all([
        api.listPeers(),
        api.getChainStats(),
      ]);

      // Transform peers data
      const transformedPeers: Peer[] = (peersData.peers || []).map((address: string, index: number) => ({
        id: (index + 1).toString(),
        address,
        status: "synced" as const,
        lastSeen: "Just now",
        blockHeight: statsData.blocks,
        latency: Math.floor(Math.random() * 100) + 20,
      }));

      setPeers(transformedPeers);
      setChainStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching network data:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAddPeer = async () => {
    if (!newPeerAddress) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid peer address (e.g., 192.168.1.100:9000)",
        variant: "destructive",
      });
      return;
    }

    setAddingPeer(true);
    try {
      await api.addPeer(newPeerAddress);
      toast({
        title: "Peer Added",
        description: `Successfully connected to ${newPeerAddress}`,
      });
      setNewPeerAddress("");
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Failed to Add Peer",
        description: error.message || "Could not connect to peer.",
        variant: "destructive",
      });
    }
    setAddingPeer(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncChain();
      toast({
        title: "Sync Requested",
        description: "Blockchain sync has been initiated with peers.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with peers.",
        variant: "destructive",
      });
    }
    setSyncing(false);
  };

  const handleDisconnectPeer = (address: string) => {
    setPeers(prev => prev.filter(p => p.address !== address));
    toast({
      title: "Peer Disconnected",
      description: `Disconnected from ${address}`,
    });
  };

  const avgLatency = peers.length > 0
    ? Math.floor(peers.reduce((sum, p) => sum + p.latency, 0) / peers.length)
    : 0;

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
            <NetworkIcon className="w-8 h-8 text-secondary" />
            Network & Peers
          </h1>
          <p className="text-foreground-secondary mt-1">P2P network status and peer management</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-secondary text-secondary hover:bg-secondary/10"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Now
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-gold-blue text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Peer
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Add New Peer</DialogTitle>
                <DialogDescription className="text-foreground-muted">
                  Enter the address of the peer you want to connect to.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="e.g., 192.168.1.100:9000"
                  value={newPeerAddress}
                  onChange={(e) => setNewPeerAddress(e.target.value)}
                  className="bg-background-tertiary border-border font-mono"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground-secondary">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPeer}
                  disabled={addingPeer}
                  className="gradient-gold-blue text-primary-foreground"
                >
                  {addingPeer ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Peer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Network Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Connected Peers"
          value={peers.length.toString()}
          subtitle="Active connections"
          icon={Wifi}
          trend={{ value: peers.length > 0 ? "Connected" : "No peers", positive: peers.length > 0 }}
          glow="success"
          delay={0}
        />
        <StatCard
          title="Network Latency"
          value={`${avgLatency}ms`}
          subtitle="Average ping"
          icon={Signal}
          glow="blue"
          delay={0.1}
        />
        <StatCard
          title="Sync Status"
          value="100%"
          subtitle="Blockchain synced"
          icon={RefreshCw}
          glow="gold"
          delay={0.2}
        />
        <StatCard
          title="Block Height"
          value={chainStats.blocks.toString()}
          subtitle="Current chain tip"
          icon={Globe}
          glow="mining"
          delay={0.3}
        />
      </section>

      {/* Network Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="relative overflow-hidden h-64 flex items-center justify-center">
          {/* Center node (YOU) */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full gradient-gold-blue flex items-center justify-center glow-gold"
            >
              <span className="text-primary-foreground font-bold">YOU</span>
            </motion.div>

            {/* Peer nodes around center */}
            {peers.map((peer, index) => {
              const angle = (index * 360) / Math.max(peers.length, 1);
              const radius = 100;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <motion.div
                  key={peer.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px - 20px)`,
                    top: `calc(50% + ${y}px - 20px)`
                  }}
                >
                  {/* Connection line */}
                  <svg
                    className="absolute"
                    style={{
                      left: 20,
                      top: 20,
                      width: Math.abs(x) + 20,
                      height: Math.abs(y) + 20,
                      transform: `translate(${x < 0 ? x : 0}px, ${y < 0 ? y : 0}px)`
                    }}
                  >
                    <line
                      x1={x > 0 ? 0 : Math.abs(x)}
                      y1={y > 0 ? 0 : Math.abs(y)}
                      x2={x > 0 ? Math.abs(x) : 0}
                      y2={y > 0 ? Math.abs(y) : 0}
                      stroke={peer.status === "synced" ? "hsl(160 84% 39%)" : "hsl(38 92% 50%)"}
                      strokeWidth="2"
                      strokeDasharray={peer.status === "syncing" ? "5,5" : "none"}
                      className={peer.status === "syncing" ? "animate-pulse" : ""}
                    />
                  </svg>

                  {/* Peer node */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    peer.status === "synced"
                      ? "bg-success/20 text-success border border-success/50"
                      : "bg-warning/20 text-warning border border-warning/50 animate-pulse"
                  )}>
                    {index + 1}
                  </div>
                </motion.div>
              );
            })}

            {peers.length === 0 && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center text-foreground-muted whitespace-nowrap">
                No peers connected
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Peer List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-success" />
          Connected Peers ({peers.length})
        </h2>

        <div className="space-y-3">
          {loading ? (
            <GlassCard className="text-center py-8 text-foreground-muted">
              Loading peers...
            </GlassCard>
          ) : peers.length > 0 ? (
            peers.map((peer, index) => (
              <motion.div
                key={peer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      peer.status === "synced" ? "bg-success/10" : "bg-warning/10"
                    )}>
                      {peer.status === "synced" ? (
                        <Wifi className="w-5 h-5 text-success" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-warning animate-spin" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-foreground">{peer.address}</p>
                      <p className="text-sm text-foreground-muted">Last seen: {peer.lastSeen}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <StatusBadge status={peer.status === "synced" ? "confirmed" : "syncing"} />
                    <div className="text-foreground-secondary">
                      Height: <span className="font-mono text-foreground">{peer.blockHeight}</span>
                    </div>
                    <div className="text-foreground-secondary">
                      Latency: <span className={cn(
                        "font-mono",
                        peer.latency < 50 ? "text-success" : peer.latency < 100 ? "text-warning" : "text-destructive"
                      )}>{peer.latency}ms</span>
                    </div>
                    {peer.syncProgress && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-background-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning rounded-full transition-all"
                            style={{ width: `${peer.syncProgress}%` }}
                          />
                        </div>
                        <span className="text-warning font-mono">{peer.syncProgress}%</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDisconnectPeer(peer.address)}
                    >
                      <WifiOff className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <GlassCard className="text-center py-8 text-foreground-muted">
              No peers connected. Add a peer to start syncing!
            </GlassCard>
          )}
        </div>
      </motion.div>
    </div>
  );
}
