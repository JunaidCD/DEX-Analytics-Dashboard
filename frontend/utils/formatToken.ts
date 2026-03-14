import { formatUnits } from 'viem';

// Token decimals constants
export const TOKEN_DECIMALS = {
  USDC: 6,
  MTK: 18,
  ETH: 18,
} as const;

/**
 * Format raw blockchain value to human-readable number
 */
export function formatTokenValue(rawValue: bigint, decimals: number): number {
  if (!rawValue) return 0;
  return Number(formatUnits(rawValue, decimals));
}

/**
 * Format USD value with proper formatting
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format price with proper decimal places
 */
export function formatPrice(value: number, decimals: number = 2): string {
  return `$${value.toFixed(decimals)}`;
}
