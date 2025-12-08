package internal

import (
	"fmt"
	"log"

	"github.com/Vishal-2029/blockchain"
	"github.com/Vishal-2029/pkg"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func StartServer(db *pkg.BoltDB, port string) {
	bc := blockchain.NewBlockchain(db)
	SetBlockchain(bc)

	if node != nil {
		node.SetBlockchain(bc)
	}

	app := fiber.New(fiber.Config{AppName: "ChainGo Blockchain API"})
	app.Use(logger.New())
	app.Use(cors.New())

	// Create API group
	api := app.Group("/api")

	// Wallet routes
	api.Post("/wallet/create", CreateWalletHandler)
	api.Get("/wallet/balance/:address", GetWalletBalanceHandler)

	// Transaction routes
	api.Post("/transaction/create", CreateTransactionHandler)
	api.Get("/transaction/pending", GetPendingTransactionsHandler)
	api.Get("/transaction/:hash", GetTransactionHandler)

	// Blockchain routes
	api.Get("/chain", GetChainHandler)
	api.Get("/chain/:index", GetBlockByIndexHandler)
	api.Get("/block/latest", GetLatestBlockHandler)
	api.Get("/validate", ValidateHandler)

	// Mining routes
	api.Get("/mine", MineHandler)  // Keep GET for simple browser support
	api.Post("/mine", MineHandler) // Add POST for providing miner address

	// Node Stats routes
	api.Get("/info", GetNodeInfoHandler)
	api.Get("/stats", GetChainStatsHandler)

	// Networking routes
	api.Post("/peer/add", AddPeerHandler)
	api.Get("/peer/list", ListPeersHandler)
	api.Get("/sync", SyncHandler)

	fmt.Printf("🚀 ChainGo Fiber API running on %s\n", port)
	log.Fatal(app.Listen(":" + port))
}
