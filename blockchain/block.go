package blockchain

import (
	"bytes"
	"crypto/sha256"
	"encoding/gob"
	"time"
)

// Represents a single block in a blockchain, containing a timestamp, a list of transactions, 
// a reference to the previous block's hash, and its own unique hash.
type Block struct {
	Timestamp    int64
	Transactions []string
	PrevHash     []byte
	Hash         []byte
}

// NewBlock creates a new block
func NewBlock(transactions []string, prevHash []byte) *Block {
	block := &Block{
		Timestamp: time.Now().Unix(),
		Transactions: transactions,
		PrevHash: prevHash,
	}
	block.Hash = block.calculateHash()
	return block
}

// calculateHash generates the SHA-256 hash of the block
func (b *Block) calculateHash() []byte {
	data := bytes.Join([][]byte{
		[]byte(string(b.Timestamp)),
		bytes.Join(stringArrayToBytes(b.Transactions), []byte{}),
	b.PrevHash,
	}, []byte{})
	hash := sha256.Sum256(data)
	return  hash[:]
}

// Helper to convert []string to [][]byte
func stringArrayToBytes(arr []string) [][]byte {
	var result [][]byte
	for _, s := range arr {
		result = append(result, []byte(s))
	}
	return result
}

// Serialize converts the block into bytes
func (b *Block) Serialize() []byte {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	enc.Encode(b)
	return buf.Bytes()
}