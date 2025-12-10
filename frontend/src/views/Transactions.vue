<template>
  <div class="space-y-6">
    <h1 class="text-4xl font-bold text-white mb-8">Transactions</h1>

    <!-- Create Transaction Form -->
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-white mb-4">Create New Transaction</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-gray-400 mb-2">From Address</label>
          <input 
            v-model="newTx.from"
            placeholder="Your wallet address"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />
        </div>
        <div>
          <label class="block text-gray-400 mb-2">To Address</label>
          <input 
            v-model="newTx.to"
            placeholder="Recipient wallet address"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />
        </div>
        <div>
          <label class="block text-gray-400 mb-2">Amount</label>
          <input 
            v-model.number="newTx.amount"
            type="number"
            placeholder="Amount of coins"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />
        </div>
        <div>
          <label class="block text-gray-400 mb-2">Private Key</label>
          <input 
            v-model="newTx.privateKey"
            type="password"
            placeholder="Your private key"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />
        </div>
        
        <button 
          @click="createTransaction"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
        >
          Create Transaction
        </button>

        <div v-if="txResult" class="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
          <p class="text-green-400">✅ {{ txResult }}</p>
        </div>
      </div>
    </div>

    <!-- Pending Transactions -->
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-white">Pending Transactions</h2>
        <button 
          @click="fetchPending"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition text-sm"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div v-if="pending.length > 0" class="space-y-3">
        <div 
          v-for="(tx, i) in pending" 
          :key="i"
          class="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
        >
          <p class="text-white"><span class="text-blue-400">From:</span> {{ tx.from }}</p>
          <p class="text-white"><span class="text-green-400">To:</span> {{ tx.to }}</p>
          <p class="text-white"><span class="text-yellow-400">Amount:</span> <span class="font-bold">{{ tx.amount }} coins</span></p>
        </div>
      </div>
      <div v-else class="text-center text-gray-400 py-8">
        <p>No pending transactions</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { transactionAPI } from '../services/api'

const newTx = ref({
  from: '',
  to: '',
  amount: 0,
  privateKey: ''
})
const txResult = ref(null)
const pending = ref([])

const createTransaction = async () => {
  try {
    const response = await transactionAPI.create(newTx.value)
    txResult.value = response.data.message
    newTx.value = { from: '', to: '', amount: 0, privateKey: '' }
    fetchPending()
  } catch (error) {
    txResult.value = 'Error: ' + (error.response?.data?.error || error.message)
  }
}

const fetchPending = async () => {
  try {
    const response = await transactionAPI.getPending()
    pending.value = response.data.transactions || []
  } catch (error) {
    console.error('Failed to fetch pending transactions:', error)
  }
}

onMounted(() => {
  fetchPending()
})
</script>
