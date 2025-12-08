package network

import (
	"bytes"
	"encoding/gob"

	"github.com/Vishal-2029/blockchain"
)

func init() {
	gob.Register(blockchain.Block{})
	gob.Register(blockchain.Transaction{})
	gob.Register([]*blockchain.Block{})
}

type Message struct {
	Type string      // "BLOCK", "TRANSACTION", "CHAIN_REQUEST", "CHAIN_RESPONSE"
	Data interface{} // serialized block, transaction, or chain
}

func EncodeMessage(msg Message) ([]byte, error) {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	err := enc.Encode(msg)
	return buf.Bytes(), err
}

func DecodeMessage(data []byte) (Message, error) {
	var msg Message
	dec := gob.NewDecoder(bytes.NewReader(data))
	err := dec.Decode(&msg)
	return msg, err
}
