# ChainGo - Full-Stack Blockchain Implementation

![Go Version](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)
![Vue](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)

A complete blockchain implementation in Go with a modern Vue.js frontend. Features ECDSA wallets, Proof-of-Work mining, transaction signing, and P2P networking.

---

## 🚀 Quick Start

### Prerequisites
- Go 1.22+
- Node.js 18+
- npm or yarn

### Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
go build -o chaingo_backend main.go
./chaingo_backend
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Open in Browser:** http://localhost:5173

---

## 📁 Project Structure

```
ChainGo/
├── backend/              # Go blockchain implementation
│   ├── blockchain/       # Core blockchain logic
│   ├── internal/         # API handlers and server
│   ├── network/          # P2P networking
│   ├── pkg/             # Database (BoltDB)
│   ├── docs/            # Swagger documentation (partial)
│   ├── main.go          # Entry point
│   └── chaingo_backend  # Compiled binary
│
└── frontend/            # Vue.js web application
    ├── src/
    │   ├── views/       # 6 main pages
    │   ├── services/    # API client
    │   ├── router/      # Vue Router
    │   └── App.vue      # Main layout
    ├── dist/            # Production build
    └── package.json
```

---

## ✨ Features

### Backend (Go)
- ✅ **ECDSA Wallets** - Elliptic curve key generation
- ✅ **Proof-of-Work** - SHA-256 based mining (16-bit difficulty)
- ✅ **Transaction Signing** - Cryptographic signatures with verification
- ✅ **P2P Networking** - Multi-node blockchain synchronization
- ✅ **BoltDB Persistence** - Embedded key-value database
- ✅ **REST API** - 16 endpoints for all operations
- ✅ **CORS Enabled** - Frontend integration ready

### Frontend (Vue.js)
- ✅ **Dashboard** - Real-time blockchain statistics
- ✅ **Wallet Management** - Create wallets, check balances
- ✅ **Mining Interface** - Mine blocks with custom miner address
- ✅ **Blockchain Explorer** - View all blocks and transactions
- ✅ **Transaction Creator** - Send coins between wallets
- ✅ **Network Manager** - Add peers and sync blockchain
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Real-time Updates** - Fetch latest blockchain data

---

## 🎮 Usage

### 1. Create a Wallet
- Navigate to **Wallets** page
- Click "Create New Wallet"
- **Save the private key securely!**

### 2. Mine Your First Block
- Go to **Mining** page
- Enter your wallet address as miner
- Click "Mine Block" (takes ~10 seconds)
- Receive 50 coin reward

### 3. Check Balance
- Go to **Wallets** page  
- Enter your address in balance checker
- See your 50 coins from mining

### 4. Send a Transaction
- Go to **Transactions** page
- Fill in: from address, to address, amount, private key
- Create transaction
- Mine another block to confirm

### 5. Explore the Blockchain
- Go to **Explorer** page
- View all blocks with their transactions
- See hashes, timestamps, and nonces

### 6. Run Multi-Node Network
```bash
# Terminal 1 - Node 1
cd backend
./chaingo_backend -api 8080 -p2p 9000 -db node1.db

# Terminal 2 - Node 2  
cd backend
./chaingo_backend -api 8081 -p2p 9001 -db node2.db

# Frontend connects to Node 1 by default (port 8080)
# Navigate to Network page to add Node 2 as peer
```

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api`:

### Wallets
- `POST /api/wallet/create` - Create new wallet
- `GET /api/wallet/balance/:address` - Get balance

### Transactions
- `POST /api/transaction/create` - Create transaction
- `GET /api/transaction/pending` - View pending transactions
- `GET /api/transaction/:hash` - Get transaction by hash

### Mining
- `POST /api/mine` - Mine new block

### Blockchain
- `GET /api/chain` - Get full blockchain
- `GET /api/chain/:index` - Get block by index
- `GET /api/block/latest` - Get latest block
- `GET /api/validate` - Validate blockchain
- `GET /api/stats` - Get blockchain statistics

### Network
- `POST /api/peer/add` - Add P2P peer
- `GET /api/peer/list` - List connected peers
- `GET /api/sync` - Sync blockchain from peers

### Node
- `GET /api/info` - Get node information

**Complete API documentation:** See [API_GUIDE.md](API_GUIDE.md)

---

## 🛠️ Development

### Backend Development
```bash
cd backend

# Build
go build -o chaingo_backend main.go

# Run with custom configuration
./chaingo_backend -api 8080 -p2p 9000 -db chaingo.db

# Run tests
go test ./...

# Automated verification script
chmod +x verify_chain.sh
./verify_chain.sh
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Production Build

### Backend
```bash
cd backend
go build -o chaingo_backend main.go
# Binary ready: chaingo_backend (11MB)
```

### Frontend
```bash
cd frontend
npm run build
# Output: dist/ directory
# - index.html (0.45KB)
# - assets/index-*.js (142KB)
# - assets/index-*.css (2.87KB)
```

### Deployment
Serve frontend `dist/` with nginx or any static file server, proxying `/api/*` to backend on port 8080.

---

## 🧪 Testing

### Automated Testing
```bash
cd backend
./verify_chain.sh
```

**Tests:**
- ✅ Wallet creation
- ✅ Block mining
- ✅ Balance calculation  
- ✅ Transaction creation
- ✅ Transaction confirmation
- ✅ P2P synchronization

### Manual Testing
1. Open http://localhost:5173
2. Create wallets via UI
3. Mine blocks
4. Send transactions
5. Explore blockchain
6. Test network synchronization

---

## 🏗️ Architecture

### Backend Stack
- **Language:** Go 1.22
- **Web Framework:** Fiber v2
- **Database:** BoltDB (embedded)
- **Cryptography:** ECDSA (elliptic curve)
- **Hashing:** SHA-256
- **Consensus:** Proof of Work

### Frontend Stack
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite 7.2.7
- **Router:** Vue Router 4
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS

### Communication
- **Protocol:** REST API (JSON)
- **CORS:** Enabled for localhost:5173
- **Proxy:** Vite proxies `/api` to backend:8080

---

## 📚 Documentation

- [API Guide](API_GUIDE.md) - Complete API documentation
- [Project Explained](PROJECT_EXPLAINED.md) - How everything works
- [Implementation Plan](/.gemini/antigravity/brain/*/implementation_plan.md) - Frontend integration plan
- [Walkthrough](/.gemini/antigravity/brain/*/walkthrough.md) - Step-by-step guide

---

## 🔐 Security Notes

⚠️ **This is educational software. Do NOT use in production without:**
- Proper key management (hardware wallets, HSMs)
- Network encryption (TLS/SSL)
- Authentication and authorization
- Rate limiting and DDoS protection
- Security audit
- Formal verification of cryptographic implementations

---

## 🗺️ Roadmap

### Completed ✅
- [x] Core blockchain implementation
- [x] ECDSA wallet system
- [x] Proof-of-Work mining
- [x] Transaction signing
- [x] P2P networking
- [x] REST API (16 endpoints)
- [x] BoltDB persistence
- [x] Vue.js frontend
- [x] 6 interactive pages
- [x] API integration
- [x] Multi-node support

### Future Enhancements 🚀
- [ ] Smart contracts (Lua/WASM)
- [ ] WebSocket real-time updates
- [ ] Mempool visualization
- [ ] Transaction fees
- [ ] UTXO model
- [ ] Merkle tree verification
- [ ] Block explorer enhancements
- [ ] Wallet import/export
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Metrics and monitoring

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Vishal**
- GitHub: [@Vishal-2029](https://github.com/Vishal-2029)
- Project: ChainGo Blockchain

---

## 🙏 Acknowledgments

- Bitcoin whitepaper by Satoshi Nakamoto
- Ethereum for smart contract concepts
- Go Fiber framework
- Vue.js community
- BoltDB embedded database

---

## 📞 Support

For questions or issues:
1. Check [API_GUIDE.md](API_GUIDE.md)
2. Review [PROJECT_EXPLAINED.md](PROJECT_EXPLAINED.md)
3. Open a GitHub issue

---

**Made with ❤️ using Go and Vue.js**
