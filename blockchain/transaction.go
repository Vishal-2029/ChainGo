package blockchain

import (
	"bytes"
	"crypto/sha256"
	"encoding/gob"
	"strconv"
)

type Transaction struct {
	From      string `json:"from"`
	To        string `json:"to"`
	Amount    int    `json:"amount"`
	R         string `json:"r"`
	S         string `json:"s"`
	PublicKey []byte `json:"publicKey"`
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

func (tx *Transaction) Serialize() []byte {
	var encoded bytes.Buffer
	enc := gob.NewEncoder(&encoded)
	err := enc.Encode(tx)
	if err != nil {
		panic(err)
	}
	return encoded.Bytes()
}

func DeserializeTransaction(data []byte) *Transaction {
	var tx Transaction
	decoder := gob.NewDecoder(bytes.NewReader(data))
	err := decoder.Decode(&tx)
	if err != nil {
		panic(err)
	}
	return &tx
}
