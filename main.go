package main

import (
	"fmt"

	"github.com/Vishal-2029/internal"
	"github.com/Vishal-2029/network"
	"github.com/Vishal-2029/pkg"
)

func main() {
	db, err := pkg.NewBoltDB("chaingo.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	fmt.Println("Using persistent BoltDB storage: chaingo.db")

	// Create and set node for networking features
	node := network.NewNode(":9000")
	internal.SetNode(node)

	// NEW: Set database for wallet persistence
	internal.SetDatabase(db)

	go func() {
		node.Start()
	}()

	internal.StartServer(db)
}
