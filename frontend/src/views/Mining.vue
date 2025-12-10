<template>
  <div class="space-y-6">
    <h1 class="text-4xl font-bold text-white mb-8">Mining</h1>
    
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-white mb-4">Mine New Block</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-gray-400 mb-2">Miner Address (reward recipient)</label>
          <input 
            v-model="minerAddress"
            placeholder="Enter your wallet address..."
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />
        </div>
        
        <button 
          @click="mineBlock"
          :disabled="mining"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-4 rounded-lg transition font-bold text-lg"
        >
          {{ mining ? '⛏️ Mining... (this may take ~10 seconds)' : '⛏️ Mine Block' }}
        </button>

        <div v-if="miningResult" class="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
          <h3 class="text-green-400 font-bold mb-2">✅ Block Mined Successfully!</h3>
          <div class="text-white space-y-2">
            <p><span class="text-gray-400">Block Index:</span> {{ miningResult.block.index }}</p>
            <p><span class="text-gray-400">Hash:</span> <span class="font-mono text-sm">{{ miningResult.block.hash?.substring(0, 32) }}...</span></p>
            <p><span class="text-gray-400">Reward:</span> <span class="text-green-400 font-bold">{{ miningResult.block.reward }} coins</span></p>
            <p><span class="text-gray-400">Miner:</span> {{ miningResult.block.miner }}</p>
          </div>
        </div>

        <div v-if="miningError" class="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p class="text-red-400">❌ Mining failed: {{ miningError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { miningAPI } from '../services/api'

const minerAddress = ref('')
const mining = ref(false)
const miningResult = ref(null)
const miningError = ref(null)

const mineBlock = async () => {
  if (!minerAddress.value) {
    miningError.value = 'Please enter a miner address'
    return
  }
  
  mining.value = true
  miningError.value = null
  miningResult.value = null
  
  try {
    const response = await miningAPI.mine(minerAddress.value)
    miningResult.value = response.data
  } catch (error) {
    miningError.value = error.response?.data?.error || error.message
  } finally {
    mining.value = false
  }
}
</script>
