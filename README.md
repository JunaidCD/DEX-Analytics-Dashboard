# DEXplorer

> A full-stack decentralized exchange (DEX) analytics dashboard built on Polkadot Hub Testnet, featuring real-time token swaps, liquidity management, and on-chain trade analytics.

## Project Description

**DEXplorer** is a comprehensive Web3 decentralized exchange platform that enables users to trade ERC-20 tokens, provide liquidity, and analyze on-chain trading activity — all through a sleek, modern dashboard interface. Built on the Polkadot Hub Testnet (Paseo-based EVM), it combines a custom AMM (Automated Market Maker) protocol with a feature-rich frontend to deliver a seamless DeFi experience.

### Key Features

- **Token Swapping** — Swap between ERC-20 tokens (USDC ↔ MTK) with real-time price quoting, slippage protection, and deadline-based transaction validation via the DEXRouter contract.
- **Liquidity Provision** — Add and remove liquidity to trading pairs, earning fees from trades proportional to your pool share.
- **Analytics Dashboard** — View live trade history, pool reserves, token prices, Total Value Locked (TVL), and impermanent loss calculations through an interactive data dashboard powered by charts and on-chain event indexing.
- **Wallet Integration** — Connect via MetaMask (or any injected wallet) with automatic chain detection and network switching for Polkadot Hub Testnet.
- **Responsive & Animated UI** — A premium, dark-themed interface with smooth micro-animations and glassmorphism design elements.

---

## Technical Description

### Architecture

DEXplorer follows a **monorepo** structure with two main modules:

| Layer | Directory | Description |
|-------|-----------|-------------|
| **Frontend** | `frontend/` | Next.js web application serving the UI, wallet connectivity, and on-chain data queries |
| **Backend / Smart Contracts** | `backend/` | Solidity smart contracts (AMM core) with Hardhat for compilation, testing, and deployment |

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router for server/client rendering and file-based routing |
| **React** | 19.2.3 | UI component library with the latest React Compiler optimizations |
| **wagmi** | 3.5.0 | React hooks for Ethereum — wallet connection, contract reads/writes, chain management |
| **viem** | 2.47.0 | Low-level TypeScript interface for EVM interaction (ABI encoding, RPC calls, event parsing) |
| **Recharts** | 3.7.0 | Composable charting library for rendering trade history, TVL, and price analytics |
| **Framer Motion** | 12.36.0 | Animation library for smooth page transitions and micro-interactions |
| **TanStack React Query** | 5.90.21 | Asynchronous state management for caching and refetching on-chain data |

### Smart Contract Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.24 | Smart contract programming language (with IR-based optimizer enabled) |
| **Hardhat** | 2.28.6 | Development environment for compiling, testing, and deploying contracts |
| **OpenZeppelin Contracts** | 5.6.1 | Battle-tested library for ERC-20 token standards and security utilities |

### Core Smart Contracts

| Contract | Description |
|----------|-------------|
| **DEXFactory** | Factory contract that creates and registers new trading pair pools |
| **DEXPair** | Core AMM pair contract implementing the constant-product formula (`x * y = k`), handling reserves, minting/burning LP tokens, and emitting swap events |
| **DEXRouter** | High-level router providing user-facing functions — `addLiquidity()`, `removeLiquidity()`, `swapExactTokensForTokens()` — with built-in slippage and deadline checks |
| **MockUSDC / MockToken** | Test ERC-20 tokens (USDC and MTK) deployed for development and testnet usage |

### Blockchain Network

| Property | Value |
|----------|-------|
| **Network** | Polkadot Hub Testnet (Paseo-based EVM) |
| **RPC URL** | `https://eth-rpc-testnet.polkadot.io` |
| **Chain ID** | `420420417` |
| **Native Token** | DOT |

### Utility Modules

The frontend includes dedicated utility modules for on-chain data processing:

- **`calculatePrice.ts`** — Derives token prices from pool reserve ratios
- **`calculateTVL.ts`** — Computes Total Value Locked across liquidity pools
- **`calculateImpermanentLoss.ts`** — Estimates impermanent loss for liquidity providers based on price divergence
- **`formatToken.ts`** — Formats raw token amounts (wei → human-readable) with decimal precision

---

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

### Run Tests & Coverage

We maintain a high standard of code quality and security for our smart contracts. Comprehensive test suites are written using Chai and Mocha, and target over 80% test coverage.

```bash
# Run unit tests
npx hardhat test

# Run test coverage report
npx hardhat coverage
```

**Testing Highlights & Edge Cases Covered:**
- **DEXRouter**: Validated multi-hop swaps, slippage prevention checks (`INSUFFICIENT_OUTPUT_AMOUNT`), expired transaction deadlines, optimal liquidity provisioning math, and handling of invalid swap paths.
- **DEXPair**: Fixed AMM invariant arithmetic (`K` value checking) using precise post-transfer balances to prevent underflow during extreme token balance shifts. Tested initialization constraints.
- **DEXFactory**: Ensured identical or zero-address token pairs cannot be created and prevented redundant pair pool re-creation.
- **Coverage**: Achieved achieving over **95%** overall smart contract line coverage (`solidity-coverage`).

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
