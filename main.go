package main

import (
	"fmt"

	"github.com/Vishal-2029/blockchain"
)

func main() {
	//Create a new blockchain
	genesisBlock := blockchain.NewBlock([]string{"Genesis Block"}, []byte{})
	fmt.Printf("Genesis Block Hash: %x\n", genesisBlock.Hash)

	// Create a new blockchain with genesis block
	chain := blockchain.NewBlockchain()

	chain.AddBlock([]string{"Jeel pays Vishal 5 coins"})
	chain.AddBlock([]string{"Abhi pays Ratheesh 5 coins"})

	for i, block := range chain.Block {
		fmt.Printf("Block #%d:\n", i)
		fmt.Printf("  Timestamp: %d\n", block.Timestamp)
		fmt.Printf("  Transactions: %v\n", block.Transactions)
		fmt.Printf("  PrevHash: %x\n", block.PrevHash)
		fmt.Printf("  Hash: %x\n\n", block.Hash)
	}
}
