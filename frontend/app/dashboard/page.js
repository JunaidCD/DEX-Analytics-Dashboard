'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, usePublicClient, useChainId } from 'wagmi';
import { parseUnits, formatUnits, parseEventLogs } from 'viem';
import { CHAIN_CONTRACTS, getChainContracts } from '../../config/wagmi';
import { ERC20_ABI, ROUTER_ABI, PAIR_ABI, FACTORY_ABI } from '../../config/abis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TradeHistory from '../../components/TradeHistory';

// Import utility functions
import { formatTokenValue, formatUSD, formatNumber, formatPercentage, formatPrice, TOKEN_DECIMALS } from '../../utils/formatToken';
import { calculateCurrentPrice, calculatePriceFromSwap } from '../../utils/calculatePrice';
import { calculateTVL, calculate24hVolume } from '../../utils/calculateTVL';
import { calculateImpermanentLoss, calculateLPPnL } from '../../utils/calculateImpermanentLoss';

// Swap Event ABI for parsing logs (from Pair contract)
const SWAP_EVENT_ABI = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'sender', type: 'address' },
    { indexed: false, name: 'amount0In', type: 'uint256' },
    { indexed: false, name: 'amount1In', type: 'uint256' },
    { indexed: false, name: 'amount0Out', type: 'uint256' },
    { indexed: false, name: 'amount1Out', type: 'uint256' },
    { indexed: true, name: 'to', type: 'address' }
  ],
  name: 'Swap',
  type: 'event'
};

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  const [slippageInput, setSlippageInput] = useState('100');
  const [lpAmount, setLpAmount] = useState('10');
  const [priceHistory, setPriceHistory] = useState([]);
  const [swapEvents, setSwapEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Get contract addresses for current chain
  const activeContracts = getChainContracts(chainId);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get pair address
  const { data: pairAddress } = useReadContract({
    address: activeContracts.factory,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [activeContracts.USDC, activeContracts.MTK].sort(),
  });

  // Get reserves
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: 'getReserves',
    query: { enabled: !!pairAddress }
  });

  // Get token0 to determine order
  const { data: token0 } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: 'token0',
    query: { enabled: !!pairAddress }
  });

  // Get user's LP balance
  const { data: lpBalance } = useReadContract({
    address: pairAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && address && !!pairAddress }
  });

  // Fetch swap events from the blockchain
  useEffect(() => {
    async function fetchSwapEvents() {
      if (!publicClient || !pairAddress) return;
      
      setLoadingEvents(true);
      try {
        const logs = await publicClient.getLogs({
          address: pairAddress,
          event: SWAP_EVENT_ABI,
          fromBlock: 0n,
          toBlock: 'latest',
        });
        
        setSwapEvents(logs);
        
          // Process swap events to get price history
          if (logs.length > 0 && reserves && token0) {
            const isUSDC0 = token0.toLowerCase() === activeContracts.USDC.toLowerCase();
            
            // Get last 7 swaps for price history
            const recentSwaps = logs.slice(-7);
            const history = recentSwaps.map((log, i) => {
              const amount0In = log.args.amount0In || BigInt(0);
              const amount1In = log.args.amount1In || BigInt(0);
              const amount0Out = log.args.amount0Out || BigInt(0);
              const amount1Out = log.args.amount1Out || BigInt(0);
              
              // Use utility function to calculate price
              const price = calculatePriceFromSwap(
                amount0In, amount0Out, amount1In, amount1Out,
                token0, activeContracts.USDC, activeContracts.MTK
              );
              
              return {
                time: `T${i + 1}`,
                price: price,
                swap: true
              };
            });
            
            setPriceHistory(history);
          } else {
            // No swap events found - show empty state
            setPriceHistory([]);
          }
      } catch (error) {
        console.log('Error fetching swap events:', error);
        // No mock data - show empty state
        setPriceHistory([]);
      } finally {
        setLoadingEvents(false);
      }
    }
    
    if (mounted && pairAddress) {
      fetchSwapEvents();
    }
  }, [mounted, pairAddress, publicClient, reserves, token0]);

  // Calculate current price using utility function
  const currentPrice = useMemo(() => {
    if (!reserves || !token0) return 0;
    return calculateCurrentPrice(reserves, token0, activeContracts.USDC, activeContracts.MTK);
  }, [reserves, token0, activeContracts]);

  // Calculate slippage impact using proper token normalization
  const slippageImpact = useMemo(() => {
    if (!slippageInput || !reserves || !token0) return { impact: 0, output: 0 };
    
    const amountIn = parseUnits(slippageInput, 6);
    const isUSDC0 = token0.toLowerCase() === activeContracts.USDC.toLowerCase();
    const reserveIn = isUSDC0 ? reserves[0] : reserves[1];
    const reserveOut = isUSDC0 ? reserves[1] : reserves[0];
    
    if (reserveIn <= BigInt(0) || reserveOut <= BigInt(0)) return { impact: 0, output: 0 };
    
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * BigInt(1000) + amountInWithFee;
    const output = numerator / denominator;
    
    // Convert to human-readable numbers for price calculation
    const spotPrice = formatTokenValue(reserveOut, TOKEN_DECIMALS.USDC) / formatTokenValue(reserveIn, TOKEN_DECIMALS.MTK);
    const actualPrice = formatTokenValue(output, TOKEN_DECIMALS.MTK) / formatTokenValue(amountIn, TOKEN_DECIMALS.USDC);
    const impact = spotPrice > 0 ? ((spotPrice - actualPrice) / spotPrice) * 100 : 0;
    
    return {
      impact: Number(impact),
      output: formatTokenValue(output, TOKEN_DECIMALS.MTK),
    };
  }, [slippageInput, reserves, token0, activeContracts]);

  // Calculate LP PnL using utility function
  const lpPnL = useMemo(() => {
    if (!lpAmount || !reserves || !token0 || !lpBalance) {
      return { impermanentLoss: 0, feesEarned: 0, totalPnL: 0, currentValue: 0, initialValue: 0 };
    }

    // Use current reserves as both current and initial for simplicity
    // In a real app, you'd track initial reserves when LP was added
    const result = calculateLPPnL(
      Number(lpAmount),
      reserves,
      reserves, // Using same reserves for simplicity
      token0,
      activeContracts.USDC,
      activeContracts.MTK,
      currentPrice
    );
    
    return result;
  }, [lpAmount, reserves, token0, currentPrice, lpBalance, activeContracts]);

  // Calculate 24h volume using utility function
  const volume24h = useMemo(() => {
    const volume = calculate24hVolume(swapEvents, token0, activeContracts.USDC, activeContracts.MTK);
    return formatNumber(volume, 2);
  }, [swapEvents, token0, activeContracts]);

  // Calculate TVL using utility function
  const poolTVL = useMemo(() => {
    if (!reserves || !token0) return 0;
    return calculateTVL(reserves, token0, activeContracts.USDC, activeContracts.MTK, currentPrice);
  }, [reserves, token0, currentPrice, activeContracts]);

  if (!mounted) {
    return (
      <div>
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card">
              <div className="stat-label">Loading...</div>
              <div className="stat-value">--</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {!isConnected ? (
        <div className="not-connected">
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to view your dashboard and track your positions.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-label">Current Price (USDC/MTK)</div>
              <div className="stat-value">{formatPrice(currentPrice)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">24h Trading Volume</div>
              <div className="stat-value positive">{formatUSD(Number(volume24h.replace(/[^0-9.]/g, '')))}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Your LP Balance</div>
              <div className="stat-value">{lpBalance ? formatNumber(formatTokenValue(lpBalance, TOKEN_DECIMALS.MTK), 4) : '0'} LP</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pool TVL</div>
              <div className="stat-value">
                {formatUSD(poolTVL)}
              </div>
            </div>
          </div>

          {/* Price Chart - from Swap Events */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>📈 Price from Swap Events</h3>
              {loadingEvents && <span className="loading-badge">Loading...</span>}
              {swapEvents.length > 0 && <span className="event-badge">{swapEvents.length} swaps</span>}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="time" stroke="#9090a0" />
                <YAxis stroke="#9090a0" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name, props) => [`$${value.toFixed(2)}`, props.payload.swap ? 'Swap Price' : 'Est. Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
            {priceHistory.length === 0 && (
              <div className="empty-chart-state">
                <p>No swap events found. Make some swaps to see the price chart!</p>
              </div>
            )}
          </div>

          {/* Slippage Estimator */}
          <div className="analytics-section">
            <div className="analytics-card">
              <h3>🔮 Slippage Estimator</h3>
              <p className="analytics-desc">Calculate price impact using AMM formula</p>
              
              <div className="input-group">
                <label>Swap Amount (USDC)</label>
                <input
                  type="number"
                  value={slippageInput}
                  onChange={(e) => setSlippageInput(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="analytics-result">
                <div className="result-row">
                  <span>Estimated Output:</span>
                  <span className="result-value">{formatNumber(slippageImpact.output, 4)} MTK</span>
                </div>
                <div className="result-row">
                  <span>Price Impact:</span>
                  <span className={`result-value ${slippageImpact.impact > 5 ? 'text-error' : slippageImpact.impact > 1 ? 'text-warning' : 'text-success'}`}>
                    {formatPercentage(slippageImpact.impact)}
                  </span>
                </div>
                <div className="result-row">
                  <span>Slippage (0.3%):</span>
                  <span className="result-value">{formatNumber(slippageImpact.output * 0.003, 4)} MTK</span>
                </div>
              </div>
            </div>

            {/* LP PnL Calculator */}
            <div className="analytics-card">
              <h3>📊 LP PnL Calculator</h3>
              <p className="analytics-desc">Calculate impermanent loss + fees earned</p>
              
              <div className="input-group">
                <label>LP Token Amount</label>
                <input
                  type="number"
                  value={lpAmount}
                  onChange={(e) => setLpAmount(e.target.value)}
                  placeholder="Enter LP tokens"
                />
              </div>
              
              <div className="analytics-result">
                <div className="result-row">
                  <span>Impermanent Loss:</span>
                  <span className={`result-value ${lpPnL.impermanentLoss >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatPercentage(lpPnL.impermanentLoss)}
                  </span>
                </div>
                <div className="result-row">
                  <span>Fees Earned (est.):</span>
                  <span className="result-value text-success">{formatUSD(lpPnL.feesEarned)}</span>
                </div>
                <div className="result-row total">
                  <span>Total PnL:</span>
                  <span className={`result-value ${lpPnL.totalPnL >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatPercentage(lpPnL.totalPnL)}
                  </span>
                </div>
              </div>
              
              <div className="pnl-note">
                * Fees estimated at 0.3% trading fee
              </div>
            </div>
          </div>

          {/* Top Pools */}
          <div className="pools-list">
            <h3>🏊 Top Pools</h3>
            <div className="pool-item">
              <div className="pool-tokens">
                <div className="pool-token-icons">
                  <div className="pool-token-icon">U</div>
                  <div className="pool-token-icon">M</div>
                </div>
                <div>
                  <div className="pool-name">USDC/MTK</div>
                  <div className="pool-fee">Fee: 0.3%</div>
                </div>
              </div>
              <div className="pool-tvl">
                <div className="pool-tvl-value">
                  {formatUSD(poolTVL)}
                </div>
                <div className="pool-tvl-change">+2.4%</div>
              </div>
            </div>
          </div>

          {/* Trade History */}
          <TradeHistory pairAddress={pairAddress} token0={token0} chainId={chainId} />
        </>
      )}
    </div>
  );
}
