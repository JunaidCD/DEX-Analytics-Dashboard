// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title DEXPair
/// @notice AMM Pair contract for token swapping
/// @dev Implements Uniswap V2-style AMM with 0.3% swap fee
contract DEXPair is ERC20, ReentrancyGuard {
    /// @notice Minimum liquidity locked forever to prevent division by zero
    uint256 public constant MINIMUM_LIQUIDITY = 10**3;
    
    /// @notice Selector for ERC20 transfer function
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));
    
    /// @notice Dead address for burning initial liquidity
    address private constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    /// @notice Factory contract address
    address public immutable factory;
    
    /// @notice Address of the first token in the pair (by sort order)
    address public token0;
    
    /// @notice Address of the second token in the pair (by sort order)
    address public token1;

    /// @notice Reserve of token0
    uint112 private reserve0;
    
    /// @notice Reserve of token1
    uint112 private reserve1;
    
    /// @notice Last block timestamp when reserves were updated
    uint32 private blockTimestampLast;

    /// @notice Cumulative price of token0
    uint256 public price0CumulativeLast;
    
    /// @notice Cumulative price of token1
    uint256 public price1CumulativeLast;

    /// @notice Reentrancy lock
    uint256 private unlocked = 1;

    /// @notice Emitted when liquidity is added to the pair
    /// @param sender Address that added liquidity
    /// @param amount0 Amount of token0 added
    /// @param amount1 Amount of token1 added
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);

    /// @notice Emitted when liquidity is removed from the pair
    /// @param sender Address that removed liquidity
    /// @param amount0 Amount of token0 removed
    /// @param amount1 Amount of token1 removed
    /// @param to Address that received the tokens
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);

    /// @notice Emitted when a swap occurs
    /// @param sender Address that initiated the swap
    /// @param amount0In Amount of token0 input
    /// @param amount1In Amount of token1 input
    /// @param amount0Out Amount of token0 output
    /// @param amount1Out Amount of token1 output
    /// @param to Address that received the output
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );

    /// @notice Emitted when reserves are synchronized
    /// @param reserve0 Current reserve of token0
    /// @param reserve1 Current reserve of token1
    event Sync(uint112 reserve0, uint112 reserve1);

    /// @notice Modifier to prevent reentrancy attacks
    modifier lock() {
        require(unlocked == 1, 'DEX: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    /// @notice Constructor sets factory and initializes ERC20
    constructor() ERC20("DEX LP Token", "DEXLP") {
        factory = msg.sender;
    }

    /// @notice Initializes the pair with token addresses
    /// @dev Called by factory during pair creation. Only factory can call.
    /// @param _token0 Address of the first token
    /// @param _token1 Address of the second token
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, 'DEX: FORBIDDEN');
        require(_token0 != address(0) && _token1 != address(0), 'DEX: ZERO_ADDRESS');
        token0 = _token0;
        token1 = _token1;
    }

    /// @notice Returns current reserves and last update timestamp
    /// @return _reserve0 Current reserve of token0
    /// @return _reserve1 Current reserve of token1
    /// @return _blockTimestampLast Last block timestamp when reserves were updated
    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    /// @notice Safely transfers tokens using low-level call
    /// @param token Token address
    /// @param to Recipient address
    /// @param value Amount to transfer
    function _safeTransfer(address token, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'DEX: TRANSFER_FAILED');
    }

    /// @notice Updates reserves and cumulative prices
    /// @param balance0 New balance of token0
    /// @param balance1 New balance of token1
    /// @param _reserve0 Previous reserve of token0
    /// @param _reserve1 Previous reserve of token1
    function _update(uint256 balance0, uint256 balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, 'DEX: OVERFLOW');
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast;
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            price0CumulativeLast += uint256(_reserve1) * timeElapsed;
            price1CumulativeLast += uint256(_reserve0) * timeElapsed;
        }
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        emit Sync(reserve0, reserve1);
    }

    /// @notice Mints LP tokens to add liquidity
    /// @dev First liquidity provider receives MINIMUM_LIQUIDITY tokens burned to DEAD address
    /// @param to Address to receive LP tokens
    /// @return liquidity Amount of LP tokens minted
    function mint(address to) external nonReentrant lock returns (uint256 liquidity) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - _reserve0;
        uint256 amount1 = balance1 - _reserve1;

        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(DEAD_ADDRESS, MINIMUM_LIQUIDITY);
        } else {
            liquidity = min(amount0 * _totalSupply / _reserve0, amount1 * _totalSupply / _reserve1);
        }
        require(liquidity > 0, 'DEX: INSUFFICIENT_LIQUIDITY_MINTED');
        _mint(to, liquidity);
        _update(balance0, balance1, _reserve0, _reserve1);
        emit Mint(msg.sender, amount0, amount1);
    }

    /// @notice Burns LP tokens to remove liquidity
    /// @param to Address to receive underlying tokens
    /// @return amount0 Amount of token0 received
    /// @return amount1 Amount of token1 received
    function burn(address to) external nonReentrant lock returns (uint256 amount0, uint256 amount1) {
        uint256 liquidity = balanceOf(address(this));
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        uint256 _totalSupply = totalSupply();

        amount0 = liquidity * _reserve0 / _totalSupply;
        amount1 = liquidity * _reserve1 / _totalSupply;
        require(amount0 > 0 && amount1 > 0, 'DEX: INSUFFICIENT_LIQUIDITY_BURNED');

        _burn(address(this), liquidity);
        _safeTransfer(token0, to, amount0);
        _safeTransfer(token1, to, amount1);

        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        _update(balance0, balance1, _reserve0, _reserve1);
        emit Burn(msg.sender, amount0, amount1, to);
    }

    /// @notice Swaps tokens using current reserves
    /// @dev Implements AMM swap logic with 0.3% fee
    /// @param amount0Out Amount of token0 to send out
    /// @param amount1Out Amount of token1 to send out
    /// @param to Address to receive swap output
    /// @param data Additional callback data (unused, for compatibility)
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external nonReentrant lock {
        require(amount0Out > 0 || amount1Out > 0, 'DEX: INSUFFICIENT_OUTPUT_AMOUNT');
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'DEX: INSUFFICIENT_LIQUIDITY');

        uint256 balance0;
        uint256 balance1;
        uint256 amount0In;
        uint256 amount1In;
        {
            require(to != token0 && to != token1, 'DEX: INVALID_TO');
            if (amount0Out > 0) _safeTransfer(token0, to, amount0Out);
            if (amount1Out > 0) _safeTransfer(token1, to, amount1Out);
            balance0 = IERC20(token0).balanceOf(address(this));
            balance1 = IERC20(token1).balanceOf(address(this));
            amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
            amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
            require(amount0In > 0 || amount1In > 0, 'DEX: INSUFFICIENT_INPUT_AMOUNT');
            {
                uint256 balance0Adjusted;
                uint256 balance1Adjusted;
                unchecked {
                    balance0Adjusted = balance0 * 1000 - amount0In * 3;
                    balance1Adjusted = balance1 * 1000 - amount1In * 3;
                    require(balance0Adjusted * balance1Adjusted >= uint256(_reserve0) * uint256(_reserve1) * 1000000, 'DEX: K');
                }
            }
        }
        _update(balance0, balance1, _reserve0, _reserve1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    /// @notice Calculates output amount for a given input using AMM formula
    /// @dev Applies 0.3% swap fee
    /// @param amountIn Input token amount
    /// @param reserveIn Input token reserve
    /// @param reserveOut Output token reserve
    /// @return amountOut Calculated output amount
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut) {
        require(amountIn > 0, 'DEX: INSUFFICIENT_INPUT_AMOUNT');
        require(reserveIn > 0 && reserveOut > 0, 'DEX: INSUFFICIENT_LIQUIDITY');
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    /// @notice Square root function using Babylonian method
    /// @param x Input value
    /// @return y Square root of x
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /// @notice Returns the minimum of two uint256 values
    /// @param x First value
    /// @param y Second value
    /// @return z Minimum value
    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }
}
