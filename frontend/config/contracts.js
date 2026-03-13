// Contract addresses - Update these after deploying to testnet

export const CONTRACTS = {
   // Polkadot Hub Testnet (chainId: 420420417)
   polkadotHubTestnet: {
     router: '0x8C36A10638bc4F273405f8074707b524a449DBDd',
     factory: '0x6A4Bb106E8629323e93547f130430F17C8945ADd',
     USDC: '0x4Bf0AA916305a7A17eAB88c68B617e1DB63D59f4',
     MTK: '0xFE4a6c1db098fC438a9d60E097D184200dC45573',
     pair: '0x6354aC11FC070cE518F60d0adeE95E981568A293',
   },
  // Hardhat Localhost (chainId: 31337)
  localhost: {
    router: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    factory: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    USDC: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    MTK: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  },
  // Sepolia Testnet
  sepolia: {
    router: '0x0000000000000000000000000000000000000000',
    factory: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    MTK: '0x0000000000000000000000000000000000000000',
  },
};

// Token decimals
export const TOKEN_DECIMALS = {
  USDC: 6,
  MTK: 18,
  ETH: 18,
};

// Token symbols and names
export const TOKENS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x4Bf0AA916305a7A17eAB88c68B617e1DB63D59f4',
  },
  {
    symbol: 'MTK',
    name: 'Mock Token',
    decimals: 18,
    address: '0xFE4a6c1db098fC438a9d60E097D184200dC45573',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000', // Native ETH
  },
];

// Default slippage tolerance (0.5%)
export const DEFAULT_SLIPPAGE = 0.5;
