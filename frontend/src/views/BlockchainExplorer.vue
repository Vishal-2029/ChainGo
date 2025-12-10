<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-4xl font-bold text-white">Blockchain Explorer</h1>
      <button 
        @click="fetchChain" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
      >
        🔄 Refresh
      </button>
    </div>

    <div v-if="chain.length > 0" class="space-y-4">
      <div 
        v-for="block in chain" 
        :key="block.index"
        class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-bold text-white">Block #{{ block.index }}</h3>
          <span class="text-gray-400 text-sm">{{ new Date(block.timestamp * 1000).toLocaleString() }}</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
          <div>
            <p class="text-gray-400 text-sm">Hash</p>
            <p class="font-mono text-sm break-all">{{ block.hash }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Previous Hash</p>
            <p class="font-mono text-sm break-all">{{ block.previousHash || 'Genesis Block' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Nonce</p>
            <p class="font-mono">{{ block.nonce }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Transactions</p>
            <p>{{ block.transactions?.length || 0 }} transaction(s)</p>
          </div>
        </div>

        <div v-if="block.transactions && block.transactions.length > 0" class="mt-4 border-t border-gray-700 pt-4">
          <p class="text-gray-400 text-sm mb-2">Transactions:</p>
          <div class="space-y-2">
            <div 
              v-for="(tx, i) in block.transactions" 
              :key="i"
              class="bg-gray-900/50 rounded p-3 text-sm"
            >
              <p class="text-green-400">{{ tx.from }} → {{ tx.to }}: <span class="font-bold">{{ tx.amount }} coins</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 py-12">
      <p class="text-xl">No blocks found. Start by mining a block!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { blockchainAPI } from '../services/api'

const chain = ref([])

const fetchChain = async () => {
  try {
    const response = await blockchainAPI.getChain()
    chain.value = response.data.chain || []
  } catch (error) {
    console.error('Failed to fetch blockchain:', error)
  }
}

onMounted(() => {
  fetchChain()
})
</script>
