package blockchain

import (
	"bytes"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"math"
	"math/big"
)

const targetBits = 16

type ProofOfWork struct {
	block  *Block
	target *big.Int
}

func NewProofOfWork(b *Block) *ProofOfWork {
	target := big.NewInt(1)
	target.Lsh(target, uint(256-targetBits))
	return &ProofOfWork{b, target}
}

func (pow *ProofOfWork) prepareData(nonce int) []byte {
	timestampBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(timestampBytes, uint64(pow.block.Timestamp))

	// Hash all transactions to include in the block data
	txHashes := [][]byte{}
	for _, tx := range pow.block.Transactions {
		txHashes = append(txHashes, tx.Hash())
	}
	txHash := sha256.Sum256(bytes.Join(txHashes, []byte{}))

	data := bytes.Join([][]byte{
		timestampBytes,
		txHash[:],
		pow.block.PrevHash,
		IntToHex(int64(nonce)),
	}, []byte{})
	return data
}

func (pow *ProofOfWork) Run() ([]byte, int) {
	var hashInt big.Int
	var hash [32]byte
	nonce := 0

	fmt.Println("Mining new block...")
	for nonce < math.MaxInt64 {
		data := pow.prepareData(nonce)
		hash = sha256.Sum256(data)
		hashInt.SetBytes(hash[:])
		if hashInt.Cmp(pow.target) == -1 {
			fmt.Printf("Success! Nonce: %d\nHash: %x\n\n", nonce, hash)
			break
		}
		nonce++
	}
	return hash[:], nonce
}

func (pow *ProofOfWork) Validate() bool {
	var hashInt big.Int
	data := pow.prepareData(pow.block.Nonce)
	hash := sha256.Sum256(data)
	hashInt.SetBytes(hash[:])
	return hashInt.Cmp(pow.target) == -1
}
