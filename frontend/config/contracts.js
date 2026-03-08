// Contract addresses - Update these after deploying to testnet
// For local testing, you can use hardhat localhost (chainId: 31337)

export const CONTRACTS = {
  // Pasoero Testnet (chainId: 10000 or 420420417)
  pasoero: {
    router: '0x0000000000000000000000000000000000000001', // TODO: Replace with deployed router address
    factory: '0x0000000000000000000000000000000000000002', // TODO: Replace with deployed factory address
    USDC: '0x0000000000000000000000000000000000000003', // TODO: Replace with deployed USDC address
    MTK: '0x0000000000000000000000000000000000000004', // TODO: Replace with deployed token address
  },
  // Hardhat Localhost (chainId: 31337)
  localhost: {
    router: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', // Update after running deploy-router.js on localhost
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
    address: CONTRACTS.pasoero.USDC,
  },
  {
    symbol: 'MTK',
    name: 'Mock Token',
    decimals: 18,
    address: CONTRACTS.pasoero.MTK,
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
