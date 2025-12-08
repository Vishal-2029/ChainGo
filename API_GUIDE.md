# ChainGo API Guide

This guide shows all available API endpoints, their usage, and example outputs.

**BASE URL:** `http://localhost:8080/api`

---

## 📱 Wallet APIs

### 1. Create Wallet
**Endpoint:** `POST /api/wallet/create`  
**Description:** Creates a new wallet with ECDSA key pair  
**Request Body:** None

**Example:**
```bash
curl -X POST http://localhost:8080/api/wallet/create
```

**Response:**
```json
{
  "address": "b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b",
  "publicKey": "04a8b2c3d4e5f6...",
  "privateKey": "5d8c9a7b3e4f2a1c...",
  "message": "Wallet created successfully - SAVE YOUR PRIVATE KEY!"
}
```

### 2. Get Wallet Balance
**Endpoint:** `GET /api/wallet/balance/:address`  
**Description:** Get the current balance of a wallet

**Example:**
```bash
curl http://localhost:8080/api/wallet/balance/b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b
```

**Response:**
```json
{
  "address": "b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b",
  "balance": 90
}
```

---

## 💸 Transaction APIs

### 3. Create Transaction
**Endpoint:** `POST /api/transaction/create`  
**Description:** Create and sign a new transaction  
**Request Body:** `{from, to, amount, privateKey}`

**Example:**
```bash
curl -X POST http://localhost:8080/api/transaction/create \
  -H "Content-Type: application/json" \
  -d '{
    "from": "b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b",
    "to": "7bd72b6d716277445abaff98bbd77808b110264c958a8bba7ab6997fca01ad2a",
    "amount": 10,
    "privateKey": "5d8c9a7b3e4f2a1c..."
  }'
```

**Response:**
```json
{
  "message": "Transaction created, signed, and verified successfully",
  "transaction": {
    "from": "b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b",
    "to": "7bd72b6d716277445abaff98bbd77808b110264c958a8bba7ab6997fca01ad2a",
    "amount": 10,
    "signed": true
  }
}
```

### 4. Get Pending Transactions
**Endpoint:** `GET /api/transaction/pending`  
**Description:** View all pending transactions in mempool

**Example:**
```bash
curl http://localhost:8080/api/transaction/pending
```

**Response:**
```json
{
  "count": 1,
  "transactions": [
    {
      "from": "b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b",
      "to": "7bd72b6d716277445abaff98bbd77808b110264c958a8bba7ab6997fca01ad2a",
      "amount": 10,
      "signed": true,
      "verified": true,
      "publicKey": "04a8b2c3..."
    }
  ]
}
```

### 5. Get Transaction by Hash
**Endpoint:** `GET /api/transaction/:hash`  
**Description:** Get details of a specific transaction

**Example:**
```bash
curl http://localhost:8080/api/transaction/abc123def456
```

**Response:**
```json
{
  "hash": "abc123def456",
  "block": "0000ae3b9c...",
  "data": {
    "from": "...",
    "to": "...",
    "amount": 10
  }
}
```

---

## ⛏️ Mining APIs

### 6. Mine Block (GET)
**Endpoint:** `GET /api/mine`  
**Description:** Mine a new block (reward goes to Genesis if no address provided)

**Example:**
```bash
curl http://localhost:8080/api/mine
```

**Response:**
```json
{
  "message": "Block mined successfully",
  "block": {
    "index": 1,
    "hash": "0000ae3b9c7d1e5f...",
    "timestamp": 1733638987,
    "transactions": 1,
    "reward": 50,
    "miner": "Genesis"
  }
}
```

### 7. Mine Block (POST)
**Endpoint:** `POST /api/mine`  
**Description:** Mine a new block with specific miner address  
**Request Body:** `{minerAddress}`

**Example:**
```bash
curl -X POST http://localhost:8080/api/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b"}'
```

**Response:**
```json
{
  "message": "Block mined successfully",
  "block": {
    "index": 2,
    "hash": "0000f3c4d8a1e9b2...",
    "timestamp": 1733639101,
    "transactions": 2,
    "reward": 50,
    "miner": "b358327f2d0cdcd524218fd109ef91b175af67caf73009ea4a0bf58ff85dbf0b"
  }
}
```

---

## ⛓️ Blockchain APIs

### 8. Get Full Chain
**Endpoint:** `GET /api/chain`  
**Description:** Get the entire blockchain

**Example:**
```bash
curl http://localhost:8080/api/chain
```

**Response:**
```json
{
  "length": 3,
  "chain": [
    {
      "index": 0,
      "hash": "000073ca9af866327b7d9a2748ff7f8cec094bcd0ff0d29009b07d9476b3c1d6",
      "previousHash": "",
      "timestamp": 1733638965,
      "transactions": [...],
      "nonce": 5571
    }
  ]
}
```

### 9. Get Block by Index
**Endpoint:** `GET /api/chain/:index`  
**Description:** Get a specific block by its index

**Example:**
```bash
curl http://localhost:8080/api/chain/1
```

**Response:**
```json
{
  "index": 1,
  "hash": "0000ae3b9c7d1e5f...",
  "previousHash": "000073ca9af866...",
  "timestamp": 1733638987,
  "transactions": [...],
  "nonce": 12453
}
```

### 10. Get Latest Block
**Endpoint:** `GET /api/block/latest`  
**Description:** Get the most recent block

**Example:**
```bash
curl http://localhost:8080/api/block/latest
```

**Response:**
```json
{
  "index": 2,
  "hash": "0000f3c4d8a1e9b2...",
  "previousHash": "0000ae3b9c7d1e5f...",
  "timestamp": 1733639101,
  "transactions": [...],
  "nonce": 8321
}
```

### 11. Validate Blockchain
**Endpoint:** `GET /api/validate`  
**Description:** Validate the entire blockchain integrity

**Example:**
```bash
curl http://localhost:8080/api/validate
```

**Response (Valid):**
```json
{
  "status": "valid",
  "message": "Blockchain is valid",
  "blocks": 3
}
```

**Response (Invalid):**
```json
{
  "status": "invalid",
  "error": "block 2 proof of work invalid"
}
```

---

## 🌐 Network/P2P APIs

### 12. Add Peer
**Endpoint:** `POST /api/peer/add`  
**Description:** Manually add a peer node  
**Request Body:** `{address}`

**Example:**
```bash
curl -X POST http://localhost:8080/api/peer/add \
  -H "Content-Type: application/json" \
  -d '{"address": ":9001"}'
```

**Response:**
```json
{
  "message": "Peer added successfully",
  "peer": ":9001"
}
```

### 13. List Peers
**Endpoint:** `GET /api/peer/list`  
**Description:** Get all connected peers

**Example:**
```bash
curl http://localhost:8080/api/peer/list
```

**Response:**
```json
{
  "count": 1,
  "peers": [":9001"]
}
```

### 14. Sync Blockchain
**Endpoint:** `GET /api/sync`  
**Description:** Request blockchain sync from all peers

**Example:**
```bash
curl http://localhost:8080/api/sync
```

**Response:**
```json
{
  "message": "Sync requested from peers"
}
```

---

## ℹ️ Node Info APIs

### 15. Get Node Info
**Endpoint:** `GET /api/info`  
**Description:** Get node information

**Example:**
```bash
curl http://localhost:8080/api/info
```

**Response:**
```json
{
  "name": "ChainGo Node",
  "version": "1.0.0",
  "status": "running",
  "networkPort": 9000,
  "apiPort": 8080
}
```

### 16. Get Chain Statistics
**Endpoint:** `GET /api/stats`  
**Description:** Get blockchain statistics

**Example:**
```bash
curl http://localhost:8080/api/stats
```

**Response:**
```json
{
  "blocks": 3,
  "pendingTransactions": 0,
  "totalTransactions": 4,
  "latestBlockHash": "0000f3c4d8a1e9b2..."
}
```

---

## 📖 Complete Workflow Example

**SCENARIO:** Alice wants to send 10 coins to Bob

### Step 1: Create Wallets for Alice and Bob

```bash
curl -X POST http://localhost:8080/api/wallet/create
# => Alice Address: abc123...
# => Alice Private Key: xyz789...

curl -X POST http://localhost:8080/api/wallet/create
# => Bob Address: def456...
```

### Step 2: Alice Mines a Block to Get Coins

```bash
curl -X POST http://localhost:8080/api/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "abc123..."}'

# Mining happens (Proof of Work)...
# => Block mined! Alice receives 50 coins as reward

# Check Alice's balance:
curl http://localhost:8080/api/wallet/balance/abc123...
# => {"balance": 50}
```

### Step 3: Alice Creates Transaction to Bob

```bash
curl -X POST http://localhost:8080/api/transaction/create \
  -H "Content-Type: application/json" \
  -d '{
    "from": "abc123...",
    "to": "def456...",
    "amount": 10,
    "privateKey": "xyz789..."
  }'

# => Transaction signed and added to pending pool
```

### Step 4: Mine Another Block to Confirm Transaction

```bash
curl -X POST http://localhost:8080/api/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "abc123..."}'

# => Block mined! Transaction is now confirmed.
# => Alice gets another 50 coin reward for mining this block
```

### Step 5: Check Balances

```bash
curl http://localhost:8080/api/wallet/balance/abc123...
# => {"balance": 90}  (50 initial + 50 new reward - 10 sent)

curl http://localhost:8080/api/wallet/balance/def456...
# => {"balance": 10}  (received from Alice)
```

### Step 6: View the Blockchain

```bash
curl http://localhost:8080/api/chain
# => Shows 3 blocks:
#    - Block 0: Genesis
#    - Block 1: Coinbase (50 to Alice)
#    - Block 2: Coinbase (50 to Alice) + Transfer (10 to Bob)
```

### Step 7: Connect a Second Node for P2P Networking

```bash
# Start Node 2 on different port:
./chaingo_backend -api 8081 -p2p 9001 -db node2.db

# From Node 2, add Node 1 as peer:
curl -X POST http://localhost:8081/api/peer/add \
  -H "Content-Type: application/json" \
  -d '{"address": ":9000"}'

# Sync blockchain from peers:
curl http://localhost:8081/api/sync

# => Node 2 receives the full blockchain from Node 1
```

---

## 🎯 API Usage Summary

The above workflow demonstrates:

1. **POST /api/wallet/create** - Generate cryptographic wallets
2. **POST /api/mine** - Proof of Work mining with block rewards
3. **GET /api/wallet/balance/:address** - Calculate UTXO-like balance
4. **POST /api/transaction/create** - Create signed transactions
5. **GET /api/chain** - Inspect blockchain state
6. **POST /api/peer/add** - P2P networking
7. **GET /api/sync** - Blockchain synchronization

### Each API plays a crucial role:

- **Wallet APIs:** Manage identities and check funds
- **Transaction APIs:** Transfer value between addresses
- **Mining APIs:** Secure the network and mint new coins
- **Blockchain APIs:** Query historical data
- **Network APIs:** Enable decentralization
