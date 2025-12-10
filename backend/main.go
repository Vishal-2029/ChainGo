package main

// @title ChainGo Blockchain API
// @version 1.0
// @description A complete blockchain implementation in Go with REST API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email vishal@chaingo.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api
// @schemes http

import (
	"flag"
	"fmt"

	"github.com/Vishal-2029/ChainGo/backend/internal"
	"github.com/Vishal-2029/ChainGo/backend/network"
	"github.com/Vishal-2029/ChainGo/backend/pkg"
)

func main() {
	apiPort := flag.String("api", "8080", "API Port")
	p2pPort := flag.String("p2p", "9000", "P2P Port")
	dbFile := flag.String("db", "chaingo.db", "Database file")
	flag.Parse()

	db, err := pkg.NewBoltDB(*dbFile)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	fmt.Printf("Using persistent BoltDB storage: %s\n", *dbFile)

	// Create and set node for networking features
	node := network.NewNode(":" + *p2pPort)
	internal.SetNode(node)

	// NEW: Set database for wallet persistence
	internal.SetDatabase(db)

	go func() {
		node.Start()
	}()

	internal.StartServer(db, *apiPort)
}
