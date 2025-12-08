# ChainGo Project Explained

---

## 1. What is `chaingo_backend`?

The `chaingo_backend` file is the **COMPILED EXECUTABLE** of your blockchain node.

When you run:
```bash
go build -o chaingo_backend main.go
```

The Go compiler takes your source code and creates a single binary file that contains your entire blockchain application. This binary is:

- ✅ **Standalone** - No need for Go installed to run it
- ✅ **Complete** - Contains HTTP server, blockchain logic, mining, and P2P networking
- ✅ **Distributable** - Can be distributed to others to run their own node

### How to Run It

```bash
# Default ports
./chaingo_backend

# Custom ports
./chaingo_backend -api 8080 -p2p 9000

# Custom database
./chaingo_backend -db mychain.db
```

---

## 2. What is `verify_chain.sh`?

The `verify_chain.sh` is an **AUTOMATED TEST SCRIPT** that verifies all features of your blockchain work correctly.

### How It Works

#### Step 1: Cleanup
- Kills any running chaingo processes
- Removes old database files
- Rebuilds the binary

#### Step 2: Start Node 1
- Launches chaingo_backend on port 8080 (API) and 9000 (P2P)
- Waits 3 seconds for startup

#### Step 3: Create Wallets
- Calls `POST /api/wallet/create` twice
- Stores addresses and private keys in variables
- Uses `jq` to parse JSON responses

#### Step 4: Mine First Block
- Sends `POST /api/mine` with minerAddress
- Creates Block 1 with 50 coin reward
- Uses Proof of Work algorithm (finds valid nonce)

#### Step 5: Verify Balance
- Calls `GET /api/wallet/balance/:address`
- Checks that balance is exactly 50
- Exits if incorrect (test failed)

#### Step 6: Create Transaction
- Sends `POST /api/transaction/create`
- Transfers 10 coins from Wallet A to Wallet B
- Transaction is signed with A's private key

#### Step 7: Mine Second Block
- Mines another block to confirm the transaction
- Miner (Wallet A) gets another 50 coin reward

#### Step 8: Verify Final Balances
- Wallet A: Should be 90 (50 + 50 - 10)
- Wallet B: Should be 10 (received amount)

#### Step 9: Test P2P Networking
- Starts Node 2 on port 8081/9001
- Connects Node 2 to Node 1
- Requests blockchain sync
- Checks if Node 2 received the blockchain

#### Step 10: Cleanup & Report
- Kills both nodes
- Prints "Verification Done!"
- Returns exit code 0 (success)

### Key Commands in Script

| Command | Purpose |
|---------|---------|
| `curl` | Makes HTTP requests to API |
| `jq` | Parses JSON responses |
| `grep` | Searches log files for sync confirmation |
| `$(...)` | Captures command output to variables |

---

## 3. Project File Structure

```
ChainGo/
├── main.go                 # Entry point, arg parsing, starts server & P2P
├── chaingo_backend         # Compiled binary (run this!)
├── chaingo.db              # BoltDB database (persistent storage)
├── verify_chain.sh         # Automated test script
├── API_GUIDE.md            # API documentation
├── PROJECT_EXPLAINED.md    # This file
│
├── blockchain/
│   ├── block.go            # Block structure, serialization
│   ├── blockchain.go       # Chain management, validation
│   ├── pow.go              # Proof of Work algorithm
│   ├── transaction.go      # Transaction structure, signing
│   ├── wallet.go           # ECDSA wallet, key generation
│   └── utils.go            # Helper functions
│
├── internal/
│   ├── server.go           # Fiber HTTP server setup
│   └── handlers.go         # API endpoint logic (16 handlers)
│
├── network/
│   ├── node.go             # P2P node, connection handling
│   ├── peer.go             # Peer management
│   └── protocol.go         # Message encoding/decoding
│
└── pkg/
    └── bolt.go             # BoltDB wrapper, persistence
```

---

## 4. How the Blockchain Works

### Data Flow

```mermaid
graph LR
    A[User creates wallet] --> B[ECDSA keypair generated]
    B --> C[Stored in memory + DB]
    C --> D[User creates transaction]
    D --> E[Signed with private key]
    E --> F[Added to mempool]
    F --> G[Miner calls /api/mine]
    G --> H[Collects pending txs]
    H --> I[Runs PoW]
    I --> J[Finds nonce]
    J --> K[Block added to chain]
    K --> L[Saved to BoltDB]
    L --> M[Broadcasted to peers]
    M --> N[Other nodes validate]
    N --> O[Add to their chain]
```

1. User creates wallet → ECDSA keypair generated → Stored in memory + DB
2. User creates transaction → Signed with private key → Added to mempool
3. Miner calls `/api/mine` → Collects pending txs → Runs PoW → Finds nonce
4. Block added to chain → Saved to BoltDB → Broadcasted to peers
5. Other nodes receive block → Validate → Add to their chain

### Proof of Work

- **Target difficulty:** 16 bits (hash must start with ~4 zeros)
- **Mining process:** Miner increments nonce until hash < target
- **Average time:** ~10 seconds per block
- **Purpose:** Validates blockchain integrity

### Transaction Lifecycle

| Stage | Description |
|-------|-------------|
| **1. Created** | User signs with private key |
| **2. Pending** | Added to mempool, broadcasted to peers |
| **3. Confirmed** | Included in mined block |
| **4. Permanent** | Block is part of immutable chain |

### P2P Networking

1. Node 1 listens on `:9000`
2. Node 2 connects via `/api/peer/add`
3. Node 2 calls `/api/sync`
4. Node 2 broadcasts `CHAIN_REQUEST`
5. Node 1 receives request, sends `CHAIN_RESPONSE`
6. Node 2 validates and adopts longer chain

---

## 5. Running Multi-Node Setup

### Terminal 1 (Node 1)
```bash
./chaingo_backend -api 8080 -p2p 9000 -db node1.db
```

### Terminal 2 (Node 2)
```bash
./chaingo_backend -api 8081 -p2p 9001 -db node2.db
```

### Terminal 3 (Connect Nodes)
```bash
# Add Node 1 as peer from Node 2
curl -X POST http://localhost:8081/api/peer/add \
  -H "Content-Type: application/json" \
  -d '{"address": ":9000"}'

# Sync blockchain
curl http://localhost:8081/api/sync
```

**Result:** Both nodes now share the same blockchain!

---

## 6. Key Technologies Used

| Technology | Purpose |
|------------|---------|
| **Go Language** | System-level performance |
| **Fiber Framework** | Fast HTTP routing |
| **BoltDB** | Embedded key-value database |
| **ECDSA** | Elliptic curve cryptography for signatures |
| **SHA256** | Cryptographic hashing |
| **Proof of Work** | Consensus algorithm |
| **Gob Encoding** | Go binary serialization |
| **TCP Sockets** | P2P networking |

---

## 7. Common Operations

### Build the Project
```bash
go build -o chaingo_backend main.go
```

### Run Tests
```bash
# Automated verification
chmod +x verify_chain.sh
./verify_chain.sh

# Go tests
go test ./... -v
go test ./... -cover
```

### Clean Database
```bash
rm chaingo.db
```

### Check Logs
```bash
# View running node logs
tail -f /path/to/node.log

# During verify_chain.sh
cat node1.log
cat node2.log
```
