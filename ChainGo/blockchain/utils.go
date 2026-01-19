package blockchain

import (
	"bytes"
	"encoding/binary"
)

func IntToHex(n int64) []byte {
	buf := new(bytes.Buffer)
	binary.Write(buf, binary.BigEndian, n)
	return buf.Bytes()
}

func stringArrayToBytes(arr []string) [][]byte {
	var result [][]byte
	for _, s := range arr {
		result = append(result, []byte(s))
	}
	return result
}
