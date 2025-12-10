import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Wallets from '../views/Wallets.vue'
import Mining from '../views/Mining.vue'
import BlockchainExplorer from '../views/BlockchainExplorer.vue'
import Transactions from '../views/Transactions.vue'
import Network from '../views/Network.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: Dashboard
        },
        {
            path: '/wallets',
            name: 'Wallets',
            component: Wallets
        },
        {
            path: '/mining',
            name: 'Mining',
            component: Mining
        },
        {
            path: '/explorer',
            name: 'Explorer',
            component: BlockchainExplorer
        },
        {
            path: '/transactions',
            name: 'Transactions',
            component: Transactions
        },
        {
            path: '/network',
            name: 'Network',
            component: Network
        }
    ]
})

export default router
