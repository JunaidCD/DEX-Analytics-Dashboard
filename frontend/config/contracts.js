// Contract addresses - Update these after deploying to testnet
// For local testing, you can use hardhat localhost (chainId: 31337)

export const CONTRACTS = {
  // Polkadot Hub Testnet (chainId: 420420417)
  polkadotHubTestnet: {
    router: '0x8C36A10638bc4F273405f8074707b524a449DBDd',
    factory: '0xF88990fADBb15D25296d9cf880FDB14b23cD30e9',
    USDC: '0x220327D6A516eD8bC76f63037c3Df420872fAE4e',
    MTK: '0xCC8BF21E1C4a63BbE26E2F39724bEaEA72BfeA15',
    pair: '0xD418d4243Ee8c432Da2CDe33BC9D19B20E40212f',
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
    address: '0x220327D6A516eD8bC76f63037c3Df420872fAE4e',
  },
  {
    symbol: 'MTK',
    name: 'Mock Token',
    decimals: 18,
    address: '0xCC8BF21E1C4a63BbE26E2F39724bEaEA72BfeA15',
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
