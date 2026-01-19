package blockchain

import (
	"bytes"
	"fmt"
	"log"

	"github.com/Vishal-2029/pkg"
	"go.etcd.io/bbolt"
)

type Blockchain struct {
	Block []*Block
	DB    *pkg.BoltDB
}

func NewBlockchain(db *pkg.BoltDB) *Blockchain {
	bc := &Blockchain{DB: db}

	// Try to load existing chain first
	err := bc.LoadChain()
	if err != nil || len(bc.Block) == 0 {
		if err != nil {
			log.Println("Error loading chain:", err)
		}
		log.Println("No existing chain found or chain empty, creating genesis block...")
		genesisTx := &Transaction{From: "Genesis", To: "Genesis", Amount: 0}
		genesis := NewBlock([]*Transaction{genesisTx}, []byte{})
		bc.Block = append(bc.Block, genesis)

		if err := bc.SaveBlock(genesis); err != nil {
			log.Println("Error saving genesis block:", err)
		}
	} else {
		log.Printf("Loaded existing chain with %d blocks\n", len(bc.Block))
	}

	return bc
}

func (bc *Blockchain) AddBlock(transactions []*Transaction) {
	prevBlock := bc.Block[len(bc.Block)-1]
	newBlock := NewBlock(transactions, prevBlock.Hash)
	bc.Block = append(bc.Block, newBlock)
	if err := bc.SaveBlock(newBlock); err != nil {
		log.Println("Error saving block:", err)
	}
}

func (bc *Blockchain) SaveBlock(block *Block) error {
	data := block.Serialize()
	return bc.DB.SaveWallet(string(block.Hash), data)
}

func (bc *Blockchain) LoadChain() error {
	return bc.DB.DB.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("chaingo_blocks"))
		if b == nil {
			return fmt.Errorf("bucket not found")
		}

		return b.ForEach(func(k, v []byte) error {
			block := Deserialize(v)
			bc.Block = append(bc.Block, block)
			return nil
		})
	})
}

func (bc *Blockchain) Validate() error {
	for i := 1; i < len(bc.Block); i++ {
		prev := bc.Block[i-1]
		curr := bc.Block[i]

		if !bytes.Equal(curr.PrevHash, prev.Hash) {
			return fmt.Errorf("block %d previous hash mismatch", i)
		}

		pow := NewProofOfWork(curr)
		if !pow.Validate() {
			return fmt.Errorf("block %d proof of work invalid", i)
		}
	}
	return nil
}
