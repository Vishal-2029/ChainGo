package blockchain

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/gob"
	"encoding/hex"
	"math/big"
)

type Wallet struct {
	PrivateKey *ecdsa.PrivateKey
	PublicKey  []byte
}

func NewWallet() *Wallet {
	priv, pub := newKeyPair()
	return &Wallet{PrivateKey: &priv, PublicKey: pub}
}

func newKeyPair() (ecdsa.PrivateKey, []byte) {
	curve := elliptic.P256()
	priv, _ := ecdsa.GenerateKey(curve, rand.Reader)
	pub := append(priv.PublicKey.X.Bytes(), priv.PublicKey.Y.Bytes()...)
	return *priv, pub
}

func (w *Wallet) PrivateKeyHex() string {
	if w.PrivateKey == nil {
		return ""
	}
	return hex.EncodeToString(w.PrivateKey.D.Bytes())
}

func (w *Wallet) Address() string {
	pubHash := sha256.Sum256(w.PublicKey)
	return hex.EncodeToString(pubHash[:])
}

func (w *Wallet) Sign(data []byte) (rText, sText string) {
	hash := sha256.Sum256(data)
	r, s, _ := ecdsa.Sign(rand.Reader, w.PrivateKey, hash[:])
	return r.Text(16), s.Text(16)
}

func VerifySignature(pubKey []byte, data []byte, rText, sText string) bool {
	curve := elliptic.P256()
	keyLen := len(pubKey) / 2
	x := new(big.Int).SetBytes(pubKey[:keyLen])
	y := new(big.Int).SetBytes(pubKey[keyLen:])
	pub := ecdsa.PublicKey{Curve: curve, X: x, Y: y}

	r := new(big.Int)
	s := new(big.Int)
	r.SetString(rText, 16)
	s.SetString(sText, 16)

	hash := sha256.Sum256(data)
	return ecdsa.Verify(&pub, hash[:], r, s)
}

// Add serialization methods to Wallet
func (w *Wallet) Serialize() ([]byte, error) {
	type SerializableWallet struct {
		PrivateKeyD []byte
		PublicKey   []byte
	}

	sw := SerializableWallet{
		PublicKey: w.PublicKey,
	}

	if w.PrivateKey != nil {
		sw.PrivateKeyD = w.PrivateKey.D.Bytes()
	}

	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	err := enc.Encode(sw)
	return buf.Bytes(), err
}

func DeserializeWallet(data []byte) (*Wallet, error) {
	type SerializableWallet struct {
		PrivateKeyD []byte
		PublicKey   []byte
	}

	var sw SerializableWallet
	dec := gob.NewDecoder(bytes.NewReader(data))
	err := dec.Decode(&sw)
	if err != nil {
		return nil, err
	}

	wallet := &Wallet{
		PublicKey: sw.PublicKey,
	}

	if len(sw.PrivateKeyD) > 0 {
		curve := elliptic.P256()
		wallet.PrivateKey = &ecdsa.PrivateKey{
			PublicKey: ecdsa.PublicKey{
				Curve: curve,
				X:     new(big.Int),
				Y:     new(big.Int),
			},
			D: new(big.Int).SetBytes(sw.PrivateKeyD),
		}
		// Reconstruct public key coordinates from stored public key
		keyLen := len(sw.PublicKey) / 2
		wallet.PrivateKey.PublicKey.X.SetBytes(sw.PublicKey[:keyLen])
		wallet.PrivateKey.PublicKey.Y.SetBytes(sw.PublicKey[keyLen:])
	}

	return wallet, nil
}
