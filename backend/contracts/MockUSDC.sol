// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals;
    mapping(address => bool) public faucets;

    constructor(address initialOwner) ERC20("Mock USD Coin", "MUSDC") Ownable(initialOwner) {
        _decimals = 6;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Faucet function - anyone can get free tokens
    function faucet(address to) external {
        _mint(to, 1000000000); // Mint 1000 USDC (6 decimals)
    }
}
