package network

import "sync"

type Peer struct {
	Address string
}

type PeerManager struct {
	Peers map[string]*Peer
	mu    sync.Mutex
}

func NewPeerManager() *PeerManager {
	return &PeerManager{Peers: make(map[string]*Peer)}
}

func (pm *PeerManager) AddPeer(addr string) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	if _, exists := pm.Peers[addr]; !exists {
		pm.Peers[addr] = &Peer{Address: addr}
	}
}

func (pm *PeerManager) ListPeers() []string {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	addrs := []string{}
	for addr := range pm.Peers {
		addrs = append(addrs, addr)
	}
	return addrs
}
