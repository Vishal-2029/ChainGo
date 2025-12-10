<template>
  <div class="space-y-6">
    <h1 class="text-4xl font-bold text-white mb-8">Network</h1>

    <!-- Add Peer -->
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-white mb-4">Add P2P Peer</h2>
      <div class="flex gap-4">
        <input 
          v-model="newPeerAddress"
          placeholder="Enter peer address (e.g., :9001)"
          class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
        />
        <button 
          @click="addPeer"
          class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
        >
          Add Peer
        </button>
      </div>
      <div v-if="addPeerResult" class="mt-4 p-4 bg-blue-900/30 rounded-lg">
        <p class="text-blue-300">{{ addPeerResult }}</p>
      </div>
    </div>

    <!-- Sync Blockchain -->
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-white mb-4">Blockchain Synchronization</h2>
      <button 
        @click="syncBlockchain"
        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-semibold"
      >
        🔄 Sync with Peers
      </button>
      <div v-if="syncResult" class="mt-4 p-4 bg-green-900/30 rounded-lg">
        <p class="text-green-400">{{ syncResult }}</p>
      </div>
    </div>

    <!-- Connected Peers List -->
    <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-white">Connected Peers</h2>
        <button 
          @click="fetchPeers"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div v-if="peers.length > 0" class="space-y-2">
        <div 
          v-for="(peer, i) in peers" 
          :key="i"
          class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
        >
          <span class="text-white font-mono">{{ peer }}</span>
          <span class="text-green-400">● Connected</span>
        </div>
      </div>
      <div v-else class="text-center text-gray-400 py-8">
        <p>No peers connected</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { networkAPI } from '../services/api'

const newPeerAddress = ref('')
const addPeerResult = ref(null)
const syncResult = ref(null)
const peers = ref([])

const addPeer = async () => {
  try {
    const response = await networkAPI.addPeer(newPeerAddress.value)
    addPeerResult.value = response.data.message
    newPeerAddress.value = ''
    fetchPeers()
  } catch (error) {
    addPeerResult.value = 'Error: ' + (error.response?.data?.error || error.message)
  }
}

const syncBlockchain = async () => {
  try {
    const response = await networkAPI.sync()
    syncResult.value = response.data.message
  } catch (error) {
    syncResult.value = 'Error: ' + (error.response?.data?.error || error.message)
  }
}

const fetchPeers = async () => {
  try {
    const response = await networkAPI.listPeers()
    peers.value = response.data.peers || []
  } catch (error) {
    console.error('Failed to fetch peers:', error)
  }
}

onMounted(() => {
  fetchPeers()
})
</script>
