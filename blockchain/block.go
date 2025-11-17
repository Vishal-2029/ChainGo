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
	Transactions []string
	PrevHash     []byte
	Hash         []byte
	Nonce        int
}

func NewBlock(transactions []string, prevHash []byte) *Block {
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
	data := bytes.Join([][]byte{
		[]byte(fmt.Sprintf("%d", b.Timestamp)),
		bytes.Join(stringArrayToBytes(b.Transactions), []byte{}),
		b.PrevHash,
		IntToHex(int64(b.Nonce)),
	}, []byte{})
	hash := sha256.Sum256(data)
	return hash[:]
}

func (b *Block) Serialize() []byte {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	enc.Encode(b)
	return buf.Bytes()
}

func Deserialize(data []byte) *Block {
	var block Block
	dec := gob.NewDecoder(bytes.NewReader(data))
	dec.Decode(&block)
	return &block
}
