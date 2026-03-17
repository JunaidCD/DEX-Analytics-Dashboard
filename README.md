# DEXplorer

> A full-stack decentralized exchange (DEX) analytics dashboard built on Polkadot Hub Testnet, featuring real-time token swaps, liquidity management, and on-chain trade analytics.

## Project Description

**DEXplorer** is a comprehensive Web3 decentralized exchange platform that enables users to trade ERC-20 tokens, provide liquidity, and analyze on-chain trading activity — all through a sleek, modern dashboard interface. Built on the Polkadot Hub Testnet (Paseo-based EVM), it combines a custom AMM (Automated Market Maker) protocol with a feature-rich frontend to deliver a seamless DeFi experience.

### Key Features

- **Token Swapping** — Swap between ERC-20 tokens (aUSDC ↔ MTK) with real-time price quoting, slippage protection, and deadline-based transaction validation via the DEXRouter contract.
- **AI-Powered Price Predictions** — A lightweight, off-chain machine learning model (`TensorFlow.js`) processes recent swap history via viem to forecast short-term token prices using linear regression directly on the client.
- **Cross-Chain & MEV Visibility** — Simulates advanced DeFi mechanisms, featuring a mock Acala XCM bridged stablecoin (`aUSDC`) and an interactive MEV Sandwich Attack simulator on the swap interface.
- **Liquidity Provision** — Add and remove liquidity to trading pairs, earning fees from trades proportional to your pool share.
- **Analytics Dashboard** — View live trade history, pool reserves, token prices, TVL, and impermanent loss calculations through an interactive data dashboard powered by charts and on-chain event indexing.
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
| **TensorFlow.js** | 4.22.0 | Off-chain client-side machine learning library generating real-time AI price predictions |
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
- **MockUSDC:** `0xb16961118548B26a697D7a6570706FFeFFf471B2`
  - [View on Block Explorer](https://polkadot-hub-testnet.subscan.io/account/0xb16961118548B26a697D7a6570706FFeFFf471B2)
- **MockToken (MTK):** `0xddA652528ce73783b3D2084793813c97eD324c4C`
  - [View on Block Explorer](https://polkadot-hub-testnet.subscan.io/account/0xddA652528ce73783b3D2084793813c97eD324c4C)

### DEX Contracts
- **DEXFactory:** `0xD90Fe2EF9c2e356257b632893bf9cae6275a4a3c`
  - [View on Block Explorer](https://polkadot-hub-testnet.subscan.io/account/0xD90Fe2EF9c2e356257b632893bf9cae6275a4a3c)
- **DEXPair (USDC/MTK):** `0x10975d291B7d6b204edc2bcD3EEc25c7d67D6F60`
  - [View on Block Explorer](https://polkadot-hub-testnet.subscan.io/account/0x10975d291B7d6b204edc2bcD3EEc25c7d67D6F60)

### User Wallet
- **Address:** `0x6e149A3e52125e40535EbD22be90D8E699D46C5E`
  - [View on Block Explorer](https://polkadot-hub-testnet.subscan.io/account/0x6e149A3e52125e40535EbD22be90D8E699D46C5E)
- **Balances:** 10000 USDC, 10000 MTK (initial liquidity added)

### Block Explorer
- **Polkadot Hub Testnet Explorer:** https://polkadot-hub-testnet.subscan.io/
- **Search by:** Contract addresses, transaction hashes, or wallet addresses

## How to Run Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet extension

### 1. Backend Setup
```bash
cd backend
npm install
npx hardhat compile
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Start the Application
- Frontend runs on: http://localhost:3000
- Backend contracts are deployed on Polkadot Hub Testnet

### 4. Connect Wallet
1. Click "Connect Wallet" in the header
2. Approve MetaMask connection
3. Ensure you're on Polkadot Hub Testnet

---

## Polkadot Setup on MetaMask

### Add Polkadot Hub Testnet to MetaMask

**Method 1: Automatic Addition**
1. Visit https://chainlist.org/
2. Search for "Polkadot Hub Testnet"
3. Click "Add to Metamask"

**Method 2: Manual Addition**
1. Open MetaMask
2. Click on network dropdown → "Add Network"
3. Fill in the details:
   - **Network Name:** Polkadot Hub Testnet
   - **New RPC URL:** https://eth-rpc-testnet.polkadot.io
   - **Chain ID:** 420420417
   - **Currency Symbol:** DOT
   - **Block Explorer URL:** https://polkadot-hub-testnet.subscan.io/

### Get Testnet DOT Tokens

**Main Faucet:** https://faucet.polkadot.io/

**Alternative Methods:**
1. **Discord:** Join the Polkadot Discord and use the #testnet-faucet channel
2. **Polkadot Hub Portal:** https://polkadot.js.org/apps/

### MetaMask Configuration Summary
- **Network Name:** Polkadot Hub Testnet
- **RPC URL:** https://eth-rpc-testnet.polkadot.io
- **Chain ID:** 420420417
- **Symbol:** DOT
- **Block Explorer:** https://polkadot-hub-testnet.subscan.io/

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

### Security Audit & Optimization

We use `slither-analyzer` to perform static code analysis and identify potential vulnerabilities. The following security and gas optimizations have been applied:
- **SafeERC20 Migration**: Replaced standard `transfer`/`transferFrom` calls with OpenZeppelin's `SafeERC20` wrapper in `DEXRouter` to strictly fully revert on token transfer failures (unhandled `false` returns).
- **Access & Zero-Address Checks**: Enforced `require(address != address(0))` validations upon contract deployment and initialization to prevent locking funds or misconfiguring factory routing.
- **Gas Optimization**: Marked static storage variables (e.g., `factory`, `_decimals`) as `immutable` to heavily optimize read costs.
- **NatSpec Documentation**: Fully compliant Ethereum Natural Specification Format (`@notice`, `@dev`, `@param`, `@return`) implemented natively across all mock tokens and core infrastructure contracts.

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
