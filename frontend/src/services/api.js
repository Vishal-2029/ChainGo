import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

export const walletAPI = {
    create: () => api.post('/wallet/create'),
    getBalance: (address) => api.get(`/wallet/balance/${address}`)
}

export const transactionAPI = {
    create: (data) => api.post('/transaction/create', data),
    getPending: () => api.get('/transaction/pending'),
    getByHash: (hash) => api.get(`/transaction/${hash}`)
}

export const blockchainAPI = {
    getChain: () => api.get('/chain'),
    getBlockByIndex: (index) => api.get(`/chain/${index}`),
    getLatestBlock: () => api.get('/block/latest'),
    validate: () => api.get('/validate'),
    getStats: () => api.get('/stats')
}

export const miningAPI = {
    mine: (minerAddress) => api.post('/mine', { minerAddress })
}

export const networkAPI = {
    addPeer: (address) => api.post('/peer/add', { address }),
    listPeers: () => api.get('/peer/list'),
    sync: () => api.get('/sync')
}

export const nodeAPI = {
    getInfo: () => api.get('/info')
}

export default api
