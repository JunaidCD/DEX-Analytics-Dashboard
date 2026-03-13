// Contract addresses - Update these after deploying to testnet

export const CONTRACTS = {
   // Polkadot Hub Testnet (chainId: 420420417)
   polkadotHubTestnet: {
     router: '0x8C36A10638bc4F273405f8074707b524a449DBDd',
     factory: '0x3485c12bA3622fb9E2cD667634Af5330A3028f5D',
     USDC: '0x052b917D09Bc3fe007c2a086a1196607d4449F94',
     MTK: '0x06f9e5FE81B482aceDDF13A7B63caf1a645416F0',
     pair: '0xF41C9A139D3df9F0BFF67e8782F5464A8EA928E5',
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
    address: '0x052b917D09Bc3fe007c2a086a1196607d4449F94',
  },
  {
    symbol: 'MTK',
    name: 'Mock Token',
    decimals: 18,
    address: '0x06f9e5FE81B482aceDDF13A7B63caf1a645416F0',
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
