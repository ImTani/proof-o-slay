import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { suiClient } from './lib/suiClient'
import '@mysten/dapp-kit/dist/index.css'
import './index.css'
import App from './App.tsx'

// Create a React Query client for managing async state
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={{ testnet: suiClient }} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>,
)
