// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DEXPair.sol";

/// @title DEXFactory
/// @notice Factory contract for creating DEX trading pairs
/// @dev Uses CREATE2 for deterministic pair addresses
contract DEXFactory is Ownable {
    /// @notice Emitted when a new pair is created
    /// @param token0 Address of the first token in the pair
    /// @param token1 Address of the second token in the pair
    /// @param pair Address of the newly created pair
    /// @param pairId Index of the pair in the allPairs array
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairId);

    /// @notice Maps token pair to pair address
    /// @dev Returns address(0) if pair doesn't exist
    mapping(address => mapping(address => address)) public getPair;

    /// @notice Array of all created pair addresses
    address[] public allPairs;

    /// @notice Initializes the factory with an owner
    /// @param initialOwner Address that will own the factory
    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Creates a new trading pair for two tokens
    /// @dev Uses CREATE2 to deploy pair at deterministic address
    /// @param tokenA Address of first token
    /// @param tokenB Address of second token
    /// @return pair Address of newly created pair
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "DEX: IDENTICAL_ADDRESSES");
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "DEX: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "DEX: PAIR_EXISTS");

        bytes memory bytecode = type(DEXPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        DEXPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    /// @notice Returns the total number of pairs created
    /// @return Number of pairs in allPairs array
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
}
