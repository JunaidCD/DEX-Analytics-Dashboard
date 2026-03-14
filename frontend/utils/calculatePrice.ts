import { formatTokenValue, TOKEN_DECIMALS } from './formatToken';

/**
 * Calculate current price from reserves
 * Returns price in USDC per MTK
 */
export function calculateCurrentPrice(
  reserves: [bigint, bigint],
  token0: string,
  usdcAddress: string,
  mtkAddress: string
): number {
  if (!reserves || !token0) return 0;
  
  const isUSDC0 = token0.toLowerCase() === usdcAddress.toLowerCase();
  const reserveUSDC = isUSDC0 ? reserves[0] : reserves[1];
  const reserveMTK = isUSDC0 ? reserves[1] : reserves[0];
  
  // Convert reserves to human-readable numbers
  const usdcAmount = formatTokenValue(reserveUSDC, TOKEN_DECIMALS.USDC);
  const mtkAmount = formatTokenValue(reserveMTK, TOKEN_DECIMALS.MTK);
  
  // Calculate price: USDC per MTK
  if (mtkAmount === 0) return 0;
  return usdcAmount / mtkAmount;
}

/**
 * Calculate price from swap event
 */
export function calculatePriceFromSwap(
  amount0In: bigint,
  amount0Out: bigint,
  amount1In: bigint,
  amount1Out: bigint,
  token0: string,
  usdcAddress: string,
  mtkAddress: string
): number {
  const isUSDC0 = token0.toLowerCase() === usdcAddress.toLowerCase();
  
  let usdcAmount: number;
  let mtkAmount: number;
  
  if (isUSDC0) {
    // token0 is USDC, token1 is MTK
    usdcAmount = formatTokenValue(amount0In + amount0Out, TOKEN_DECIMALS.USDC);
    mtkAmount = formatTokenValue(amount1In + amount1Out, TOKEN_DECIMALS.MTK);
  } else {
    // token0 is MTK, token1 is USDC
    usdcAmount = formatTokenValue(amount1In + amount1Out, TOKEN_DECIMALS.USDC);
    mtkAmount = formatTokenValue(amount0In + amount0Out, TOKEN_DECIMALS.MTK);
  }
  
  if (usdcAmount === 0 || mtkAmount === 0) return 0;
  return usdcAmount / mtkAmount;
}
