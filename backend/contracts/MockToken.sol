// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockToken
/// @notice A mock ERC-20 token for testing routing and liquidity pools
/// @dev Mints standard ERC20 with faucet functionality and 18 standard decimals
contract MockToken is ERC20, Ownable {
    /// @notice Deployer mints standard initial supply
    /// @param initialOwner Given owner for administration
    constructor(address initialOwner) ERC20("Mock Token", "MTK") Ownable(initialOwner) {
        _mint(initialOwner, 1000000 * 10 ** 18);
    }

    /// @notice Mints explicitly for admin tasks
    /// @param to Address to mint tokens
    /// @param amount Quantity of tokens to mint
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Faucet function - anyone can get free tokens
    /// @dev Used exclusively for testing on testnets
    /// @param to Address receiving the faucet tokens
    function faucet(address to) external {
        _mint(to, 1000 * 10 ** 18); 
    }
}
