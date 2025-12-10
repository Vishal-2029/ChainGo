<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
    <nav class="bg-black/30 backdrop-blur-sm border-b border-blue-500/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex space-x-8">
            <router-link to="/" class="flex items-center px-3 py-2 text-white hover:bg-blue-500/20 rounded-lg transition">
              🏠 Dashboard
            </router-link>
            <router-link to="/wallets" class="flex items-center px-3 py-2 text-white hover:bg-blue-500/20 rounded-lg transition">
              💳 Wallets
            </router-link>
            <router-link to="/mining" class="flex items-center px-3 py-2 text-white hover:bg-blue-500/20 rounded-lg transition">
              ⛏️ Mining
            </router-link>
            <router-link to="/explorer" class="flex items-center px-3 py-2 text-white hover:bg-blue-500/20 rounded-lg transition">
              🔍 Explorer
            </router-link>
            <router-link to="/transactions" class="flex items-center px-3 py-2 text-white hover:bg-blue-500/20 rounded-lg transition">
              💸 Transactions
            </router-link>
            <router-link to="/network" class="flex items-center px-3 py-2 text-white hover:bg-blue-500/20 rounded-lg transition">
              🌐 Network
            </router-link>
            <router-link to="/admin" class="flex items-center px-3 py-2 text-white hover:bg-blue-500/20 rounded-lg transition">
              🔐 Admin
            </router-link>
          </div>
          <div class="flex items-center">
            <span class="text-green-400 font-bold">⛓️ ChainGo</span>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style>
.router-link-active {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}
</style>
