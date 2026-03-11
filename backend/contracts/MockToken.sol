// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Mock Token", "MTK") Ownable(initialOwner) {
        _mint(initialOwner, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Faucet function - anyone can get free tokens
    function faucet(address to) external {
        _mint(to, 1000000000000000000000); // Mint 1000 MTK (18 decimals)
    }
}
