'use client';

import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Polkadot Hub Testnet (Paseo-based EVM)
const polkadotHubTestnet = {
  id: 420420417,
  name: 'Polkadot Hub Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'DOT',
    symbol: 'DOT',
  },
  rpcUrls: {
    default: {
      http: ['https://eth-rpc-testnet.polkadot.io'],
    },
    public: {
      http: ['https://eth-rpc-testnet.polkadot.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polkadot Hub Explorer',
      url: 'https://explorer.polkadot.network',
    },
  },
  testnet: true,
};

// Contract addresses for different chains
export const CHAIN_CONTRACTS = {
  [mainnet.id]: {
    // Placeholder for mainnet - replace with actual deployed addresses
    router: '0x0000000000000000000000000000000000000000',
    factory: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    MTK: '0x0000000000000000000000000000000000000000',
    pair: '0x0000000000000000000000000000000000000000',
  },
  [sepolia.id]: {
    // Placeholder for sepolia - replace with actual deployed addresses
    router: '0x0000000000000000000000000000000000000000',
    factory: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    MTK: '0x0000000000000000000000000000000000000000',
    pair: '0x0000000000000000000000000000000000000000',
  },
  [polkadotHubTestnet.id]: {
    router: '0x8C36A10638bc4F273405f8074707b524a449DBDd',
    factory: '0x6A4Bb106E8629323e93547f130430F17C8945ADd',
    USDC: '0x4Bf0AA916305a7A17eAB88c68B617e1DB63D59f4',
    MTK: '0xFE4a6c1db098fC438a9d60E097D184200dC45573',
    pair: '0x6354aC11FC070cE518F60d0adeE95E981568A293',
  },
  // Local hardhat node (default fallback)
  31337: {
    router: '0x0000000000000000000000000000000000000000',
    factory: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    MTK: '0x0000000000000000000000000000000000000000',
    pair: '0x0000000000000000000000000000000000000000',
  },
};

// Helper function to get contracts for current chain
export function getChainContracts(chainId) {
  return CHAIN_CONTRACTS[chainId] || CHAIN_CONTRACTS[31337];
}

export const config = createConfig({
  chains: [mainnet, sepolia, polkadotHubTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polkadotHubTestnet.id]: http('https://eth-rpc-testnet.polkadot.io', {
      retryCount: 5,
      retryDelay: 1000,
      timeout: 30000,
    }),
  },
});
