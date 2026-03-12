'use client';

import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

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
};

// Contract addresses on Polkadot Hub Testnet (chainId: 420420417)
export const CONTRACTS = {
  router: '0x8C36A10638bc4F273405f8074707b524a449DBDd',
  factory: '0xF88990fADBb15D25296d9cf880FDB14b23cD30e9',
  USDC: '0x220327D6A516eD8bC76f63037c3Df420872fAE4e',
  MTK: '0xCC8BF21E1C4a63BbE26E2F39724bEaEA72BfeA15',
  pair: '0xD418d4243Ee8c432Da2CDe33BC9D19B20E40212f',
};

export const CONTRACTS_LOCAL = {
  router: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  factory: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  USDC: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  MTK: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  pair: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
};

export const config = createConfig({
  chains: [mainnet, sepolia, polkadotHubTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polkadotHubTestnet.id]: http(),
  },
});
