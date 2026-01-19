#!/bin/bash
set -e

# Cleanup
echo "Cleaning up..."
pkill -f chaingo_backend || true
rm -f chaingo.db chaingo_node2.db chaingo_backend

# Build
echo "Building..."
go build -o chaingo_backend main.go

# Start Node 1
echo "Starting Node 1 (API:8080, P2P:9000)..."
./chaingo_backend -api 8080 -p2p 9000 -db chaingo.db > node1.log 2>&1 &
PID1=$!
sleep 3

# Test Wallet Creation
echo "Creating Wallet A..."
ADDR_A=$(curl -s -X POST http://localhost:8080/api/wallet/create | jq -r .address)
echo "Wallet A: $ADDR_A"

if [ -z "$ADDR_A" ] || [ "$ADDR_A" == "null" ]; then
    echo "Failed to create wallet"
    exit 1
fi

echo "Creating Wallet B..."
ADDR_B=$(curl -s -X POST http://localhost:8080/api/wallet/create | jq -r .address)
echo "Wallet B: $ADDR_B"
PVT_KEY=$(curl -s -X POST http://localhost:8080/api/wallet/create | jq -r .privateKey) # Create C just to get a private key properly or use A's if I capture it. 
# Wait, I need A's private key to send money.
# Update code to capture private key of A.


# Function to create wallet and return JSON
create_wallet() {
    curl -s -X POST http://localhost:8080/api/wallet/create
}

echo "Re-creating Wallet A with Private Key..."
WALLET_A=$(create_wallet)
ADDR_A=$(echo $WALLET_A | jq -r .address)
PRIV_A=$(echo $WALLET_A | jq -r .privateKey)
echo "Wallet A: $ADDR_A"

# Mine to A (Get 50 Coins)
echo "Mining Block 1 (Reward to A)..."
curl -s -X POST -H "Content-Type: application/json" -d "{\"minerAddress\":\"$ADDR_A\"}" http://localhost:8080/api/mine | jq .message

# Check A Balance
echo "Checking Balance A (Expect 50)..."
BAL_A=$(curl -s http://localhost:8080/api/wallet/balance/$ADDR_A | jq -r .balance)
echo "Balance A: $BAL_A"

if [ "$BAL_A" != "50" ]; then
    echo "Balance incorrect!"
    exit 1
fi

# Send 10 from A to B
echo "Sending 10 from A to B..."
# Need Wallet B address
WALLET_B=$(create_wallet)
ADDR_B=$(echo $WALLET_B | jq -r .address)
echo "Wallet B: $ADDR_B"

TX_RESP=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"from\":\"$ADDR_A\", \"to\":\"$ADDR_B\", \"amount\":10, \"privateKey\":\"$PRIV_A\"}" http://localhost:8080/api/transaction/create)
echo "Tx Response: $(echo $TX_RESP | jq -r .message)"

# Mine again to process transaction
echo "Mining Block 2..."
curl -s -X POST -H "Content-Type: application/json" -d "{\"minerAddress\":\"$ADDR_A\"}" http://localhost:8080/api/mine | jq .message

# Check Balances
BAL_A=$(curl -s http://localhost:8080/api/wallet/balance/$ADDR_A | jq -r .balance)
BAL_B=$(curl -s http://localhost:8080/api/wallet/balance/$ADDR_B | jq -r .balance)
echo "Final Balance A: $BAL_A (Expect ~90: 50 initial + 50 reward block 2 - 10 sent)" 
# Wait, Block 1: +50. Block 2: +50 (reward) -10 (sent) = 90.
echo "Final Balance B: $BAL_B (Expect 10)"

# Verify P2P
echo "Starting Node 2 (API:8081, P2P:9001)..."
./chaingo_backend -api 8081 -p2p 9001 -db chaingo_node2.db > node2.log 2>&1 &
PID2=$!
sleep 3

echo "Connecting Peer..."
curl -s -X POST -H "Content-Type: application/json" -d "{\"address\":\":9000\"}" http://localhost:8081/api/peer/add | jq .message

echo "Requesting Sync..."
curl -s http://localhost:8081/api/sync | jq .message

sleep 2
echo "Node 2 Log Check for Chain:"
grep "Received valid blockchain" node2.log || echo "Sync Log not found"

# Cleanup
kill $PID1 $PID2
echo "Verification Done!"
