package internal

import (
	"encoding/hex"
	"fmt"
	"strconv"
	"sync"

	"github.com/Vishal-2029/blockchain"
	"github.com/Vishal-2029/network"
	"github.com/Vishal-2029/pkg"
	"github.com/gofiber/fiber/v2"
)

var mu sync.Mutex
var chain *blockchain.Blockchain
var pendingTx []*blockchain.Transaction
var node *network.Node
var wallets = make(map[string]*blockchain.Wallet)
var db *pkg.BoltDB

func logInfo(tag, msg string) {
	fmt.Printf("[INFO] [%s] %s\n", tag, msg)
}
func logSuccess(tag, msg string) {
	fmt.Printf("[SUCCESS] [%s] %s\n", tag, msg)
}
func logError(tag, msg string) {
	fmt.Printf("[ERROR] [%s] %s\n", tag, msg)
}

func SetBlockchain(bc *blockchain.Blockchain) {
	chain = bc
}

func SetNode(n *network.Node) {
	node = n
}

func SetDatabase(database *pkg.BoltDB) {
	db = database
	loadWalletsFromDB()
}

func loadWalletsFromDB() {
	walletsData, err := db.GetAllWallets()
	if err != nil {
		logInfo("DB_LOAD", "No existing wallets found in database")
		return
	}

	for address, walletData := range walletsData {
		wallet, err := blockchain.DeserializeWallet(walletData)
		if err == nil {
			wallets[address] = wallet
		}
	}
	logInfo("DB_LOAD", fmt.Sprintf("Loaded %d wallets from database", len(wallets)))
}

// ========== WALLET HANDLERS ==========

func CreateWalletHandler(c *fiber.Ctx) error {
	logInfo("WALLET_CREATE", "Starting wallet creation")

	wallet := blockchain.NewWallet()
	address := wallet.Address()

	// Store wallet in memory
	wallets[address] = wallet

	// NEW: Save wallet to database
	if db != nil {
		walletData, err := wallet.Serialize()
		if err == nil {
			db.SaveWallet(address, walletData)
			logSuccess("DB_SAVE", fmt.Sprintf("Wallet saved to database: %s", address))
		} else {
			logError("DB_SAVE", fmt.Sprintf("Failed to serialize wallet: %v", err))
		}
	}

	logSuccess("WALLET_CREATE", fmt.Sprintf("Wallet created - Address: %s", address))

	return c.JSON(fiber.Map{
		"address":    address,
		"publicKey":  hex.EncodeToString(wallet.PublicKey),
		"privateKey": wallet.PrivateKeyHex(),
		"message":    "Wallet created successfully - SAVE YOUR PRIVATE KEY!",
	})
}

func GetWalletBalanceHandler(c *fiber.Ctx) error {
	address := c.Params("address")

	// Calculate balance by scanning all transactions in the blockchain
	balance := 0
	for _, block := range chain.Block {
		for _, tx := range block.Transactions {
			if tx.To == address {
				balance += tx.Amount
			}
			if tx.From == address {
				balance -= tx.Amount
			}
		}
	}

	return c.JSON(fiber.Map{
		"address": address,
		"balance": balance,
	})
}

// ========== TRANSACTION HANDLERS ==========

func CreateTransactionHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	var body struct {
		From       string `json:"from"`
		To         string `json:"to"`
		Amount     int    `json:"amount"`
		PrivateKey string `json:"privateKey"` // User provides private key
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid JSON"})
	}

	// Find wallet by private key
	var wallet *blockchain.Wallet
	for addr, w := range wallets {
		if w.PrivateKeyHex() == body.PrivateKey {
			wallet = w
			// Verify the from address matches
			if addr != body.From {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Private key does not match from address",
				})
			}
			break
		}
	}

	if wallet == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid private key or wallet not found",
		})
	}

	// Create and sign transaction
	tx := &blockchain.Transaction{
		From:   body.From,
		To:     body.To,
		Amount: body.Amount,
	}

	// Sign the transaction
	tx.Sign(wallet)

	// Verify the signature
	if !tx.Verify() {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Transaction signature verification failed",
		})
	}

	// Add to pending transactions
	pendingTx = append(pendingTx, tx)

	// Broadcast to P2P network
	if node != nil {
		newTxMsg := network.Message{
			Type: "TRANSACTION",
			Data: tx,
		}
		node.Broadcast(newTxMsg)
	}

	return c.JSON(fiber.Map{
		"message": "Transaction created, signed, and verified successfully",
		"transaction": fiber.Map{
			"from":   tx.From,
			"to":     tx.To,
			"amount": tx.Amount,
			"signed": true,
		},
	})
}

// Update GetPendingTransactionsHandler to show signature info
func GetPendingTransactionsHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	var txList []fiber.Map
	for _, tx := range pendingTx {
		txList = append(txList, fiber.Map{
			"from":      tx.From,
			"to":        tx.To,
			"amount":    tx.Amount,
			"signed":    tx.R != "" && tx.S != "",
			"verified":  tx.Verify(), // Check if still valid
			"publicKey": hex.EncodeToString(tx.PublicKey),
		})
	}

	return c.JSON(fiber.Map{
		"count":        len(pendingTx),
		"transactions": txList,
	})
}

func GetTransactionHandler(c *fiber.Ctx) error {
	hash := c.Params("hash")

	// Search for transaction in blockchain
	for _, block := range chain.Block {
		for _, tx := range block.Transactions {
			txHash := fmt.Sprintf("%x", tx.Hash())
			if txHash == hash {
				return c.JSON(fiber.Map{
					"hash":  hash,
					"block": fmt.Sprintf("%x", block.Hash),
					"data":  tx,
				})
			}
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"error": "Transaction not found",
	})
}

// ========== BLOCKCHAIN HANDLERS ==========

func GetChainHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	var chainData []fiber.Map
	for i, block := range chain.Block {
		chainData = append(chainData, fiber.Map{
			"index":        i,
			"hash":         fmt.Sprintf("%x", block.Hash),
			"previousHash": fmt.Sprintf("%x", block.PrevHash),
			"timestamp":    block.Timestamp,
			"transactions": block.Transactions,
			"nonce":        block.Nonce,
		})
	}

	return c.JSON(fiber.Map{
		"length": len(chain.Block),
		"chain":  chainData,
	})
}

func GetBlockByIndexHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	index, err := strconv.Atoi(c.Params("index"))
	if err != nil || index < 0 || index >= len(chain.Block) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid block index",
		})
	}

	block := chain.Block[index]
	return c.JSON(fiber.Map{
		"index":        index,
		"hash":         fmt.Sprintf("%x", block.Hash),
		"previousHash": fmt.Sprintf("%x", block.PrevHash),
		"timestamp":    block.Timestamp,
		"transactions": block.Transactions,
		"nonce":        block.Nonce,
	})
}

func GetLatestBlockHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	if len(chain.Block) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No blocks in chain",
		})
	}

	block := chain.Block[len(chain.Block)-1]
	return c.JSON(fiber.Map{
		"index":        len(chain.Block) - 1,
		"hash":         fmt.Sprintf("%x", block.Hash),
		"previousHash": fmt.Sprintf("%x", block.PrevHash),
		"timestamp":    block.Timestamp,
		"transactions": block.Transactions,
		"nonce":        block.Nonce,
	})
}

func ValidateHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	err := chain.Validate()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "invalid",
			"error":  err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status":  "valid",
		"message": "Blockchain is valid",
		"blocks":  len(chain.Block),
	})
}

func DeleteBlockHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	index, err := strconv.Atoi(c.Params("index"))
	if err != nil || index < 0 || index >= len(chain.Block) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid block index",
		})
	}

	// Cannot delete genesis block
	if index == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot delete genesis block",
		})
	}

	// Delete this block and all subsequent blocks
	deletedCount := len(chain.Block) - index
	chain.Block = chain.Block[:index]

	logSuccess("BLOCK_DELETE", fmt.Sprintf("Deleted %d blocks starting from index %d", deletedCount, index))

	return c.JSON(fiber.Map{
		"message":      "Blocks deleted successfully",
		"deletedFrom":  index,
		"deletedCount": deletedCount,
		"newLength":    len(chain.Block),
	})
}

// ========== MINING HANDLER ==========

func MineHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	var body struct {
		MinerAddress string `json:"minerAddress"`
	}
	// Attempt to parse body, but don't fail if empty (for simple GET requests)
	c.BodyParser(&body)

	// Create a Coinbase transaction (Reward)
	// If no address provided, burn the reward or send to a default (e.g. Genesis)
	minerAddr := body.MinerAddress
	if minerAddr == "" {
		minerAddr = "Genesis"
	}

	rewardTx := &blockchain.Transaction{
		From:      "Coinbase",
		To:        minerAddr,
		Amount:    50, // Block reward
		PublicKey: []byte{},
		R:         "",
		S:         "",
	}

	// Prepare transactions for the block: Reward + Pending
	blockTx := []*blockchain.Transaction{rewardTx}
	blockTx = append(blockTx, pendingTx...)

	chain.AddBlock(blockTx)
	minedBlock := chain.Block[len(chain.Block)-1]

	// BROADCAST NEW BLOCK TO P2P NETWORK
	if node != nil {
		newBlockMsg := network.Message{
			Type: "BLOCK",
			Data: minedBlock,
		}
		node.Broadcast(newBlockMsg)
	}

	// Clear pending transactions after successful mining
	pendingTx = nil

	return c.JSON(fiber.Map{
		"message": "Block mined successfully",
		"block": fiber.Map{
			"index":        len(chain.Block) - 1,
			"hash":         fmt.Sprintf("%x", minedBlock.Hash),
			"timestamp":    minedBlock.Timestamp,
			"transactions": len(minedBlock.Transactions),
			"reward":       50,
			"miner":        minerAddr,
		},
	})
}

// ========== NODE STATS HANDLERS ==========

func GetNodeInfoHandler(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"name":        "ChainGo Node",
		"version":     "1.0.0",
		"status":      "running",
		"networkPort": 9000,
		"apiPort":     8080,
	})
}

func GetChainStatsHandler(c *fiber.Ctx) error {
	mu.Lock()
	defer mu.Unlock()

	totalTransactions := 0
	for _, block := range chain.Block {
		totalTransactions += len(block.Transactions)
	}

	return c.JSON(fiber.Map{
		"blocks":              len(chain.Block),
		"pendingTransactions": len(pendingTx),
		"totalTransactions":   totalTransactions,
		"latestBlockHash":     fmt.Sprintf("%x", chain.Block[len(chain.Block)-1].Hash),
	})
}

// ========== NETWORKING HANDLERS ==========

func AddPeerHandler(c *fiber.Ctx) error {
	var body struct {
		Address string `json:"address"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid JSON"})
	}

	if node != nil {
		node.Peers.AddPeer(body.Address)
	}

	return c.JSON(fiber.Map{
		"message": "Peer added successfully",
		"peer":    body.Address,
	})
}

func ListPeersHandler(c *fiber.Ctx) error {
	var peers []string
	if node != nil {
		peers = node.Peers.ListPeers()
	}

	return c.JSON(fiber.Map{
		"count": len(peers),
		"peers": peers,
	})
}

func SyncHandler(c *fiber.Ctx) error {
	if node != nil {
		msg := network.Message{
			Type: "CHAIN_REQUEST",
			Data: node.Address, // Send our listening address so peer can dial back
		}
		node.Broadcast(msg)
		return c.JSON(fiber.Map{"message": "Sync requested from peers"})
	}
	return c.JSON(fiber.Map{"error": "Node not initialized"})
}

// ========== HELPER FUNCTIONS ==========

func formatTransaction(tx *blockchain.Transaction) string {
	return tx.From + "->" + tx.To + ":" + strconv.Itoa(tx.Amount)
}
