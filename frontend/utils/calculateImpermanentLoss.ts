import { formatTokenValue, TOKEN_DECIMALS } from './formatToken';

/**
 * Calculate impermanent loss using the standard formula
 * IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
 */
export function calculateImpermanentLoss(initialPrice: number, currentPrice: number): number {
  if (initialPrice <= 0 || currentPrice <= 0) return 0;
  
  const priceRatio = currentPrice / initialPrice;
  const sqrtPriceRatio = Math.sqrt(priceRatio);
  
  // Standard impermanent loss formula
  const il = (2 * sqrtPriceRatio) / (1 + priceRatio) - 1;
  
  // Return as percentage
  return il * 100;
}

/**
 * Calculate LP PnL (Impermanent Loss + Fees)
 */
export function calculateLPPnL(
  lpTokenAmount: number,
  currentReserves: [bigint, bigint],
  initialReserves: [bigint, bigint],
  token0: string,
  usdcAddress: string,
  mtkAddress: string,
  currentPrice: number,
  totalSupply: bigint = BigInt('1000000000000000000000') // 1000 LP tokens with 18 decimals
): {
  impermanentLoss: number;
  feesEarned: number;
  totalPnL: number;
  currentValue: number;
  initialValue: number;
} {
  if (!lpTokenAmount || !currentReserves || !initialReserves) {
    return {
      impermanentLoss: 0,
      feesEarned: 0,
      totalPnL: 0,
      currentValue: 0,
      initialValue: 0,
    };
  }

  // Convert LP token amount to proper units
  const lpTokens = lpTokenAmount * Math.pow(10, TOKEN_DECIMALS.MTK);
  
  // Calculate user's share of the pool
  const userShare = lpTokens / Number(totalSupply);
  
  // Current pool values (normalized)
  const isUSDC0 = token0.toLowerCase() === usdcAddress.toLowerCase();
  const currentReserveUSDC = isUSDC0 ? currentReserves[0] : currentReserves[1];
  const currentReserveMTK = isUSDC0 ? currentReserves[1] : currentReserves[0];
  
  const currentUSDCValue = formatTokenValue(currentReserveUSDC, TOKEN_DECIMALS.USDC);
  const currentMTKValue = formatTokenValue(currentReserveMTK, TOKEN_DECIMALS.MTK);
  
  // Initial pool values (normalized)
  const initialReserveUSDC = isUSDC0 ? initialReserves[0] : initialReserves[1];
  const initialReserveMTK = isUSDC0 ? initialReserves[1] : initialReserves[0];
  
  const initialUSDCValue = formatTokenValue(initialReserveUSDC, TOKEN_DECIMALS.USDC);
  const initialMTKValue = formatTokenValue(initialReserveMTK, TOKEN_DECIMALS.MTK);
  
  // Calculate user's holdings
  const currentUSDCShare = currentUSDCValue * userShare;
  const currentMTKShare = currentMTKValue * userShare;
  const currentValue = currentUSDCShare + (currentMTKShare * currentPrice);
  
  const initialUSDCShare = initialUSDCValue * userShare;
  const initialMTKShare = initialMTKValue * userShare;
  const initialValue = initialUSDCShare + (initialMTKShare * currentPrice);
  
  // Calculate impermanent loss
  const impermanentLoss = initialValue > 0 ? ((currentValue / initialValue) - 1) * 100 : 0;
  
  // Estimate fees (0.3% of trading volume * user's share)
  // This is a simplified calculation - in reality, fees are proportional to volume
  const estimatedFees = currentValue * 0.003 * 0.1; // Assuming 10% of pool value as fees estimate
  
  return {
    impermanentLoss,
    feesEarned: estimatedFees,
    totalPnL: impermanentLoss + (estimatedFees / initialValue * 100),
    currentValue,
    initialValue,
  };
}
