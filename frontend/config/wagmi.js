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
    router: '0x8C36A10638bc4F273405f8074707b524a449DBDd', // NOTE: Update if new router deployed
    factory: '0x4BbE1aca2fDA0Ac5DF8C8A0590e4Aca94d3BFA7d',
    USDC: '0xc27df241cce876D6063674e62f01B34E37d996FB',
    MTK: '0xeb854514bfBee690c58dE5fC571f41b5CCc4EeA9',
    pair: '0x9315B0F43916Ec66A316013eDb8B64C4275889BF',
  },
  // Local hardhat node (default fallback)
  31337: {
    router: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    factory: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    USDC: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    MTK: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    pair: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
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
