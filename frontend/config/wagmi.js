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
  router: '0x15Ea12D7c9d2BB84770403FCd371657aE7F1A8a2',
  factory: '0x6aE1db2478C8eeE1B2F6B6D4AEea6EC5554099cF',
  USDC: '0x2df99b1EEa84B9f3f87e2c4356691E7Ec7da943D',
  MTK: '0x597515C09CbDbb8460E96370C4D13093BB517F61',
  pair: '0x17DDDEE86d0a7ee51C3CEf285FdC15fDa99290dd',
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
