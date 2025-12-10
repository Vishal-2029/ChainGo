<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-bold text-white">🔐 Admin - Wallet Management</h1>
      <button 
        @click="fetchWallets" 
        class="btn-primary"
      >
        🔄 Refresh
      </button>
    </div>

    <!-- Warning Notice -->
    <div class="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
      <p class="text-yellow-300">
        ⚠️ <strong>Security Warning:</strong> This page displays sensitive information including private keys. 
        In production, this should be protected with authentication and shown only to administrators.
      </p>
    </div>

    <!-- Wallets Count -->
    <div class="card card-gradient-blue">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-300 text-sm">Total Wallets in Database</p>
          <p class="text-3xl font-bold text-white">{{ wallets.length }}</p>
        </div>
        <span class="text-5xl">💳</span>
      </div>
    </div>

    <!-- Wallets List -->
    <div v-if="wallets.length > 0" class="space-y-4">
      <div 
        v-for="(wallet, index) in wallets" 
        :key="index"
        class="card"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold text-white">Wallet #{{ index + 1 }}</h3>
          <button 
            @click="copyToClipboard(wallet.address, 'address')"
            class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
          >
            📋 Copy Address
          </button>
        </div>

        <div class="space-y-4">
          <!-- Address -->
          <div>
            <label class="block text-gray-400 text-sm mb-1">Address (Public)</label>
            <div class="flex items-center gap-2">
              <input 
                :value="wallet.address" 
                readonly
                class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>

          <!-- Public Key -->
          <div>
            <label class="block text-gray-400 text-sm mb-1">Public Key</label>
            <div class="flex items-center gap-2">
              <input 
                :value="wallet.publicKey" 
                readonly
                class="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm"
              />
              <button 
                @click="copyToClipboard(wallet.publicKey, 'public key')"
                class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
              >
                📋
              </button>
            </div>
          </div>

          <!-- Private Key -->
          <div>
            <label class="block text-red-400 text-sm mb-1">
              🔒 Private Key (Sensitive - Keep Secret!)
            </label>
            <div class="flex items-center gap-2">
              <input 
                :type="showPrivateKey[index] ? 'text' : 'password'"
                :value="wallet.privateKey" 
                readonly
                class="flex-1 bg-red-900/20 border border-red-700/50 rounded px-3 py-2 text-red-300 font-mono text-sm"
              />
              <button 
                @click="togglePrivateKey(index)"
                class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
              >
                {{ showPrivateKey[index] ? '🙈' : '👁️' }}
              </button>
              <button 
                @click="copyToClipboard(wallet.privateKey, 'private key')"
                class="bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition"
              >
                📋
              </button>
            </div>
          </div>

          <!-- Balance Check -->
          <div class="pt-4 border-t border-gray-700">
            <button 
              @click="checkBalance(wallet.address, index)"
              class="btn-purple text-sm"
            >
              💰 Check Balance
            </button>
            <span v-if="balances[index] !== undefined" class="ml-4 text-green-400 font-bold">
              Balance: {{ balances[index] }} coins
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center text-gray-400 py-12 card">
      <p class="text-xl mb-4">📭 No wallets found in database</p>
      <p>Create a wallet from the Wallets page to see it here</p>
    </div>

    <!-- Copy Notification -->
    <div 
      v-if="copyNotification"
      class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition"
    >
      ✅ {{ copyNotification }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { walletAPI } from '../services/api'

const wallets = ref([])
const showPrivateKey = reactive({})
const balances = reactive({})
const copyNotification = ref('')

const fetchWallets = async () => {
  try {
    const response = await axios.get('/api/wallet/all')
    wallets.value = response.data.wallets || []
  } catch (error) {
    console.error('Failed to fetch wallets:', error)
  }
}

const togglePrivateKey = (index) => {
  showPrivateKey[index] = !showPrivateKey[index]
}

const checkBalance = async (address, index) => {
  try {
    const response = await walletAPI.getBalance(address)
    balances[index] = response.data.balance
  } catch (error) {
    console.error('Failed to check balance:', error)
    balances[index] = 'Error'
  }
}

const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    copyNotification.value = `${label} copied!`
    setTimeout(() => {
      copyNotification.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

onMounted(() => {
  fetchWallets()
})
</script>
