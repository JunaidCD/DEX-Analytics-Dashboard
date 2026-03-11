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
      http: ['https://eth-rpc-testnet.polkadot.io/'],
    },
    public: {
      http: ['https://eth-rpc-testnet.polkadot.io/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polkadot Hub Explorer',
      url: 'https://explorer.polkadot.network',
    },
  },
};

// Contract addresses on Polkadot Hub Testnet
// Deployed via deploy-router.js
export const CONTRACTS = {
  router: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  factory: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  USDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  MTK: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  pair: '0x5c513c7e4C1709b203Da1F3a6259a1afeB840e0B',
};

// Local Hardhat contract addresses (chainId: 31337)
export const CONTRACTS_LOCAL = {
  router: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  factory: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  USDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  MTK: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  pair: '0x5c513c7e4C1709b203Da1F3a6259a1afeB840e0B',
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
  chains: [mainnet, sepolia, pasoero, hardhatLocalhost, polkadotHubTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http('https://eth.merkle.io'),
    [sepolia.id]: http('https://eth.merkle.io'),
    [pasoero.id]: http('https://rpc.paseo.xyz'),
    [hardhatLocalhost.id]: http('http://127.0.0.1:8545'),
    [polkadotHubTestnet.id]: http('https://eth-rpc-testnet.polkadot.io'),
  },
});
