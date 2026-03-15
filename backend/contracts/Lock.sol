// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title DEX Token
/// @notice A simple ERC20 token for the DEX platform
/// @dev Inherits from OpenZeppelin's ERC20
contract DEXToken is ERC20 {
    /// @notice Mints initial supply to the deployer
    /// @param initialSupply Amount of tokens to mint initially
    constructor(uint256 initialSupply) ERC20("DEX Token", "DEX") {
        _mint(msg.sender, initialSupply);
    }
}
