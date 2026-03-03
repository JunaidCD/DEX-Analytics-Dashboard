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
      }
    }
  },
  networks: {
    // Local development networks
    hardhat: {
      chainId: 31337
    },
    localhost: {
      chainId: 31337
    },
    // Paseo Testnet
    paseo: {
      url: "https://rpc.paseo.network",
      chainId: 4006,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
