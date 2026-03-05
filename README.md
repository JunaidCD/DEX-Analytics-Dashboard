# DEXplorer

DEX Analytics Dashboard with stablecoin on Polkadot Hub Testnet

## Contracts

### MockUSDC (Local Hardhat)
- **Address:** 0x5FbDB2315678afecb367f032d93F642f64180aa3
- **Symbol:** MUSDC
- **Decimals:** 6

### DEX Contracts (Deployed Locally)
- **MockToken:** 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
- **DEXFactory:** 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
- **DEXRouter:** 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
- **Pair (USDC/MTK):** 0x3A5A81d7321DCE6CB2c1912eD01c392D8dF86fd4

## Features

### DEXRouter Functions
- `addLiquidity()` - Add liquidity to DEX pairs with optimal amounts
- `removeLiquidity()` - Remove liquidity from DEX pairs
- `swapExactTokensForTokens()` - Swap tokens with deadline validation

### Events
- `LiquidityAdded` - Emitted when liquidity is added
- `LiquidityRemoved` - Emitted when liquidity is removed
- `Swap` - Emitted when tokens are swapped

## Deployment

### Local Hardhat
```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy-router.js
```

### Paseo Testnet
1. Copy `.env.example` to `.env`
2. Add your private key: `PRIVATE_KEY=your_key`
3. Run: `npx hardhat run scripts/deploy-stablecoin.js --network paseo`

## Network Configuration

- **Paseo Testnet RPC:** https://eth-rpc-testnet.polkadot.io
- **Chain ID:** 420420417

## Testing

Run all tests:
```bash
npx hardhat test
```

Run DEX Router tests:
```bash
npx hardhat test test/DEXRouter.test.js
```
