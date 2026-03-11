// Contract addresses - Update these after deploying to testnet
// For local testing, you can use hardhat localhost (chainId: 31337)

export const CONTRACTS = {
  // Polkadot Hub Testnet (chainId: 420420417)
  polkadotHubTestnet: {
    router: '0x15Ea12D7c9d2BB84770403FCd371657aE7F1A8a2',
    factory: '0x6aE1db2478C8eeE1B2F6B6D4AEea6EC5554099cF',
    USDC: '0x2df99b1EEa84B9f3f87e2c4356691E7Ec7da943D',
    MTK: '0x597515C09CbDbb8460E96370C4D13093BB517F61',
    pair: '0x17DDDEE86d0a7ee51C3CEf285FdC15fDa99290dd',
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
    address: '0x2df99b1EEa84B9f3f87e2c4356691E7Ec7da943D',
  },
  {
    symbol: 'MTK',
    name: 'Mock Token',
    decimals: 18,
    address: '0x597515C09CbDbb8460E96370C4D13093BB517F61',
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
