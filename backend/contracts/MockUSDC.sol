// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice A mock stablecoin for testing purposes with 6 decimals
/// @dev Mints standard ERC20 with faucet functionality
contract MockUSDC is ERC20, Ownable {
    uint8 private immutable _decimals;
    mapping(address => bool) public faucets;

    /// @notice Sets up the mock USDC token
    /// @param initialOwner Given owner for administration
    constructor(address initialOwner) ERC20("Mock USD Coin", "MUSDC") Ownable(initialOwner) {
        _decimals = 6;
    }

    /// @notice Retrieves the configurable decimals
    /// @return The precision level for the token contract
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Mints any amount of tokens manually
    /// @param to Address to mint tokens
    /// @param amount Quantity of tokens to mint
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Faucet function - anyone can get free tokens
    /// @dev Used exclusively for testing on testnets
    /// @param to Address receiving the faucet tokens
    function faucet(address to) external {
        _mint(to, 1000 * 10 ** 6); 
    }
}
