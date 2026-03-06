// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DEXFactory.sol";
import "./DEXPair.sol";

contract DEXRouter is ReentrancyGuard {
    address public factory;

    // Events
    event LiquidityAdded(address indexed pair, address indexed user, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(address indexed pair, address indexed user, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swap(address indexed sender, address indexed pair, uint256 amountIn, uint256 amountOut, address indexed to);

    constructor(address _factory) {
        factory = _factory;
    }

    // Sort tokens by address
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "DEXRouter: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "DEXRouter: ZERO_ADDRESS");
    }

    // Quote function for calculating optimal token amounts
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) internal pure returns (uint256 amountB) {
        require(amountA > 0, "DEXRouter: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "DEXRouter: INSUFFICIENT_LIQUIDITY");
        amountB = (amountA * reserveB) / reserveA;
    }

    // Get amount out calculation
    function _getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256) {
        require(amountIn > 0, "DEXRouter: INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "DEXRouter: INSUFFICIENT_LIQUIDITY");
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        return numerator / denominator;
    }

    // Internal get amounts out
    function _getAmountsOut(uint256 amountIn, address[] memory path) internal view returns (uint256[] memory amounts) {
        require(path.length >= 2, "DEXRouter: INVALID_PATH");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint i = 0; i < path.length - 1; i++) {
            address pair = DEXFactory(factory).getPair(path[i], path[i + 1]);
            (uint112 reserve0, uint112 reserve1,) = DEXPair(pair).getReserves();
            
            // Get correct reserves based on token order in pair
            address token0 = DEXPair(pair).token0();
            uint256 reserveIn = path[i] == token0 ? reserve0 : reserve1;
            uint256 reserveOut = path[i] == token0 ? reserve1 : reserve0;
            
            amounts[i + 1] = _getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    // Add liquidity - allows adding with different token amounts
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(deadline >= block.timestamp, "DEXRouter: EXPIRED");

        address pair = DEXFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "DEXRouter: PAIR_NOT_EXISTS");

        (uint112 reserveA, uint112 reserveB,) = DEXPair(pair).getReserves();
        
        if (reserveA == 0 && reserveB == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            uint256 amountBOptimal = quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "DEXRouter: INSUFFICIENT_B_AMOUNT");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = quote(amountBDesired, reserveB, reserveA);
                require(amountAOptimal >= amountAMin, "DEXRouter: INSUFFICIENT_A_AMOUNT");
                require(amountAOptimal <= amountADesired, "DEXRouter: EXCESSIVE_A_AMOUNT");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }

        // Transfer tokens to pair
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);

        // Mint liquidity tokens
        liquidity = DEXPair(pair).mint(to);
        
        emit LiquidityAdded(pair, to, amountA, amountB, liquidity);
    }

    // Remove liquidity
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(deadline >= block.timestamp, "DEXRouter: EXPIRED");

        address pair = DEXFactory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "DEXRouter: PAIR_NOT_EXISTS");

        // Transfer liquidity to pair
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        
        // Burn and get amounts
        (uint256 amount0, uint256 amount1) = DEXPair(pair).burn(to);
        
        // Sort tokens to match pair's token0/token1 order
        address token0;
        address token1;
        if (tokenA < tokenB) {
            token0 = tokenA;
            token1 = tokenB;
        } else {
            token0 = tokenB;
            token1 = tokenA;
        }
        
        if (tokenA == token0) {
            amountA = amount0;
            amountB = amount1;
        } else {
            amountA = amount1;
            amountB = amount0;
        }
        
        require(amountA >= amountAMin, "DEXRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "DEXRouter: INSUFFICIENT_B_AMOUNT");
        
        emit LiquidityRemoved(pair, to, amountA, amountB, liquidity);
    }

    // Swap exact tokens for tokens
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external nonReentrant returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "DEXRouter: EXPIRED");
        require(path.length >= 2, "DEXRouter: INVALID_PATH");

        amounts = _getAmountsOut(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT");

        // Transfer input tokens from user to pair
        IERC20(path[0]).transferFrom(msg.sender, DEXFactory(factory).getPair(path[0], path[1]), amounts[0]);

        // Do the swap - router swaps on behalf of user
        // The pair will calculate actual amountIn from balance - reserve
        _swap(amounts, path, to);
        
        emit Swap(msg.sender, DEXFactory(factory).getPair(path[0], path[1]), amountIn, amounts[amounts.length - 1], to);
    }

    // Internal swap function - swaps through each pair
    function _swap(uint256[] memory amounts, address[] memory path, address to) internal {
        for (uint i = 0; i < path.length - 1; i++) {
            address input = path[i];
            address output = path[i + 1];
            address pair = DEXFactory(factory).getPair(input, output);
            
            // Get token0 from pair
            address token0 = DEXPair(pair).token0();
            
            // Determine amounts out based on token order in pair
            uint256 amountOut = amounts[i + 1];
            uint256 amount0Out = input == token0 ? uint256(0) : amountOut;
            uint256 amount1Out = input == token0 ? amountOut : uint256(0);
            
            // For single hop, send directly to user; for multi-hop, send to next pair
            address nextTo = (i + 1 < path.length - 1) 
                ? DEXFactory(factory).getPair(path[i + 1], path[i + 2]) 
                : to;
            
            DEXPair(pair).swap(amount0Out, amount1Out, nextTo, "");
        }
    }

    // Get amounts out for a given amount in (external view)
    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts) {
        return _getAmountsOut(amountIn, path);
    }
}
