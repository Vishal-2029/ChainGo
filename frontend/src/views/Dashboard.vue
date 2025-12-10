<template>
  <div class="space-y-6">
    <h1 class="text-4xl font-bold text-white mb-8">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Stats Cards -->
      <div class="bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-300 text-sm">Total Blocks</p>
            <p class="text-3xl font-bold">{{ stats.blocks || 0 }}</p>
          </div>
          <span class="text-5xl">⛓️</span>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-green-500/20 to-green-700/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-300 text-sm">Total Transactions</p>
            <p class="text-3xl font-bold">{{ stats.totalTransactions || 0 }}</p>
          </div>
          <span class="text-5xl">💸</span>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-300 text-sm">Pending Transactions</p>
            <p class="text-3xl font-bold">{{ stats.pendingTransactions || 0 }}</p>
          </div>
          <span class="text-5xl">⏳</span>
        </div>
      </div>
    </div>

    <!-- Latest Block -->
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6" v-if="latestBlock">
      <h2 class="text-2xl font-bold text-white mb-4">Latest Block</h2>
      <div class="grid grid-cols-2 gap-4 text-white">
        <div>
          <p class="text-gray-400">Index</p>
          <p class="font-mono">{{ latestBlock.index }}</p>
        </div>
        <div>
          <p class="text-gray-400">Hash</p>
          <p class="font-mono text-sm">{{ latestBlock.hash?.substring(0, 16) }}...</p>
        </div>
        <div>
          <p class="text-gray-400">Timestamp</p>
          <p>{{ new Date(latestBlock.timestamp * 1000).toLocaleString() }}</p>
        </div>
        <div>
          <p class="text-gray-400">Transactions</p>
          <p>{{ latestBlock.transactions?.length || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { blockchainAPI } from '../services/api'

const stats = ref({})
const latestBlock = ref(null)

onMounted(async () => {
  try {
    const statsRes = await blockchainAPI.getStats()
    stats.value = statsRes.data
    
    const blockRes = await blockchainAPI.getLatestBlock()
    latestBlock.value = blockRes.data
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
})
</script>
