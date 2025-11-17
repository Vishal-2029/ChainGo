package network

import (
	"fmt"
	"net"
)

type Node struct {
	Address string
	Peers   *PeerManager
}

func NewNode(address string) *Node {
	return &Node{
		Address: address,
		Peers:   NewPeerManager(),
	}
}

func (n *Node) Start() {
	listener, err := net.Listen("tcp", n.Address)
	if err != nil {
		panic(err)
	}
	fmt.Printf("🌐 Node listening on %s\n", n.Address)

	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		go n.handleConnection(conn)
	}
}

func (n *Node) handleConnection(conn net.Conn) {
	defer conn.Close()
	
	// Get remote address
	remoteAddr := conn.RemoteAddr().String()
	fmt.Printf("🔗 New P2P connection from: %s\n", remoteAddr)
	
	// Add this peer to our list
	n.Peers.AddPeer(remoteAddr)
	fmt.Printf("📝 Added peer: %s (Total: %d peers)\n", remoteAddr, len(n.Peers.ListPeers()))

	buf := make([]byte, 4096)
	nBytes, err := conn.Read(buf)
	if err != nil {
		fmt.Printf("Error reading from %s: %v\n", remoteAddr, err)
		return
	}

	fmt.Printf("📨 Received %d bytes from %s\n", nBytes, remoteAddr)
	
	msg, err := DecodeMessage(buf[:nBytes])
	if err != nil {
		fmt.Println("Error decoding message:", err)
		return
	}

	switch msg.Type {
	case "BLOCK":
		fmt.Printf("Received new BLOCK from peer: %s\n", remoteAddr)
	case "TRANSACTION":
		fmt.Printf("Received new TRANSACTION from peer: %s\n", remoteAddr)
	case "CHAIN_REQUEST":
		fmt.Printf("Peer %s requested chain sync\n", remoteAddr)
		// Send our blockchain back
		n.sendChain(conn)
	default:
		fmt.Printf("Unknown message type from %s: %s\n", remoteAddr, msg.Type)
	}
}

func (n *Node) sendChain(conn net.Conn) {
	// In real implementation, you'd send your actual blockchain
	testMsg := Message{
		Type: "CHAIN_RESPONSE", 
		Data: "Sending blockchain data...",
	}
	
	data, _ := EncodeMessage(testMsg)
	conn.Write(data)
	fmt.Printf("Sent chain to peer\n")
}

func (n *Node) Broadcast(msg Message) {
	peers := n.Peers.ListPeers()
	fmt.Printf("Broadcasting '%s' to %d peers: %v\n", msg.Type, len(peers), peers)
	
	for _, addr := range peers {
		go n.sendMessage(addr, msg)
	}
}

func (n *Node) sendMessage(addr string, msg Message) {
	fmt.Printf("➡️ Sending to peer: %s\n", addr)
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		fmt.Printf("Failed to connect to peer %s: %v\n", addr, err)
		// Remove dead peer
		n.Peers.mu.Lock()
		delete(n.Peers.Peers, addr)
		n.Peers.mu.Unlock()
		return
	}
	defer conn.Close()

	data, err := EncodeMessage(msg)
	if err != nil {
		fmt.Printf("Failed to encode message for %s: %v\n", addr, err)
		return
	}

	_, err = conn.Write(data)
	if err != nil {
		fmt.Printf("Failed to send to %s: %v\n", addr, err)
		return
	}
	
	fmt.Printf("Successfully sent to %s\n", addr)
}

