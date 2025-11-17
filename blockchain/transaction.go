package blockchain

import (
	"crypto/sha256"
	"strconv"
)

type Transaction struct {
	From      string
	To        string
	Amount    int
	R, S      string
	PublicKey []byte
}

func (tx *Transaction) Hash() []byte {
	data := []byte(tx.From + tx.To + strconv.Itoa(tx.Amount))
	hash := sha256.Sum256(data)
	return hash[:]
}

func (tx *Transaction) Sign(w *Wallet) {
	hash := tx.Hash()
	rText, sText := w.Sign(hash)
	tx.R = rText
	tx.S = sText
	tx.PublicKey = w.PublicKey // Store public key for verification
}

func (tx *Transaction) Verify() bool {
	return VerifySignature(tx.PublicKey, tx.Hash(), tx.R, tx.S)
}

// Helper function to convert transaction to string
func (tx *Transaction) String() string {
	return tx.From + "->" + tx.To + ":" + strconv.Itoa(tx.Amount)
}