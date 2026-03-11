require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    // Local development networks
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    },
    // Paseo Testnet
    paseo: {
      url: "https://eth-rpc-testnet.polkadot.io",
      chainId: 420420417,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    // Polkadot Hub Testnet (Paseo-based EVM)
    polkadotHubTestnet: {
      url: "https://eth-rpc-testnet.polkadot.io/",
      chainId: 420420417,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
