package pkg

import (
	"errors"

	"go.etcd.io/bbolt"
)

type BoltDB struct {
	DB *bbolt.DB
}

var (
	blocksBucket  = []byte("chaingo_blocks")
	walletsBucket = []byte("chaingo_wallets")
)

func NewBoltDB(path string) (*BoltDB, error) {
	db, err := bbolt.Open(path, 0600, nil)
	if err != nil {
		return nil, err
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		// Create both buckets
		_, err := tx.CreateBucketIfNotExists(blocksBucket)
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists(walletsBucket) // NEW
		return err
	})

	if err != nil {
		return nil, err
	}
	return &BoltDB{DB: db}, nil
}

func (b *BoltDB) SaveWallet(address string, walletData []byte) error {
	return b.DB.Update(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(walletsBucket)
		if bucket == nil {
			return errors.New("wallets bucket missing")
		}
		return bucket.Put([]byte(address), walletData)
	})
}

func (b *BoltDB) GetWallet(address string) ([]byte, error) {
	var val []byte
	err := b.DB.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(walletsBucket)
		if bucket == nil {
			return errors.New("wallets bucket missing")
		}
		v := bucket.Get([]byte(address))
		if v == nil {
			return errors.New("wallet not found")
		}
		val = append([]byte{}, v...)
		return nil
	})
	return val, err
}

// GetAllWallets retrieves all wallets from database as JSON-compatible maps
func (b *BoltDB) GetAllWallets() ([]map[string]interface{}, error) {
	var wallets []map[string]interface{}

	err := b.DB.View(func(tx *bbolt.Tx) error {
		bucket := tx.Bucket(walletsBucket)
		if bucket == nil {
			return nil // No wallets bucket means no wallets
		}

		return bucket.ForEach(func(k, v []byte) error {
			// Try to deserialize as wallet data
			wallets = append(wallets, map[string]interface{}{
				"address": string(k),
				"data":    string(v),
			})
			return nil
		})
	})

	return wallets, err
}

func (b *BoltDB) Close() error {
	return b.DB.Close()
}
