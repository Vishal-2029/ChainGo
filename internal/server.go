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

func StartServer(db *pkg.BoltDB) {
	bc := blockchain.NewBlockchain(db)
	SetBlockchain(bc)

	app := fiber.New(fiber.Config{AppName: "ChainGo Blockchain API"})
	app.Use(logger.New())
	app.Use(cors.New())

	// Wallet routes
	app.Post("/wallet/create", CreateWalletHandler)
	app.Get("/wallet/balance/:address", GetWalletBalanceHandler)
	
	// Transaction routes
	app.Post("/transaction/create", CreateTransactionHandler)
	app.Get("/transaction/pending", GetPendingTransactionsHandler)
	app.Get("/transaction/:hash", GetTransactionHandler)
	
	// Blockchain routes
	app.Get("/chain", GetChainHandler)
	app.Get("/chain/:index", GetBlockByIndexHandler)
	app.Get("/block/latest", GetLatestBlockHandler)
	app.Get("/validate", ValidateHandler)
	
	// Mining routes
	app.Get("/mine", MineHandler)
	
	// Node Stats routes
	app.Get("/info", GetNodeInfoHandler)
	app.Get("/stats", GetChainStatsHandler)
	
	// Networking routes
	app.Post("/peer/add", AddPeerHandler)
	app.Get("/peer/list", ListPeersHandler)

	port := ":8080"
	fmt.Printf("🚀 ChainGo Fiber API running on %s\n", port)
	log.Fatal(app.Listen(port))
}