# DEXplorer

DEX Analytics Dashboard with stablecoin on Polkadot Hub Testnet

## Deployed Contracts (Polkadot Hub Testnet)

### Token Addresses
- **USDC:** `0xc118ce9D103862a3eb89386EC925e584A3FA63bA`
- **MTK:** `0x55CFF287c2317F1bb66011ac00D4A25aEb567962`

### DEX Contracts
- **DEXFactory:** `0x6aE1db2478C8eeE1B2F6B6D4AEea6EC5554099cF`
- **DEXRouter:** `0x15Ea12D7c9d2BB84770403FCd371657aE7F1A8a2`
- **Pair (USDC/MTK):** `0x3d7F379B743a8c18A4Be4edC92F80b8D5C8fF9fB`

### User Wallet
- **Address:** `0x6e149A3e52125e40535EbD22be90D8E699D46C5E`
- **Balances:** 1000 USDC, 1000 MTK

## Getting Testnet DOT

To perform transactions on Polkadot Hub Testnet, you need testnet DOT tokens:

1. **Polkadot Faucet:** Visit https://faucet.polkadot.io/ and follow instructions
2. **Discord:** Join the Polkadot Discord and use the #testnet-faucet channel
3. **Polkadot Hub Portal:** https://polkadot.js.org/apps/

Make sure to switch MetaMask to:
- **Network Name:** Polkadot Hub Testnet
- **RPC URL:** https://eth-rpc-testnet.polkadot.io
- **Chain ID:** 420420417
- **Symbol:** DOT

## Local Development (Hardhat)

### Deploy Contracts Locally
```bash
cd backend
npm install
npx hardhat compile
npx hardhat run scripts/deploy-router.js
```

### Run Tests
```bash
npx hardhat test
```

## Frontend

### Start Development Server
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Connect Wallet
1. Click "Connect Wallet" in the header
2. Approve MetaMask connection
3. Ensure you're on Polkadot Hub Testnet (Chain ID: 420420417)

### Swap Tokens
1. Go to /swap page
2. Select USDC as "From" and MTK as "To" (or vice versa)
3. Enter amount and click Swap
4. Approve token allowance if prompted
5. Confirm the transaction in MetaMask

## Features

### DEXRouter Functions
- `addLiquidity()` - Add liquidity to DEX pairs with optimal amounts
- `removeLiquidity()` - Remove liquidity from DEX pairs
- `swapExactTokensForTokens()` - Swap tokens with deadline validation

### Events
- `LiquidityAdded` - Emitted when liquidity is added
- `LiquidityRemoved` - Emitted when liquidity is removed
- `Swap` - Emitted when tokens are swapped
