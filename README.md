# DEXplorer

DEX Analytics Dashboard with stablecoin on Polkadot Hub Testnet

## Contracts

### MockUSDC (Local Hardhat)
- **Address:** 0x5FbDB2315678afecb367f032d93F642f64180aa3
- **Symbol:** MUSDC
- **Decimals:** 6

### Deployment

To deploy to Paseo testnet:
1. Copy `.env.example` to `.env`
2. Add your private key: `PRIVATE_KEY=your_key`
3. Run: `npx hardhat run scripts/deploy-stablecoin.js --network paseo`

## Network Configuration

- **Paseo Testnet RPC:** https://eth-rpc-testnet.polkadot.io
- **Chain ID:** 420420417
