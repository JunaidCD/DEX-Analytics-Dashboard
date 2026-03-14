import { formatTokenValue, TOKEN_DECIMALS } from './formatToken';
import { calculateCurrentPrice } from './calculatePrice';

/**
 * Calculate Total Value Locked (TVL) in USD
 */
export function calculateTVL(
  reserves: [bigint, bigint],
  token0: string,
  usdcAddress: string,
  mtkAddress: string,
  currentPrice: number
): number {
  if (!reserves || !token0) return 0;
  
  const isUSDC0 = token0.toLowerCase() === usdcAddress.toLowerCase();
  const reserveUSDC = isUSDC0 ? reserves[0] : reserves[1];
  const reserveMTK = isUSDC0 ? reserves[1] : reserves[0];
  
  // Convert reserves to human-readable numbers
  const usdcAmount = formatTokenValue(reserveUSDC, TOKEN_DECIMALS.USDC);
  const mtkAmount = formatTokenValue(reserveMTK, TOKEN_DECIMALS.MTK);
  
  // TVL = USDC amount + (MTK amount * price of MTK in USDC)
  const tvl = usdcAmount + (mtkAmount * currentPrice);
  
  return tvl;
}

/**
 * Calculate 24h trading volume from swap events
 */
export function calculate24hVolume(
  swapEvents: any[],
  token0: string,
  usdcAddress: string,
  mtkAddress: string
): number {
  if (!swapEvents || swapEvents.length === 0) return 0;
  
  let totalUSDCVolume = 0;
  
  swapEvents.forEach((log) => {
    const amount0In = log.args?.amount0In || BigInt(0);
    const amount0Out = log.args?.amount0Out || BigInt(0);
    const amount1In = log.args?.amount1In || BigInt(0);
    const amount1Out = log.args?.amount1Out || BigInt(0);
    
    const isUSDC0 = token0?.toLowerCase() === usdcAddress.toLowerCase();
    
    let usdcAmount: number;
    if (isUSDC0) {
      // token0 is USDC
      usdcAmount = formatTokenValue(amount0In + amount0Out, TOKEN_DECIMALS.USDC);
    } else {
      // token1 is USDC
      usdcAmount = formatTokenValue(amount1In + amount1Out, TOKEN_DECIMALS.USDC);
    }
    
    totalUSDCVolume += usdcAmount;
  });
  
  return totalUSDCVolume;
}
