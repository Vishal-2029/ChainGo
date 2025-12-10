<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-bold text-white">Wallets</h1>
      <button 
        @click="createWallet" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
      >
        + Create New Wallet
      </button>
    </div>

    <!-- New Wallet Display -->
    <div v-if="newWallet" class="bg-green-900/30 border border-green-500/50 rounded-xl p-6">
      <h3 class="text-xl font-bold text-green-400 mb-4">✅ Wallet Created Successfully!</h3>
      <div class="space-y-3 text-white">
        <div>
          <p class="text-gray-400 text-sm">Address:</p>
          <p class="font-mono break-all">{{ newWallet.address }}</p>
        </div>
        <div>
          <p class="text-gray-400 text-sm">Private Key:</p>
          <p class="font-mono break-all text-red-400">{{ newWallet.privateKey }}</p>
          <p class="text-red-300 text-xs mt-1">⚠️ Save this private key securely! It cannot be recovered.</p>
        </div>
      </div>
    </div>

    <!-- Balance Checker -->
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-white mb-4">Check Balance</h2>
      <div class="flex gap-4">
        <input 
          v-model="addressToCheck"
          placeholder="Enter wallet address..."
          class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
        />
        <button 
          @click="checkBalance"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
        >
          Check Balance
        </button>
      </div>
      <div v-if="balance !== null" class="mt-4 p-4 bg-blue-900/30 rounded-lg">
        <p class="text-blue-300">Balance: <span class="text-2xl font-bold text-white">{{ balance }} coins</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { walletAPI } from '../services/api'

const newWallet = ref(null)
const addressToCheck = ref('')
const balance = ref(null)

const createWallet = async () => {
  try {
    const response = await walletAPI.create()
    newWallet.value = response.data
  } catch (error) {
    console.error('Failed to create wallet:', error)
  }
}

const checkBalance = async () => {
  try {
    const response = await walletAPI.getBalance(addressToCheck.value)
    balance.value = response.data.balance
  } catch (error) {
    console.error('Failed to check balance:', error)
  }
}
</script>
