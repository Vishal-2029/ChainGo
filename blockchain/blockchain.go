package blockchain

// Represents a blockchain data structure, comprising a linked list of blocks.
// Blockchain is a sequence of blocks
type blockchain struct {
	Block []*Block
}

// NewBlockchain creates a blockchain with the genesis block
func NewBlockchain() *blockchain {
	return &blockchain{
		Block: []*Block{createGenesisBlock()},
	}
}

// createGenesisBlock makes the very first block
func createGenesisBlock() *Block {
	return NewBlock([]string{"Genesis Block"}, []byte{})
}

// AddBlock appends a new block to the chain
func (blc *blockchain) AddBlock(transactions []string) {
	PrevHash := blc.Block[len(blc.Block)-1]
	newblock := NewBlock(transactions, PrevHash.Hash)
	blc.Block = append(blc.Block, newblock)
}
