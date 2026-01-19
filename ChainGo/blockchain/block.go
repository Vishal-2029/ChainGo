package blockchain

import (
	"bytes"
	"crypto/sha256"
	"encoding/gob"
	"fmt"
	"time"
)

type Block struct {
	Timestamp    int64
	Transactions []*Transaction
	PrevHash     []byte
	Hash         []byte
	Nonce        int
}

func NewBlock(transactions []*Transaction, prevHash []byte) *Block {
	block := &Block{
		Timestamp:    time.Now().Unix(),
		Transactions: transactions,
		PrevHash:     prevHash,
	}
	pow := NewProofOfWork(block)
	hash, nonce := pow.Run()
	block.Hash = hash
	block.Nonce = nonce
	return block
}

func (b *Block) calculateHash() []byte {
	// Create a combined hash of all transactions
	txHashes := [][]byte{}
	for _, tx := range b.Transactions {
		txHashes = append(txHashes, tx.Hash())
	}
	txHash := sha256.Sum256(bytes.Join(txHashes, []byte{}))

	data := bytes.Join([][]byte{
		[]byte(fmt.Sprintf("%d", b.Timestamp)),
		txHash[:],
		b.PrevHash,
		IntToHex(int64(b.Nonce)),
	}, []byte{})
	hash := sha256.Sum256(data)
	return hash[:]
}

func (b *Block) Serialize() []byte {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	err := enc.Encode(b)
	if err != nil {
		fmt.Println("Error serializing block:", err)
		return nil
	}
	return buf.Bytes()
}

func Deserialize(data []byte) *Block {
	var block Block
	dec := gob.NewDecoder(bytes.NewReader(data))
	err := dec.Decode(&block)
	if err != nil {
		fmt.Println("Error deserializing block:", err)
		return nil
	}
	return &block
}
