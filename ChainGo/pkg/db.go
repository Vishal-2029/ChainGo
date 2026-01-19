package pkg

type DB interface {
	Set(key, value []byte) error
	Get(key []byte) ([]byte, error)
	Close() error
}
