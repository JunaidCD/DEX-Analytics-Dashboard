'use client';

import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Paseo Testnet Chain Definition
const pasoero = {
  id: 10000,
  name: 'Pasoero',
  nativeCurrency: {
    decimals: 18,
    name: 'STEP',
    symbol: 'STEP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.paseo.xyz'],
    },
    public: {
      http: ['https://rpc.paseo.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Pasoero Explorer',
      url: 'https://explorer.paseo.xyz',
    },
  },
};

// Contract addresses on Pasoero Testnet - UPDATE THESE AFTER DEPLOYMENT
export const CONTRACTS = {
  router: '0x7f1b5413C48B5d0F6dA04eB0C9f2f0f9c8c8E8c8', // TODO: Replace with actual router address
  factory: '0x1234567890AbCdEf1234567890AbCdEf12345678', // TODO: Replace with actual factory address
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on many chains - replace with testnet address
  MTK: '0x9876543210FeDcBa9876543210FeDcBa98765432', // Mock Token - replace with testnet address
};

// Localhost hardhat (chainId: 31337)
const hardhatLocalhost = {
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
};

export const config = createConfig({
  chains: [mainnet, sepolia, pasoero, hardhatLocalhost],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [pasoero.id]: http(),
    [hardhatLocalhost.id]: http(),
  },
});
